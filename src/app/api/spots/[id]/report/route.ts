import { getAuthenticatedUserId } from "../../../../../lib/server/auth";
import { createClient } from "../../../../../lib/supabase/server";

type ReportReason = "unsafe" | "closed" | "incorrect" | "duplicate" | "other";

type ReportBody = {
  reason?: ReportReason;
};

function isReason(value: unknown): value is ReportReason {
  return (
    value === "unsafe" ||
    value === "closed" ||
    value === "incorrect" ||
    value === "duplicate" ||
    value === "other"
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ReportBody = {};
  try {
    body = (await request.json()) as ReportBody;
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!isReason(body.reason)) {
    return Response.json({ error: "Invalid reason" }, { status: 400 });
  }

  const { id: spotId } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("spot_reports").insert({
    user_id: userId,
    spot_id: spotId,
    reason: body.reason,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
