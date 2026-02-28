import { getAuthenticatedUserId } from "../../../lib/server/auth";
import { createClient } from "../../../lib/supabase/server";

type SpotsPostBody = {
  name?: string;
  description?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  hours?: unknown;
  tags?: string[];
};

type SpotsPostDependencies = {
  getUserId: () => Promise<string | null>;
  createSpot: (input: {
    userId: string;
    name: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    city: string;
    hours?: unknown;
    tags?: string[];
  }) => Promise<void>;
};

async function parseBody(request: Request): Promise<SpotsPostBody> {
  try {
    return (await request.json()) as SpotsPostBody;
  } catch {
    return {};
  }
}

function hasRequiredFields(body: SpotsPostBody) {
  return Boolean(
    body.name &&
      body.description &&
      body.category &&
      typeof body.latitude === "number" &&
      typeof body.longitude === "number" &&
      body.city,
  );
}

export function createSpotsPostHandler(deps: SpotsPostDependencies) {
  return async function spotsPostHandler(request: Request): Promise<Response> {
    const userId = await deps.getUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(request);
    if (!hasRequiredFields(body)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      await deps.createSpot({
        userId,
        name: body.name!,
        description: body.description!,
        category: body.category!,
        latitude: body.latitude!,
        longitude: body.longitude!,
        city: body.city!,
        hours: body.hours,
        tags: body.tags,
      });
      return Response.json({ ok: true }, { status: 201 });
    } catch {
      return Response.json({ error: "Could not submit spot" }, { status: 500 });
    }
  };
}

export const POST = createSpotsPostHandler({
  getUserId: getAuthenticatedUserId,
  async createSpot(input) {
    const supabase = await createClient();
    const { error } = await supabase.from("spots").insert({
      name: input.name,
      description: input.description,
      category: input.category,
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.city,
      hours: input.hours ?? null,
      tags: input.tags ?? [],
      submitted_by: input.userId,
      status: "pending",
    });

    if (error) {
      throw new Error(error.message);
    }
  },
});
