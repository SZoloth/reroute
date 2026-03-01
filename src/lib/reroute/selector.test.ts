import { describe, expect, it } from "vitest";

import { selectRerouteSpot, type RerouteInput } from "./selector";

describe("selectRerouteSpot", () => {
  it("returns an approved spot in the user's city", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [],
      spots: [
        {
          id: "a",
          name: "Museum",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: 0,
        },
        {
          id: "b",
          name: "Far Spot",
          city: "Boulder",
          status: "approved",
          latitude: 40.015,
          longitude: -105.2705,
          upvotes: 5,
        },
      ],
      rng: () => 0,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("a");
  });

  it("excludes spots visited in the last 30 days", () => {
    const now = new Date("2026-02-28T18:00:00.000Z");

    const input: RerouteInput = {
      now,
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [{ spotId: "a", createdAt: new Date("2026-02-10T12:00:00.000Z") }],
      spots: [
        {
          id: "a",
          name: "Museum",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: 0,
        },
      ],
      rng: () => 0,
    };

    const result = selectRerouteSpot(input);

    expect(result).toBeNull();
  });

  it("filters out spots above the user's budget estimate", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 5,
      },
      recentTrips: [],
      spots: [
        {
          id: "expensive",
          name: "Boulder Spot",
          city: "Denver",
          status: "approved",
          latitude: 40.015,
          longitude: -105.2705,
          upvotes: 10,
        },
        {
          id: "cheap",
          name: "Nearby Spot",
          city: "Denver",
          status: "approved",
          latitude: 39.7392,
          longitude: -104.9903,
          upvotes: 0,
        },
      ],
      rng: () => 0,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("cheap");
  });

  it("uses upvote-weighted random selection", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [],
      spots: [
        {
          id: "low",
          name: "Low",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: 0,
        },
        {
          id: "high",
          name: "High",
          city: "Denver",
          status: "approved",
          latitude: 39.75,
          longitude: -104.98,
          upvotes: 20,
        },
      ],
      rng: () => 0.3,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("high");
  });

  it("filters out spots that are currently closed", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [],
      spots: [
        {
          id: "closed",
          name: "Closed Place",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: 2,
          timezone: "UTC",
          hours: {
            saturday: [{ open: "09:00", close: "17:00" }],
          },
        },
        {
          id: "open",
          name: "Open Place",
          city: "Denver",
          status: "approved",
          latitude: 39.75,
          longitude: -104.98,
          upvotes: 0,
          timezone: "UTC",
          hours: {
            saturday: [{ open: "09:00", close: "23:00" }],
          },
        },
      ],
      rng: () => 0,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("open");
  });

  it("supports excluding a previous spot for rerolls", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [],
      excludedSpotIds: ["first"],
      spots: [
        {
          id: "first",
          name: "First",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: 100,
        },
        {
          id: "second",
          name: "Second",
          city: "Denver",
          status: "approved",
          latitude: 39.75,
          longitude: -104.98,
          upvotes: 0,
        },
      ],
      rng: () => 0,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("second");
  });

  it("treats invalid timezone as closed instead of throwing", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [],
      spots: [
        {
          id: "invalid-zone",
          name: "Invalid Zone",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: 5,
          timezone: "Mars/Olympus_Mons",
          hours: {
            saturday: [{ open: "09:00", close: "23:00" }],
          },
        },
        {
          id: "valid",
          name: "Valid",
          city: "Denver",
          status: "approved",
          latitude: 39.75,
          longitude: -104.98,
          upvotes: 0,
        },
      ],
      rng: () => 0,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("valid");
  });

  it("clamps negative upvotes so weights never go below one", () => {
    const input: RerouteInput = {
      now: new Date("2026-02-28T18:00:00.000Z"),
      user: {
        city: "Denver",
        homeLatitude: 39.7392,
        homeLongitude: -104.9903,
        budgetMax: 0,
      },
      recentTrips: [],
      spots: [
        {
          id: "negative",
          name: "Negative",
          city: "Denver",
          status: "approved",
          latitude: 39.74,
          longitude: -104.99,
          upvotes: -50,
        },
        {
          id: "normal",
          name: "Normal",
          city: "Denver",
          status: "approved",
          latitude: 39.75,
          longitude: -104.98,
          upvotes: 0,
        },
      ],
      rng: () => 0.75,
    };

    const result = selectRerouteSpot(input);

    expect(result?.spot.id).toBe("normal");
  });
});
