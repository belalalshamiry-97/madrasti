import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const supabaseUrl = url && url.startsWith("http") ? url : "https://placeholder-project.supabase.co";
  const supabaseAnonKey = anonKey && anonKey.length > 10 ? anonKey : "placeholder-anon-key";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
