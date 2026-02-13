import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Already logged in? Skip straight to the dashboard.
    if (user) redirect("/dashboard");
  } catch {
    // If auth check fails, just show the landing page
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 text-center">
      {/* glow blob behind the heading — purely decorative */}
      <div className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight relative z-10">
        Mark<span className="text-indigo-400">It</span>
      </h1>

      <p className="mt-4 text-lg text-slate-400 max-w-md relative z-10">
        Save your favourite links and access them from anywhere.
        Real-time sync — no refresh needed.
      </p>

      <div className="mt-8 flex gap-4 relative z-10">
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Create account
        </Link>
      </div>

      <footer className="absolute bottom-6 text-xs text-slate-600">
        Built with Next.js, Supabase &amp; Tailwind CSS
      </footer>
    </div>
  );
}
