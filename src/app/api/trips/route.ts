import { getAuthenticatedUserId } from "../../../lib/server/auth";
import { createClient } from "../../../lib/supabase/server";

type TripStatus = "suggested" | "ride_clicked" | "completed";

type TripsPostBody = {
  spotId?: string;
  status?: TripStatus;
};

type TripsPostDependencies = {
  getUserId: () => Promise<string | null>;
  createTrip: (input: { userId: string; spotId: string; status: TripStatus }) => Promise<string>;
};

async function parseBody(request: Request): Promise<TripsPostBody> {
  try {
    return (await request.json()) as TripsPostBody;
  } catch {
    return {};
  }
}

export function createTripsPostHandler(deps: TripsPostDependencies) {
  return async function tripsPostHandler(request: Request): Promise<Response> {
    const userId = await deps.getUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(request);
    if (!body.spotId) {
      return Response.json({ error: "spotId is required" }, { status: 400 });
    }

    const status: TripStatus = body.status ?? "ride_clicked";

    try {
      const id = await deps.createTrip({ userId, spotId: body.spotId, status });
      return Response.json({ id }, { status: 201 });
    } catch {
      return Response.json({ error: "Could not create trip" }, { status: 500 });
    }
  };
}

export const POST = createTripsPostHandler({
  getUserId: getAuthenticatedUserId,
  async createTrip({ userId, spotId, status }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: userId,
        spot_id: spotId,
        status,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not create trip");
    }

    return data.id;
  },
});
