"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { ReportSpotButton } from "@/components/report-spot-button";
import { SignInButton } from "@/components/auth/sign-in-button";
import { getLyftWebFallback, getUberWebFallback } from "@/lib/ride-links";

type SpotPayload = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
};

type Stage = "idle" | "loading" | "revealed";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HomeClient() {
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("idle");
  const [spot, setSpot] = useState<SpotPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [rerollCount, setRerollCount] = useState(0);

  const isLoading = stage === "loading";
  const isRevealed = stage === "revealed" && Boolean(spot);
  const rerollDisabled = rerollCount >= 1;

  const buttonLabel = useMemo(() => {
    if (isLoading) return "Choosing…";
    return "reroute me";
  }, [isLoading]);

  async function requestReroute(options?: { isReroll?: boolean; excludeSpotId?: string }) {
    const isReroll = options?.isReroll ?? false;
    if (isReroll && rerollDisabled) return;

    if (!isReroll) setRerollCount(0);

    setError(null);
    setIsAuthError(false);
    setStage("loading");

    const minDelay = new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 0 : 900));

    try {
      const [response] = await Promise.all([
        fetch("/api/reroute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            excludeSpotId: options?.excludeSpotId,
            rerollCount: isReroll ? rerollCount + 1 : 0,
          }),
        }),
        minDelay,
      ]);

      const payload = (await response.json()) as { error?: string; message?: string; spot?: SpotPayload };

      if (!response.ok || !payload.spot) {
        setSpot(null);
        setStage("idle");
        setIsAuthError(response.status === 401);
        setError(payload.message ?? payload.error ?? "Couldn’t pick a destination right now.");
        return;
      }

      setSpot(payload.spot);
      setStage("revealed");
      if (isReroll) setRerollCount((count) => count + 1);
    } catch {
      setSpot(null);
      setStage("idle");
      setError("Network hiccup. Try again.");
    }
  }

  function dismissReveal() {
    setStage("idle");
    setSpot(null);
    setError(null);
    setRerollCount(0);
  }

  async function onRideClick(provider: "uber" | "lyft") {
    if (!spot) return;

    await fetch("/api/trips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ spotId: spot.id, status: "ride_clicked" }),
    });

    if (typeof spot.latitude !== "number" || typeof spot.longitude !== "number") {
      return;
    }

    const href =
      provider === "uber"
        ? getUberWebFallback(spot.latitude, spot.longitude, spot.name)
        : getLyftWebFallback(spot.latitude, spot.longitude);

    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <LayoutGroup>
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#050507] text-zinc-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(244,63,94,0.16),transparent_42%),radial-gradient(circle_at_85%_90%,rgba(59,130,246,0.12),transparent_38%)]" />

        <header className="z-10 flex items-center justify-between px-5 pt-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">reroute</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Denver</p>
        </header>

        <section className="z-10 flex flex-1 flex-col items-center justify-center px-6">
          <AnimatePresence mode="wait" initial={false}>
            {!isRevealed ? (
              <motion.button
                key="reroute-button"
                layoutId="reroute-core"
                onClick={() => requestReroute()}
                disabled={isLoading}
                className="relative h-64 w-64 rounded-full border border-zinc-100/15 bg-zinc-900/70 shadow-[0_0_80px_rgba(244,63,94,0.25)] backdrop-blur disabled:cursor-wait disabled:opacity-80"
                initial={{ opacity: 0.8, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.5, scale: 0.9 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: EASE }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                aria-label={buttonLabel}
              >
                <span className="relative flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight text-zinc-50">
                  {buttonLabel}
                </span>
              </motion.button>
            ) : (
              <motion.div key="button-placeholder" className="h-64 w-64" />
            )}
          </AnimatePresence>

          <p className="mt-5 text-center text-sm text-zinc-400">One tap. No overthinking.</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: EASE }}
                className="mt-4 space-y-3 text-center"
              >
                <p className="max-w-sm text-sm text-rose-300">{error}</p>
                {isAuthError && <SignInButton />}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section aria-hidden={!isRevealed} className={`fixed inset-x-0 bottom-0 z-20 px-3 pb-3 ${isRevealed ? "pointer-events-auto" : "pointer-events-none"}`}>
          <motion.div
            className="rounded-3xl border border-zinc-100/10 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur"
            initial={false}
            animate={{ y: isRevealed ? 0 : 480, opacity: isRevealed ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.42, ease: EASE }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-[0.16em] text-zinc-400">Destination</h2>
              <button
                onClick={dismissReveal}
                className="rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Dismiss
              </button>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <motion.div
                layoutId="reroute-core"
                className="h-12 w-12 rounded-full border border-zinc-100/20 bg-zinc-900/80"
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: EASE }}
              />
              <p className="text-sm text-zinc-300">Your random destination is ready.</p>
            </div>

            <p className="text-2xl font-semibold leading-tight text-zinc-50">{spot?.name}</p>
            {spot?.category && (
              <p className="mt-2 text-sm uppercase tracking-[0.12em] text-fuchsia-300">{spot.category}</p>
            )}
            {spot?.description && <p className="mt-3 text-sm leading-6 text-zinc-300">{spot.description}</p>}

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-xl bg-zinc-100 px-4 py-3 text-center text-sm font-semibold text-zinc-900"
                onClick={() => onRideClick("uber")}
              >
                Uber
              </button>
              <button
                className="flex-1 rounded-xl border border-zinc-600 px-4 py-3 text-center text-sm font-semibold text-zinc-100 hover:border-zinc-300"
                onClick={() => onRideClick("lyft")}
              >
                Lyft
              </button>
            </div>

            <button
              onClick={() => requestReroute({ isReroll: true, excludeSpotId: spot?.id })}
              disabled={rerollDisabled || isLoading}
              className="mt-3 w-full rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {rerollDisabled ? "Re-roll used" : "Re-roll once"}
            </button>

            {spot?.id && <ReportSpotButton spotId={spot.id} />}
          </motion.div>
        </section>
      </main>
    </LayoutGroup>
  );
}
