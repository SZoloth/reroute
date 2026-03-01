import { describe, expect, it } from "vitest";

import { buildRerouteContextForUser, type RerouteRepository } from "./context";

describe("buildRerouteContextForUser", () => {
  it("returns null when profile is missing", async () => {
    const repo: RerouteRepository = {
      getProfile: async () => null,
      getRecentTrips: async () => [],
      getApprovedSpotsByCity: async () => [],
    };

    const result = await buildRerouteContextForUser({
      userId: "user-1",
      now: new Date("2026-02-28T18:00:00.000Z"),
      repository: repo,
    });

    expect(result).toBeNull();
  });

  it("returns context with profile, city spots, and recent trips", async () => {
    const repo: RerouteRepository = {
      getProfile: async () => ({
        id: "user-1",
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 20,
      }),
      getRecentTrips: async () => [
        {
          spotId: "spot-1",
          createdAt: new Date("2026-02-10T12:00:00.000Z"),
        },
      ],
      getApprovedSpotsByCity: async (city) => [
        {
          id: "spot-2",
          name: "Red Rocks",
          city,
          status: "approved",
          latitude: 39.6654,
          longitude: -105.2057,
          upvotes: 5,
        },
      ],
    };

    const result = await buildRerouteContextForUser({
      userId: "user-1",
      now: new Date("2026-02-28T18:00:00.000Z"),
      repository: repo,
    });

    expect(result).toEqual({
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 20,
      },
      recentTrips: [
        {
          spotId: "spot-1",
          createdAt: new Date("2026-02-10T12:00:00.000Z"),
        },
      ],
      spots: [
        {
          id: "spot-2",
          name: "Red Rocks",
          city: "Denver",
          status: "approved",
          latitude: 39.6654,
          longitude: -105.2057,
          upvotes: 5,
        },
      ],
    });
  });
});
