import { getAuthenticatedUserId } from "../../../../../lib/server/auth";
import { createClient } from "../../../../../lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { id: spotId } = await params;

  const { data: existing } = await supabase
    .from("spot_votes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("spot_id", spotId)
    .maybeSingle<{ user_id: string }>();

  const { data: currentSpot } = await supabase
    .from("spots")
    .select("upvotes")
    .eq("id", spotId)
    .maybeSingle<{ upvotes: number }>();

  const currentUpvotes = currentSpot?.upvotes ?? 0;

  if (existing) {
    await supabase.from("spot_votes").delete().eq("user_id", userId).eq("spot_id", spotId);
    await supabase
      .from("spots")
      .update({ upvotes: Math.max(0, currentUpvotes - 1) })
      .eq("id", spotId);
    return Response.json({ voted: false });
  }

  await supabase.from("spot_votes").insert({ user_id: userId, spot_id: spotId });
  await supabase.from("spots").update({ upvotes: currentUpvotes + 1 }).eq("id", spotId);

  return Response.json({ voted: true });
}
