"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            const supabase = getSupabaseBrowser();
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            router.push("/dashboard");
            router.refresh();
        },
        [email, password, router]
    );

    const handleGoogleLogin = useCallback(async () => {
        setError(null);

        const supabase = getSupabaseBrowser();
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (oauthError) {
            setError(oauthError.message);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
            <div className="w-full max-w-md">
                {/* brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Mark<span className="text-indigo-400">It</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Your bookmarks, always in sync.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        Welcome back
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    {/* divider */}
                    <div className="flex items-center gap-3 my-6">
                        <span className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-slate-500 uppercase">or</span>
                        <span className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* google */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
