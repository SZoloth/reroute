import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

type TimeWindow = { open: string; close: string };

type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type SeedSpot = {
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  hours?: Record<string, TimeWindow[]>;
  tags: string[];
};

const WEEKDAY_KEY_MAP: Record<string, Weekday> = {
  sun: "sunday",
  sunday: "sunday",
  mon: "monday",
  monday: "monday",
  tue: "tuesday",
  tues: "tuesday",
  tuesday: "tuesday",
  wed: "wednesday",
  wednesday: "wednesday",
  thu: "thursday",
  thur: "thursday",
  thurs: "thursday",
  thursday: "thursday",
  fri: "friday",
  friday: "friday",
  sat: "saturday",
  saturday: "saturday",
};

function normalizeHours(hours?: Record<string, TimeWindow[]>): Partial<Record<Weekday, TimeWindow[]>> {
  if (!hours) return {};

  const normalized: Partial<Record<Weekday, TimeWindow[]>> = {};

  for (const [rawKey, windows] of Object.entries(hours)) {
    const normalizedKey = WEEKDAY_KEY_MAP[rawKey.trim().toLowerCase()];

    if (!normalizedKey) {
      throw new Error(`Unsupported hours key: ${rawKey}`);
    }

    normalized[normalizedKey] = windows;
  }

  return normalized;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const supabase = createClient(url, serviceRole);
  const file = await readFile("scripts/seed-spots.json", "utf8");
  const spots = JSON.parse(file) as SeedSpot[];

  const { error } = await supabase.from("spots").insert(
    spots.map((spot) => ({
      ...spot,
      hours: normalizeHours(spot.hours),
      city: "Denver",
      status: "approved",
      upvotes: 0,
    })),
  );

  if (error) {
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
