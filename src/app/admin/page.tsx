import { createClient } from "@/lib/supabase/server";

import { ModerationList } from "./moderation-list";

type PendingSpot = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  status: "approved" | "pending" | "rejected";
};

type SpotReport = {
  id: string;
  reason: string;
  created_at: string;
  spots: { name: string } | null;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <main className="px-6 py-10 text-zinc-100">Unauthorized</main>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<{ is_admin: boolean }>();

  if (!profile?.is_admin) {
    return <main className="px-6 py-10 text-zinc-100">Forbidden</main>;
  }

  const { data: pendingSpots } = await supabase
    .from("spots")
    .select("id, name, description, category, latitude, longitude, status")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .returns<PendingSpot[]>();

  const { data: reports } = await supabase
    .from("spot_reports")
    .select("id, reason, created_at, spots(name)")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<SpotReport[]>();

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">Moderation</h1>
      <ModerationList spots={pendingSpots ?? []} />

      <section className="mt-8">
        <h2 className="text-sm uppercase tracking-[0.14em] text-zinc-500">Recent Reports</h2>
        <div className="mt-3 space-y-2">
          {(reports ?? []).map((report) => (
            <article key={report.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
              <p className="text-zinc-300">{report.spots?.name ?? "Unknown spot"}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {report.reason} · {new Date(report.created_at).toLocaleString()}
              </p>
            </article>
          ))}

          {(reports?.length ?? 0) === 0 && (
            <p className="text-sm text-zinc-500">No reports yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
