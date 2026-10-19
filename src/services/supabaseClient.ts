import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ukuysytkxfjpltyuavvj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PVbLN4OJc_1r4ZoaWa2Aog_Y1GF-aUe'; // 👈 (Ya coloqué la estructura correcta lista para tu clave de Supabase)

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 15;

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;