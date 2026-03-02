import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <main className="px-6 py-10 text-zinc-100">Sign in to view profile.</main>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, city")
    .eq("id", user.id)
    .maybeSingle<{ name: string | null; city: string | null }>();

  const { count } = await supabase
    .from("trips")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);

  const { data: pendingSpots } = await supabase
    .from("spots")
    .select("id, name")
    .eq("submitted_by", user.id)
    .eq("status", "pending")
    .returns<Array<{ id: string; name: string }>>();

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">{profile?.name ?? user.email ?? "Profile"}</h1>
      <p className="mt-1 text-sm text-zinc-400">{profile?.city ?? "No city set"}</p>
      <p className="mt-3 text-sm text-zinc-300">rerouted {count ?? 0} times</p>

      <section className="mt-6">
        <h2 className="text-sm uppercase tracking-[0.12em] text-zinc-500">Pending Spots</h2>
        <ul className="mt-2 space-y-2">
          {(pendingSpots ?? []).map((spot) => (
            <li key={spot.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm">
              {spot.name}
            </li>
          ))}
          {(pendingSpots?.length ?? 0) === 0 && (
            <li className="text-sm text-zinc-500">No pending spots.</li>
          )}
        </ul>
      </section>

      <div className="mt-8 flex items-center gap-4">
        <Link href="/settings" className="text-sm text-zinc-400 hover:text-zinc-100">
          Settings
        </Link>
        <SignOutButton />
      </div>
    </main>
  );
}
