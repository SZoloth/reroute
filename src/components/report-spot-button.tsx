"use client";

import { useState } from "react";

const reasons = ["unsafe", "closed", "incorrect", "duplicate", "other"] as const;

type Reason = (typeof reasons)[number];

export function ReportSpotButton({ spotId }: { spotId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("incorrect");
  const [status, setStatus] = useState<string | null>(null);

  async function submitReport() {
    const response = await fetch(`/api/spots/${spotId}/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    setStatus(response.ok ? "Reported. Thanks." : "Could not submit report");
    if (response.ok) setOpen(false);
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((value) => !value)}
        className="text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
      >
        Report this spot
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <label className="text-xs text-zinc-400">
            Reason
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as Reason)}
              className="mt-1 w-full rounded border border-zinc-700 bg-black px-2 py-1 text-xs"
            >
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={submitReport}
            className="mt-2 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
          >
            Submit report
          </button>
        </div>
      )}

      {status && <p className="mt-2 text-xs text-zinc-500">{status}</p>}
    </div>
  );
}
