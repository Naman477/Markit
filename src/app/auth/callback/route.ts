import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

// After the user finishes the Google OAuth consent screen (or clicks the
// email-confirm link), Supabase redirects here with a `code` query param.
// We swap that code for a session, then send the user to the dashboard.

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await getSupabaseServer();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Something went wrong — drop them back to login
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
