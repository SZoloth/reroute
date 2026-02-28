import { describe, expect, it } from "vitest";

import { createTripsPostHandler } from "./route";

describe("POST /api/trips", () => {
  it("returns 401 when unauthenticated", async () => {
    const handler = createTripsPostHandler({
      getUserId: async () => null,
      createTrip: async () => "",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/trips", { method: "POST" }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 when spotId is missing", async () => {
    const handler = createTripsPostHandler({
      getUserId: async () => "user-1",
      createTrip: async () => "",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "spotId is required" });
  });

  it("returns 201 with trip id", async () => {
    const handler = createTripsPostHandler({
      getUserId: async () => "user-1",
      createTrip: async () => "trip-123",
    });

    const response = await handler(
      new Request("http://localhost:3000/api/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spotId: "spot-1", status: "ride_clicked" }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: "trip-123" });
  });
});
