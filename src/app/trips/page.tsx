import { createClient } from "@/lib/supabase/server";

import { TripCard } from "./trip-card";

type TripRow = {
  id: string;
  created_at: string;
  rating: number | null;
  notes: string | null;
  is_public: boolean;
  spots: {
    name: string;
    category: string;
    description: string | null;
  } | null;
};

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <main className="px-6 py-10 text-zinc-100">Sign in to view trips.</main>;
  }

  const { data } = await supabase
    .from("trips")
    .select("id, created_at, rating, notes, is_public, spots(name, category, description)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<TripRow[]>();

  const trips = data ?? [];

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">My Trips</h1>
      <p className="mt-1 text-sm text-zinc-400">Kidnapped {trips.length} times</p>

      <div className="mt-6 space-y-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}

        {trips.length === 0 && (
          <p className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">
            No trips yet. Press the button.
          </p>
        )}
      </div>
    </main>
  );
}
