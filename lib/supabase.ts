import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key);
}

export function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, key);
}