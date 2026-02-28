"use client";

import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function E2EAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus(error.message);
      return;
    }

    window.location.href = "/settings";
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10 text-zinc-100">
      <h1 className="text-2xl font-semibold">E2E Auth</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <button className="rounded border border-zinc-700 px-3 py-2 text-sm">Sign in</button>
      </form>
      {status && <p className="mt-3 text-xs text-rose-300">{status}</p>}
    </main>
  );
}
