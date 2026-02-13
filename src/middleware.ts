import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// This middleware does two things:
// 1. Refreshes the auth token on every navigation (keeps session alive)
// 2. Bounces unauthenticated visitors away from /dashboard

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Mirror cookies onto the request so downstream code sees them
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );

                    // Also set them on the response so the browser stores them
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // getUser() also triggers a token refresh behind the scenes
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Lock down the dashboard
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        // Skip Next.js internals + static assets
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
