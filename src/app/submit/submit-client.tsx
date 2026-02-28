"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  description: string;
  category: string;
  address: string;
  hours: string;
  tags: string;
};

const categories = [
  "food",
  "outdoors",
  "culture",
  "nightlife",
  "weird",
  "hidden-gem",
  "historic",
  "activity",
];

export function SubmitClient() {
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    category: "food",
    address: "",
    hours: "",
    tags: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let geo: Array<{ lat: string; lon: string; display_name: string }> = [];

    try {
      geo = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(form.address)}`,
        {
          headers: {
            "accept-language": "en",
          },
          signal: controller.signal,
        },
      ).then((response) =>
        response.json() as Promise<Array<{ lat: string; lon: string; display_name: string }>>,
      );
    } catch {
      setStatus("Could not geocode address");
      return;
    } finally {
      clearTimeout(timeout);
    }

    const first = geo[0];
    if (!first) {
      setStatus("Could not geocode address");
      return;
    }

    const parts = first.display_name.split(",").map((part) => part.trim());
    const city = parts.find((part) => /^[A-Za-z\s-]+$/.test(part)) ?? "Denver";

    const response = await fetch("/api/spots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        category: form.category,
        latitude: Number(first.lat),
        longitude: Number(first.lon),
        city,
        hours: form.hours ? { text: form.hours } : null,
        tags: form.tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      }),
    });

    setStatus(response.ok ? "Spot submitted for review!" : "Submission failed");
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">Submit a Spot</h1>

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        />

        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-24 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        />

        <select
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          required
          placeholder="Address"
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        />

        <input
          placeholder="Hours"
          value={form.hours}
          onChange={(event) => setForm((prev) => ({ ...prev, hours: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        />

        <input
          placeholder="Tags (comma-separated)"
          value={form.tags}
          onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        />

        <button className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm">Submit</button>
      </form>

      {status && <p className="mt-3 text-sm text-zinc-400">{status}</p>}
    </main>
  );
}
