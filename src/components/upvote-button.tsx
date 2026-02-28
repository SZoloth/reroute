"use client";

import { useState } from "react";

export function UpvoteButton({
  spotId,
  initialUpvotes,
  initiallyVoted = false,
}: {
  spotId: string;
  initialUpvotes: number;
  initiallyVoted?: boolean;
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [voted, setVoted] = useState(initiallyVoted);

  async function toggleVote() {
    const response = await fetch(`/api/spots/${spotId}/vote`, { method: "POST" });
    if (!response.ok) return;

    const payload = (await response.json()) as { voted: boolean };
    setVoted(payload.voted);
    setUpvotes((value) => (payload.voted ? value + 1 : Math.max(0, value - 1)));
  }

  return (
    <button
      onClick={toggleVote}
      className={`rounded-lg border px-3 py-1 text-xs ${
        voted ? "border-fuchsia-400 text-fuchsia-200" : "border-zinc-700 text-zinc-400"
      }`}
    >
      ▲ {upvotes}
    </button>
  );
}
