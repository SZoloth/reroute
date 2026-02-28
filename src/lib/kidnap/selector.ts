export type SpotStatus = "approved" | "pending" | "rejected";

type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type TimeWindow = {
  open: string;
  close: string;
};

export type Spot = {
  id: string;
  name: string;
  city: string;
  status: SpotStatus;
  latitude: number;
  longitude: number;
  upvotes: number;
  timezone?: string;
  hours?: Partial<Record<Weekday, TimeWindow[]>>;
};

export type KidnapInput = {
  now: Date;
  user: {
    city: string;
    homeLatitude: number;
    homeLongitude: number;
    budgetMax: number;
  };
  recentTrips: Array<{ spotId: string; createdAt: Date }>;
  spots: Spot[];
  excludedSpotIds?: string[];
  rng?: () => number;
};

export function selectKidnapSpot(input: KidnapInput): { spot: Spot } | null {
  const thirtyDaysAgoMs = input.now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const recentSpotIds = new Set(
    input.recentTrips
      .filter((trip) => trip.createdAt.getTime() >= thirtyDaysAgoMs)
      .map((trip) => trip.spotId),
  );

  const excludedSpotIds = new Set(input.excludedSpotIds ?? []);

  const candidates = input.spots.filter((spot) => {
    if (spot.status !== "approved") return false;
    if (spot.city !== input.user.city) return false;
    if (recentSpotIds.has(spot.id)) return false;
    if (excludedSpotIds.has(spot.id)) return false;

    if (spot.hours && !isSpotOpenNow(spot, input.now)) return false;

    if (input.user.budgetMax > 0) {
      const miles = haversineMiles(
        input.user.homeLatitude,
        input.user.homeLongitude,
        spot.latitude,
        spot.longitude,
      );
      const estimatedCost = miles * 1.5;
      if (estimatedCost > input.user.budgetMax) return false;
    }

    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  const rng = input.rng ?? Math.random;
  const totalWeight = candidates.reduce(
    (sum, spot) => sum + Math.min(1 + spot.upvotes, 6),
    0,
  );
  const roll = rng() * totalWeight;

  let cumulative = 0;
  for (const spot of candidates) {
    cumulative += Math.min(1 + spot.upvotes, 6);
    if (roll < cumulative) {
      return { spot };
    }
  }

  return { spot: candidates[candidates.length - 1] };
}

function isSpotOpenNow(spot: Spot, now: Date): boolean {
  if (!spot.hours) return true;

  const zone = spot.timezone ?? "UTC";
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: zone,
  })
    .format(now)
    .toLowerCase() as Weekday;

  const windows = spot.hours[weekday];
  if (!windows || windows.length === 0) return false;

  const localTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  }).format(now);

  const currentMinutes = toMinutes(localTime);

  return windows.some((window) => {
    const openMinutes = toMinutes(window.open);
    const closeMinutes = toMinutes(window.close);

    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  });
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}
