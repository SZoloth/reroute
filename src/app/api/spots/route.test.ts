import { describe, expect, it } from "vitest";

import { createSpotsPostHandler } from "./route";

describe("POST /api/spots", () => {
  it("returns 401 when unauthenticated", async () => {
    const handler = createSpotsPostHandler({
      getUserId: async () => null,
      createSpot: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost:3000/api/spots", { method: "POST" }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const handler = createSpotsPostHandler({
      getUserId: async () => "user-1",
      createSpot: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost:3000/api/spots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Only name" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 201 when valid payload is submitted", async () => {
    const handler = createSpotsPostHandler({
      getUserId: async () => "user-1",
      createSpot: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost:3000/api/spots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Spot",
          description: "Desc",
          category: "food",
          latitude: 39.7,
          longitude: -104.9,
          city: "Denver",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
