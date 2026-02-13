"use client";

import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Bookmark } from "@/app/dashboard/page";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Props {
    initialBookmarks: Bookmark[];
    userId: string;
}

export default function BookmarkList({ initialBookmarks, userId }: Props) {
    const supabase = getSupabaseBrowser();

    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<NodeJS.Timeout | null>(null);

    // ----- realtime -----
    useEffect(() => {
        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload: RealtimePostgresChangesPayload<Bookmark>) => {
                    if (payload.eventType === "INSERT") {
                        setBookmarks((prev) => {
                            // avoid duplicates (we may have already optimistically added it)
                            if (prev.some((b) => b.id === (payload.new as Bookmark).id))
                                return prev;
                            return [payload.new as Bookmark, ...prev];
                        });
                    }

                    if (payload.eventType === "DELETE") {
                        setBookmarks((prev) =>
                            prev.filter((b) => b.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, userId]);

    // ----- helpers -----
    function flash(msg: string) {
        setToast(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }

    async function addBookmark(e: React.FormEvent) {
        e.preventDefault();

        const trimmedUrl = url.trim();
        const trimmedTitle = title.trim();
        if (!trimmedUrl || !trimmedTitle) return;

        setSaving(true);

        const { error } = await supabase.from("bookmarks").insert({
            url: trimmedUrl,
            title: trimmedTitle,
            user_id: userId,
        });

        setSaving(false);

        if (error) {
            flash("Something went wrong. Try again.");
            return;
        }

        setUrl("");
        setTitle("");
        flash("Bookmark saved!");
    }

    async function removeBookmark(id: string) {
        // Optimistic delete — feels snappier
        setBookmarks((prev) => prev.filter((b) => b.id !== id));

        const { error } = await supabase.from("bookmarks").delete().eq("id", id);

        if (error) {
            // rollback if it failed
            flash("Couldn't delete. Refresh and try again.");
        } else {
            flash("Bookmark removed.");
        }
    }

    // ----- render -----
    return (
        <div className="space-y-8">
            {/* ---- add form ---- */}
            <form
                onSubmit={addBookmark}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg"
            >
                <h2 className="text-lg font-semibold text-white mb-4">
                    Add a bookmark
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="bm-title"
                            className="block text-sm text-slate-300 mb-1"
                        >
                            Title
                        </label>
                        <input
                            id="bm-title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My cool link"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="bm-url"
                            className="block text-sm text-slate-300 mb-1"
                        >
                            URL
                        </label>
                        <input
                            id="bm-url"
                            type="url"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                    {saving ? "Saving…" : "Save bookmark"}
                </button>
            </form>

            {/* ---- toast ---- */}
            {toast && (
                <div className="fixed bottom-6 right-6 bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg animate-fade-in z-50">
                    {toast}
                </div>
            )}

            {/* ---- list ---- */}
            {bookmarks.length === 0 ? (
                <p className="text-center text-slate-500 py-16">
                    No bookmarks yet. Add your first one above ↑
                </p>
            ) : (
                <ul className="space-y-3">
                    {bookmarks.map((bm) => (
                        <li
                            key={bm.id}
                            className="group bg-white/5 backdrop-blur border border-white/10 rounded-xl px-5 py-4 flex items-start justify-between gap-4 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="text-white font-medium truncate">{bm.title}</p>
                                <a
                                    href={bm.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 text-sm truncate block"
                                >
                                    {bm.url}
                                </a>
                            </div>

                            <button
                                onClick={() => removeBookmark(bm.id)}
                                className="shrink-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm border border-red-400/30 hover:border-red-400/60 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                aria-label={`Delete ${bm.title}`}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
