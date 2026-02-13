"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface HeaderProps {
    email: string;
}

export default function Header({ email }: HeaderProps) {
    const router = useRouter();
    const supabase = getSupabaseBrowser();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Mark<span className="text-indigo-400">It</span>
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 hidden sm:inline">
                        {email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </header>
    );
}
