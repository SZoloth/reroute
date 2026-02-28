import { describe, expect, it } from "vitest";

import { createKidnapPostHandler } from "./route";

describe("POST /api/kidnap", () => {
  it("returns 401 when request is unauthenticated", async () => {
    const handler = createKidnapPostHandler({
      getKidnapContextForUser: async () => null,
      now: () => new Date("2026-02-28T18:00:00.000Z"),
      getUserIdFromRequest: async () => null,
    });

    const response = await handler(
      new Request("http://localhost:3000/api/kidnap", { method: "POST" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 404 when user has no eligible kidnap context", async () => {
    const handler = createKidnapPostHandler({
      getKidnapContextForUser: async () => null,
      now: () => new Date("2026-02-28T18:00:00.000Z"),
      getUserIdFromRequest: async () => "user-1",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/kidnap", { method: "POST" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "No eligible spots" });
  });

  it("returns selected spot when user is authorized and has eligible spots", async () => {
    const handler = createKidnapPostHandler({
      getKidnapContextForUser: async () => ({
        user: {
          city: "Denver",
          homeLatitude: 39.7392,
          homeLongitude: -104.9903,
          budgetMax: 0,
        },
        recentTrips: [],
        spots: [
          {
            id: "spot-1",
            name: "Denver Art Museum",
            city: "Denver",
            status: "approved",
            latitude: 39.7372,
            longitude: -104.9892,
            upvotes: 3,
          },
        ],
      }),
      now: () => new Date("2026-02-28T18:00:00.000Z"),
      getUserIdFromRequest: async () => "user-1",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/kidnap", { method: "POST" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      spot: {
        id: "spot-1",
        name: "Denver Art Museum",
      },
    });
  });

  it("returns 400 when reroll count exceeds one", async () => {
    const handler = createKidnapPostHandler({
      getKidnapContextForUser: async () => ({
        user: {
          city: "Denver",
          homeLatitude: 39.7392,
          homeLongitude: -104.9903,
          budgetMax: 0,
        },
        recentTrips: [],
        spots: [],
      }),
      now: () => new Date("2026-02-28T18:00:00.000Z"),
      getUserIdFromRequest: async () => "user-1",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/kidnap", {
        method: "POST",
        body: JSON.stringify({ rerollCount: 2 }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Only one reroll is allowed per session",
    });
  });

  it("excludes the previous spot id for rerolls", async () => {
    const handler = createKidnapPostHandler({
      getKidnapContextForUser: async () => ({
        user: {
          city: "Denver",
          homeLatitude: 39.7392,
          homeLongitude: -104.9903,
          budgetMax: 0,
        },
        recentTrips: [],
        spots: [
          {
            id: "spot-1",
            name: "First",
            city: "Denver",
            status: "approved",
            latitude: 39.7372,
            longitude: -104.9892,
            upvotes: 10,
          },
          {
            id: "spot-2",
            name: "Second",
            city: "Denver",
            status: "approved",
            latitude: 39.7373,
            longitude: -104.9893,
            upvotes: 0,
          },
        ],
      }),
      now: () => new Date("2026-02-28T18:00:00.000Z"),
      getUserIdFromRequest: async () => "user-1",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/kidnap", {
        method: "POST",
        body: JSON.stringify({ excludeSpotId: "spot-1", rerollCount: 1 }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      spot: {
        id: "spot-2",
      },
    });
  });
});
