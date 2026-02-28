import { createClient } from "../supabase/server";
import type { KidnapInput, Spot } from "./selector";

export type KidnapContext = Omit<KidnapInput, "now" | "rng">;

type ProfileRecord = {
  id: string;
  city: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  budget_max: number | null;
};

type TripRecord = {
  spot_id: string;
  created_at: string;
};

type SpotRecord = {
  id: string;
  name: string;
  city: string;
  status: "approved" | "pending" | "rejected";
  latitude: number;
  longitude: number;
  upvotes: number | null;
  timezone: string | null;
  hours: Spot["hours"] | null;
};

export type KidnapRepository = {
  getProfile: (userId: string) => Promise<{
    id: string;
    city: string;
    homeLatitude: number;
    homeLongitude: number;
    budgetMax: number;
  } | null>;
  getRecentTrips: (
    userId: string,
    since: Date,
  ) => Promise<Array<{ spotId: string; createdAt: Date }>>;
  getApprovedSpotsByCity: (city: string) => Promise<Spot[]>;
};

export async function buildKidnapContextForUser(params: {
  userId: string;
  now: Date;
  repository: KidnapRepository;
}): Promise<KidnapContext | null> {
  const profile = await params.repository.getProfile(params.userId);
  if (!profile) {
    return null;
  }

  const since = new Date(params.now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [recentTrips, spots] = await Promise.all([
    params.repository.getRecentTrips(params.userId, since),
    params.repository.getApprovedSpotsByCity(profile.city),
  ]);

  return {
    user: {
      city: profile.city,
      homeLatitude: profile.homeLatitude,
      homeLongitude: profile.homeLongitude,
      budgetMax: profile.budgetMax,
    },
    recentTrips,
    spots,
  };
}

export async function getKidnapContextForUser(
  userId: string,
): Promise<KidnapContext | null> {
  try {
    const repo = await createSupabaseKidnapRepository();
    return buildKidnapContextForUser({
      userId,
      now: new Date(),
      repository: repo,
    });
  } catch {
    return null;
  }
}

async function createSupabaseKidnapRepository(): Promise<KidnapRepository> {
  const supabase = await createClient();

  return {
    async getProfile(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, city, home_latitude, home_longitude, budget_max")
        .eq("id", userId)
        .maybeSingle<ProfileRecord>();

      if (error || !data) return null;
      if (!data.city || data.home_latitude == null || data.home_longitude == null) {
        return null;
      }

      return {
        id: data.id,
        city: data.city,
        homeLatitude: data.home_latitude,
        homeLongitude: data.home_longitude,
        budgetMax: data.budget_max ?? 0,
      };
    },

    async getRecentTrips(userId, since) {
      const { data, error } = await supabase
        .from("trips")
        .select("spot_id, created_at")
        .eq("user_id", userId)
        .gte("created_at", since.toISOString())
        .returns<TripRecord[]>();

      if (error || !data) return [];

      return data
        .filter((trip) => Boolean(trip.spot_id) && Boolean(trip.created_at))
        .map((trip) => ({
          spotId: trip.spot_id,
          createdAt: new Date(trip.created_at),
        }));
    },

    async getApprovedSpotsByCity(city) {
      const { data, error } = await supabase
        .from("spots")
        .select(
          "id, name, city, status, latitude, longitude, upvotes, timezone, hours",
        )
        .eq("status", "approved")
        .eq("city", city)
        .returns<SpotRecord[]>();

      if (error || !data) return [];

      return data.map((spot) => ({
        id: spot.id,
        name: spot.name,
        city: spot.city,
        status: spot.status,
        latitude: spot.latitude,
        longitude: spot.longitude,
        upvotes: spot.upvotes ?? 0,
        timezone: spot.timezone ?? undefined,
        hours: spot.hours ?? undefined,
      }));
    },
  };
}
