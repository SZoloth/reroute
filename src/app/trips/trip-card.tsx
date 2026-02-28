"use client";

import { useState } from "react";

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

export function TripCard({ trip }: { trip: TripRow }) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(trip.rating ?? 0);
  const [notes, setNotes] = useState(trip.notes ?? "");
  const [isPublic, setIsPublic] = useState(trip.is_public);

  async function patch(updates: Record<string, unknown>) {
    await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    });
  }

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <button className="w-full text-left" onClick={() => setExpanded((value) => !value)}>
        <p className="font-medium text-zinc-100">{trip.spots?.name ?? "Unknown spot"}</p>
        <p className="text-xs text-zinc-500">{new Date(trip.created_at).toLocaleString()}</p>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <p>{trip.spots?.description}</p>

          <label className="block">
            Rating (1-5)
            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              onBlur={() => patch({ rating })}
              className="mt-1 w-full rounded border border-zinc-700 bg-black px-2 py-1"
            />
          </label>

          <label className="block">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => patch({ notes })}
              className="mt-1 min-h-20 w-full rounded border border-zinc-700 bg-black px-2 py-1"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => {
                const value = event.target.checked;
                setIsPublic(value);
                void patch({ isPublic: value });
              }}
            />
            Public trip
          </label>
        </div>
      )}
    </article>
  );
}
