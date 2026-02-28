import { getAuthenticatedUserId } from "../../../../lib/server/auth";
import { createClient } from "../../../../lib/supabase/server";

type SettingsBody = {
  budgetMax?: number;
  city?: string;
};

type SettingsDeps = {
  getUserId: () => Promise<string | null>;
  updateSettings: (userId: string, updates: { budget_max?: number; city?: string }) => Promise<void>;
};

async function parseBody(request: Request): Promise<SettingsBody> {
  try {
    return (await request.json()) as SettingsBody;
  } catch {
    return {};
  }
}

export function createSettingsPatchHandler(deps: SettingsDeps) {
  return async function settingsPatchHandler(request: Request): Promise<Response> {
    const userId = await deps.getUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(request);
    const updates: { budget_max?: number; city?: string } = {};

    if (typeof body.budgetMax === "number") {
      if (body.budgetMax < 0 || body.budgetMax > 500) {
        return Response.json({ error: "budgetMax out of range" }, { status: 400 });
      }
      updates.budget_max = body.budgetMax;
    }

    if (typeof body.city === "string") {
      const trimmed = body.city.trim();
      if (!trimmed) {
        return Response.json({ error: "city cannot be empty" }, { status: 400 });
      }
      updates.city = trimmed;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid updates provided" }, { status: 400 });
    }

    try {
      await deps.updateSettings(userId, updates);
      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: "Could not update settings" }, { status: 500 });
    }
  };
}

export const PATCH = createSettingsPatchHandler({
  getUserId: getAuthenticatedUserId,
  async updateSettings(userId, updates) {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);

    if (error) {
      throw new Error(error.message);
    }
  },
});
