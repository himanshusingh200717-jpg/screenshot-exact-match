
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
const supabaseKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;

export function checkIsSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.trim() !== "" &&
    supabaseKey.trim() !== "" &&
    !supabaseUrl.includes("placeholder")
  );
}

export const isSupabaseConfigured = checkIsSupabaseConfigured();

if (!isSupabaseConfigured) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Check your .env file."
  );
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase credentials are missing. Check your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl.trim(),
  supabaseKey.trim()
);
