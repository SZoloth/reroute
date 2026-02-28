import { getAuthenticatedUserId } from "../../../../lib/server/auth";
import { createClient } from "../../../../lib/supabase/server";

type TripsPatchBody = {
  rating?: number;
  notes?: string;
  isPublic?: boolean;
};

type TripsPatchDeps = {
  getUserId: () => Promise<string | null>;
  updateTrip: (input: {
    tripId: string;
    userId: string;
    updates: Record<string, unknown>;
  }) => Promise<void>;
};

async function parseBody(request: Request): Promise<TripsPatchBody> {
  try {
    return (await request.json()) as TripsPatchBody;
  } catch {
    return {};
  }
}

export function createTripsPatchHandler(deps: TripsPatchDeps) {
  return async function tripsPatchHandler(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
  ): Promise<Response> {
    const userId = await deps.getUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await parseBody(request);

    const updates: Record<string, unknown> = {};

    if (typeof body.rating === "number") {
      if (body.rating < 1 || body.rating > 5) {
        return Response.json({ error: "rating must be 1-5" }, { status: 400 });
      }
      updates.rating = body.rating;
    }

    if (typeof body.notes === "string") updates.notes = body.notes;
    if (typeof body.isPublic === "boolean") updates.is_public = body.isPublic;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid updates provided" }, { status: 400 });
    }

    try {
      await deps.updateTrip({ tripId: id, userId, updates });
      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: "Could not update trip" }, { status: 500 });
    }
  };
}

export const PATCH = createTripsPatchHandler({
  getUserId: getAuthenticatedUserId,
  async updateTrip({ tripId, userId, updates }) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("trips")
      .update(updates)
      .eq("id", tripId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
  },
});
