import { getAuthenticatedUser } from "../../../../lib/server/auth";
import { createClient } from "../../../../lib/supabase/server";

type OnboardingBody = {
  city?: string;
  homeLatitude?: number;
  homeLongitude?: number;
};

type OnboardingDeps = {
  getUser: () => Promise<{
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null>;
  upsertProfile: (input: {
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
    city: string;
    home_latitude: number;
    home_longitude: number;
  }) => Promise<void>;
};

async function parseBody(request: Request): Promise<OnboardingBody> {
  try {
    return (await request.json()) as OnboardingBody;
  } catch {
    return {};
  }
}

export function createOnboardingPostHandler(deps: OnboardingDeps) {
  return async function onboardingPostHandler(request: Request): Promise<Response> {
    const user = await deps.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(request);
    if (
      !body.city ||
      typeof body.homeLatitude !== "number" ||
      typeof body.homeLongitude !== "number"
    ) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      await deps.upsertProfile({
        id: user.id,
        email: user.email ?? null,
        name:
          (typeof user.user_metadata?.full_name === "string" &&
            user.user_metadata.full_name) ||
          user.email ||
          null,
        avatar_url:
          (typeof user.user_metadata?.avatar_url === "string" &&
            user.user_metadata.avatar_url) ||
          null,
        city: body.city,
        home_latitude: body.homeLatitude,
        home_longitude: body.homeLongitude,
      });

      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: "Could not save profile" }, { status: 500 });
    }
  };
}

export const POST = createOnboardingPostHandler({
  getUser: getAuthenticatedUser,
  async upsertProfile(input) {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").upsert(input);

    if (error) {
      throw new Error(error.message);
    }
  },
});
