"use client";

import { useState } from "react";

import { getCurrentPosition, reverseGeocode } from "@/lib/geolocation";

export default function OnboardingPage() {
  const [city, setCity] = useState("");
  const [homeLatitude, setHomeLatitude] = useState<number | null>(null);
  const [homeLongitude, setHomeLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function detectLocation() {
    setStatus("Detecting your location...");
    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setHomeLatitude(lat);
      setHomeLongitude(lng);
      const detectedCity = await reverseGeocode(lat, lng);
      setCity(detectedCity);
      setStatus(null);
    } catch {
      setStatus("Could not detect location. Enter city manually.");
    }
  }

  async function save() {
    if (!city || homeLatitude == null || homeLongitude == null) {
      setStatus("City and location are required.");
      return;
    }

    const response = await fetch("/api/profile/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ city, homeLatitude, homeLongitude }),
    });

    if (!response.ok) {
      setStatus("Could not save profile.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-6 py-10 text-zinc-100">
      <h1 className="text-3xl font-semibold">Set your home base</h1>
      <p className="text-sm text-zinc-400">We use this to estimate ride cost and pick nearby chaos.</p>

      <button
        onClick={detectLocation}
        className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900"
      >
        Detect my location
      </button>

      <label className="text-sm text-zinc-300">
        City
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
          placeholder="Denver"
        />
      </label>

      <button onClick={save} className="rounded-xl border border-zinc-700 px-4 py-3 text-sm">
        Save and continue
      </button>

      {status && <p className="text-sm text-zinc-400">{status}</p>}
    </main>
  );
}
