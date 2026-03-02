import { describe, expect, it, vi } from "vitest";

import { getCurrentPosition } from "./geolocation";

describe("getCurrentPosition", () => {
  it("resolves with position on success", async () => {
    const mockPosition = {
      coords: { latitude: 39.7392, longitude: -104.9903 },
    } as GeolocationPosition;

    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (
          success: PositionCallback,
          _error: PositionErrorCallback,
          _options: PositionOptions,
        ) => {
          success(mockPosition);
        },
      },
    });

    const position = await getCurrentPosition();
    expect(position.coords.latitude).toBe(39.7392);

    vi.unstubAllGlobals();
  });

  it("rejects when geolocation errors", async () => {
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback,
          _options: PositionOptions,
        ) => {
          error({
            code: 1,
            message: "User denied Geolocation",
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          });
        },
      },
    });

    await expect(getCurrentPosition()).rejects.toMatchObject({
      code: 1,
      message: "User denied Geolocation",
    });

    vi.unstubAllGlobals();
  });
});
