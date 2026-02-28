import { describe, expect, it } from "vitest";

import { createSpotsPatchHandler } from "./route";

describe("PATCH /api/spots/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    const handler = createSpotsPatchHandler({
      getUserId: async () => null,
      isAdmin: async () => false,
      updateSpotStatus: async () => undefined,
    });

    const response = await handler(new Request("http://localhost"), {
      params: Promise.resolve({ id: "spot-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const handler = createSpotsPatchHandler({
      getUserId: async () => "user-1",
      isAdmin: async () => false,
      updateSpotStatus: async () => undefined,
    });

    const response = await handler(new Request("http://localhost"), {
      params: Promise.resolve({ id: "spot-1" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 200 for valid status update", async () => {
    const handler = createSpotsPatchHandler({
      getUserId: async () => "user-1",
      isAdmin: async () => true,
      updateSpotStatus: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }),
      { params: Promise.resolve({ id: "spot-1" }) },
    );

    expect(response.status).toBe(200);
  });
});
