import { describe, expect, it } from "vitest";

import { createSettingsPatchHandler } from "./route";

describe("PATCH /api/profile/settings", () => {
  it("returns 401 when unauthenticated", async () => {
    const handler = createSettingsPatchHandler({
      getUserId: async () => null,
      updateSettings: async () => undefined,
    });

    const response = await handler(new Request("http://localhost", { method: "PATCH" }));

    expect(response.status).toBe(401);
  });

  it("returns 400 when payload has no valid updates", async () => {
    const handler = createSettingsPatchHandler({
      getUserId: async () => "user-1",
      updateSettings: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 200 for valid updates", async () => {
    const handler = createSettingsPatchHandler({
      getUserId: async () => "user-1",
      updateSettings: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ budgetMax: 40, city: "Denver" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
