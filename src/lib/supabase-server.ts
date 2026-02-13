import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Called inside Server Components / Route Handlers.
// Each request gets its own client (cookies differ per request).
export async function getSupabaseServer() {
    const cookieStore = await cookies();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // setAll can throw when called from a Server Component
                    // (headers are read-only). That's fine — the middleware
                    // will handle the refresh instead.
                }
            },
        },
    });
}
