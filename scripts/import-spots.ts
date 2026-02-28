import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

type SeedSpot = {
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  hours: Record<string, Array<{ open: string; close: string }>>;
  tags: string[];
};

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
