import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://oejrrmtnluefhttqnutn.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanJybXRubHVlZmh0dHFudXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQyOTMsImV4cCI6MjEwMjEzMDI5M30.Tsyw3Oop55LzVocGRG-fqCcXJ-LAxjQtxZ2atFD-IEE';

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return DEFAULT_URL;
  let url = rawUrl.trim();

  // If user pasted dashboard link like https://supabase.com/dashboard/project/oejrrmtnluefhttqnutn/...
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Remove trailing slashes and common api paths accidentally appended
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/auth\/v1\/?$/, '');

  // If user only typed project-ref like 'oejrrmtnluefhttqnutn'
  if (/^[a-z0-9]{20}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export function getSupabaseCredentials() {
  const env = (import.meta as any).env || {};
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('tsr_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('tsr_supabase_key') : null;

  const resolvedUrl = sanitizeSupabaseUrl(storedUrl || env.VITE_SUPABASE_URL || DEFAULT_URL);
  const resolvedKey = (storedKey && storedKey.trim()) || env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

  return {
    url: resolvedUrl,
    anonKey: resolvedKey,
    isCustom: !!(storedUrl || storedKey)
  };
}

let currentClient: SupabaseClient = createClient(
  getSupabaseCredentials().url,
  getSupabaseCredentials().anonKey,
  {
    db: { schema: 'public' },
    auth: { persistSession: true, autoRefreshToken: true }
  }
);

export function updateSupabaseCredentials(url: string, anonKey: string) {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = anonKey.trim();

  if (typeof window !== 'undefined') {
    localStorage.setItem('tsr_supabase_url', cleanUrl);
    localStorage.setItem('tsr_supabase_key', cleanKey);
  }
  currentClient = createClient(cleanUrl, cleanKey, {
    db: { schema: 'public' },
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return currentClient;
}

export function resetSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tsr_supabase_url');
    localStorage.removeItem('tsr_supabase_key');
  }
  const creds = getSupabaseCredentials();
  currentClient = createClient(creds.url, creds.anonKey, {
    db: { schema: 'public' },
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return currentClient;
}

// Proxy export to always use the current client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (currentClient as any)[prop];
  }
});
