import { describe, expect, it } from "vitest";

import { createOnboardingPostHandler } from "./route";

describe("POST /api/profile/onboarding", () => {
  it("returns 401 when unauthenticated", async () => {
    const handler = createOnboardingPostHandler({
      getUser: async () => null,
      upsertProfile: async () => undefined,
    });

    const response = await handler(new Request("http://localhost", { method: "POST" }));

    expect(response.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const handler = createOnboardingPostHandler({
      getUser: async () => ({ id: "user-1" }),
      upsertProfile: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city: "Denver" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 200 when onboarding payload is valid", async () => {
    const handler = createOnboardingPostHandler({
      getUser: async () => ({ id: "user-1", email: "a@b.com", user_metadata: {} }),
      upsertProfile: async () => undefined,
    });

    const response = await handler(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city: "Denver", homeLatitude: 39.7, homeLongitude: -104.9 }),
      }),
    );

    expect(response.status).toBe(200);
  });
});
