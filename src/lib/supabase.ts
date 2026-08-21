import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://oejrrmtnluefhttqnutn.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanJybXRubHVlZmh0dHFudXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQyOTMsImV4cCI6MjEwMjEzMDI5M30.Tsyw3Oop55LzVocGRG-fqCcXJ-LAxjQtxZ2atFD-IEE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

