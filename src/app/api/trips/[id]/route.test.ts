import { describe, expect, it } from "vitest";

import { createTripsPatchHandler } from "./route";

describe("PATCH /api/trips/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    const handler = createTripsPatchHandler({
      getUserId: async () => null,
      updateTrip: async () => undefined,
    });

    const response = await handler(new Request("http://localhost"), {
      params: Promise.resolve({ id: "trip-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid rating", async () => {
    const handler = createTripsPatchHandler({
      getUserId: async () => "user-1",
      updateTrip: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating: 9 }),
      }),
      { params: Promise.resolve({ id: "trip-1" }) },
    );

    expect(response.status).toBe(400);
  });

  it("returns 200 for valid updates", async () => {
    const handler = createTripsPatchHandler({
      getUserId: async () => "user-1",
      updateTrip: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating: 5, notes: "Great", isPublic: false }),
      }),
      { params: Promise.resolve({ id: "trip-1" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
