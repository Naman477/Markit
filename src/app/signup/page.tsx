"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function SignUpPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignUp = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (password !== confirmPw) {
                setError("Passwords don't match.");
                return;
            }

            if (password.length < 6) {
                setError("Password should be at least 6 characters.");
                return;
            }

            setLoading(true);

            const supabase = getSupabaseBrowser();
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            // Supabase might auto-confirm the user depending on project settings.
            // Either way, nudge them to the login page.
            router.push("/login?registered=1");
        },
        [email, password, confirmPw, router]
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Mark<span className="text-indigo-400">It</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Create your account</p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign up</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <label
                                htmlFor="signup-email"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Email
                            </label>
                            <input
                                id="signup-email"
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
                                htmlFor="signup-password"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="signup-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="signup-confirm"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Confirm password
                            </label>
                            <input
                                id="signup-confirm"
                                type="password"
                                required
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            {loading ? "Creating account…" : "Create account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
