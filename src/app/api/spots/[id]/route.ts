import { getAuthenticatedUserId, getIsAdmin } from "../../../../lib/server/auth";
import { createClient } from "../../../../lib/supabase/server";

type SpotStatus = "approved" | "pending" | "rejected";

type SpotsPatchBody = {
  status?: SpotStatus;
};

type SpotsPatchDeps = {
  getUserId: () => Promise<string | null>;
  isAdmin: (userId: string) => Promise<boolean>;
  updateSpotStatus: (spotId: string, status: SpotStatus) => Promise<void>;
};

async function parseBody(request: Request): Promise<SpotsPatchBody> {
  try {
    return (await request.json()) as SpotsPatchBody;
  } catch {
    return {};
  }
}

function isSpotStatus(value: unknown): value is SpotStatus {
  return value === "approved" || value === "pending" || value === "rejected";
}

export function createSpotsPatchHandler(deps: SpotsPatchDeps) {
  return async function spotsPatchHandler(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
  ): Promise<Response> {
    const userId = await deps.getUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await deps.isAdmin(userId))) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await parseBody(request);
    if (!isSpotStatus(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await params;

    try {
      await deps.updateSpotStatus(id, body.status);
      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: "Could not update spot" }, { status: 500 });
    }
  };
}

export const PATCH = createSpotsPatchHandler({
  getUserId: getAuthenticatedUserId,
  isAdmin: getIsAdmin,
  async updateSpotStatus(spotId, status) {
    const supabase = await createClient();
    const { error } = await supabase.from("spots").update({ status }).eq("id", spotId);

    if (error) {
      throw new Error(error.message);
    }
  },
});
