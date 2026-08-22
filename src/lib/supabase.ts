import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://oejrrmtnluefhttqnutn.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanJybXRubHVlZmh0dHFudXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQyOTMsImV4cCI6MjEwMjEzMDI5M30.Tsyw3Oop55LzVocGRG-fqCcXJ-LAxjQtxZ2atFD-IEE';

export function getSupabaseCredentials() {
  const env = (import.meta as any).env || {};
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('tsr_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('tsr_supabase_key') : null;

  return {
    url: (storedUrl && storedUrl.trim()) || env.VITE_SUPABASE_URL || DEFAULT_URL,
    anonKey: (storedKey && storedKey.trim()) || env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY,
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
  if (typeof window !== 'undefined') {
    localStorage.setItem('tsr_supabase_url', url.trim());
    localStorage.setItem('tsr_supabase_key', anonKey.trim());
  }
  currentClient = createClient(url.trim(), anonKey.trim(), {
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
