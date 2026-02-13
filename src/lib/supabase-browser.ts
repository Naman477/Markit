import { createBrowserClient } from "@supabase/ssr";

// We keep a single shared instance so we don't spin up a new GoTrue
// client on every component re-render. Feels cleaner than a React
// context and works for our straightforward use-case.

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  client = createBrowserClient(url, key);

  return client;
}
