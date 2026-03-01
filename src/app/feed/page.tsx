import { createClient } from "@/lib/supabase/server";

type FeedTripRow = {
  id: string;
  user_id: string;
  created_at: string;
  rating: number | null;
  notes: string | null;
  spots: { name: string; category: string } | null;
};

type PublicProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  city: string | null;
};

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <main className="px-6 py-10 text-zinc-100">Sign in to view feed.</main>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city")
    .eq("id", user.id)
    .maybeSingle<{ city: string | null }>();

  const city = profile?.city;

  const { data: tripRows } = await supabase
    .from("trips")
    .select("id, user_id, created_at, rating, notes, spots(name, category)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<FeedTripRow[]>();

  const userIds = Array.from(new Set((tripRows ?? []).map((row) => row.user_id)));

  const { data: publicProfiles } = userIds.length
    ? await supabase
        .from("public_profiles")
        .select("id, name, avatar_url, city")
        .in("id", userIds)
        .returns<PublicProfileRow[]>()
    : { data: [] as PublicProfileRow[] };

  const profileById = new Map((publicProfiles ?? []).map((profile) => [profile.id, profile]));

  const trips = (tripRows ?? [])
    .map((trip) => ({
      ...trip,
      profile: profileById.get(trip.user_id) ?? null,
    }))
    .filter((item) => !city || item.profile?.city === city);

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">Feed</h1>

      <div className="mt-6 space-y-3">
        {trips.map((trip) => (
          <article key={trip.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-300">
              {(trip.profile?.name ?? "Someone")} got rerouted to {trip.spots?.name}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{new Date(trip.created_at).toLocaleString()}</p>
            {trip.notes && <p className="mt-3 text-sm text-zinc-400">{trip.notes}</p>}
          </article>
        ))}

        {trips.length === 0 && (
          <p className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">
            No public trips yet in your city.
          </p>
        )}
      </div>
    </main>
  );
}
