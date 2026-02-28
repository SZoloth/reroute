"use client";

import { useState } from "react";

export function SettingsClient({
  initialBudget,
  initialCity,
}: {
  initialBudget: number;
  initialCity: string;
}) {
  const [budget, setBudget] = useState(initialBudget || 20);
  const [city, setCity] = useState(initialCity);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    const response = await fetch("/api/profile/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ budgetMax: budget, city }),
    });

    setStatus(response.ok ? "Saved" : "Could not save settings");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <label className="text-sm text-zinc-300">
        Budget max: ${budget}
        <input
          type="range"
          min={5}
          max={50}
          value={budget}
          onChange={(event) => setBudget(Number(event.target.value))}
          className="mt-2 w-full"
        />
      </label>

      <label className="text-sm text-zinc-300">
        City override
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
          placeholder="Denver"
        />
      </label>

      <button onClick={save} className="rounded-xl border border-zinc-700 px-4 py-3 text-sm">
        Save settings
      </button>

      {status && <p className="text-sm text-zinc-400">{status}</p>}
    </main>
  );
}
