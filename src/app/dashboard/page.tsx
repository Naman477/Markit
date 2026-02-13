import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import BookmarkList from "@/components/BookmarkList";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

// Quick type so we don't repeat ourselves
export interface Bookmark {
    id: string;
    url: string;
    title: string;
    created_at: string;
}

export default async function DashboardPage() {
    const supabase = await getSupabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Pull in the initial batch on the server so the page isn't blank
    // while the realtime channel connects.
    const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            <Header email={user.email ?? "User"} />

            <main className="max-w-3xl mx-auto px-4 py-10">
                <BookmarkList
                    initialBookmarks={(bookmarks as Bookmark[]) ?? []}
                    userId={user.id}
                />
            </main>
        </div>
    );
}
