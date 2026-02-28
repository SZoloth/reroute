"use client";

export function ModerationList({
  spots,
}: {
  spots: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    latitude: number;
    longitude: number;
  }>;
}) {
  async function updateStatus(id: string, status: "approved" | "rejected") {
    await fetch(`/api/spots/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  }

  return (
    <div className="mt-6 space-y-3">
      {spots.map((spot) => (
        <article key={spot.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="font-medium">{spot.name}</p>
          <p className="mt-1 text-sm text-zinc-400">{spot.description}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {spot.category} · {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded-lg border border-emerald-700 px-3 py-1 text-xs"
              onClick={() => updateStatus(spot.id, "approved")}
            >
              Approve
            </button>
            <button
              className="rounded-lg border border-rose-700 px-3 py-1 text-xs"
              onClick={() => updateStatus(spot.id, "rejected")}
            >
              Reject
            </button>
          </div>
        </article>
      ))}

      {spots.length === 0 && <p className="text-sm text-zinc-500">No pending spots.</p>}
    </div>
  );
}
