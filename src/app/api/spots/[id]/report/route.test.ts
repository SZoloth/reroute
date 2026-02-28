import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../../lib/server/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("../../../../../lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { getAuthenticatedUserId } from "../../../../../lib/server/auth";
import { createClient } from "../../../../../lib/supabase/server";
import { POST } from "./route";

describe("POST /api/spots/[id]/report", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getAuthenticatedUserId).mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ reason: "unsafe" }) }),
      { params: Promise.resolve({ id: "spot-1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid reason", async () => {
    vi.mocked(getAuthenticatedUserId).mockResolvedValueOnce("user-1");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ reason: "nope" }) }),
      { params: Promise.resolve({ id: "spot-1" }) },
    );

    expect(response.status).toBe(400);
  });

  it("returns 201 when report is created", async () => {
    vi.mocked(getAuthenticatedUserId).mockResolvedValueOnce("user-1");

    const insert = vi.fn().mockResolvedValueOnce({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    vi.mocked(createClient).mockResolvedValueOnce({ from } as never);

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ reason: "unsafe" }) }),
      { params: Promise.resolve({ id: "spot-1" }) },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
