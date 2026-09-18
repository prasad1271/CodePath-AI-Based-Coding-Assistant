import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://zwagbbmxckiinpacawkr.supabase.co";

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_ZyOP2Eu5R4C1cMDLhPWjXw_BqUMOCcK";

  return createBrowserClient(supabaseUrl, supabaseKey);
}

