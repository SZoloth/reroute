import {
  getKidnapContextForUser,
  type KidnapContext,
} from "../../../lib/kidnap/context";
import { getAuthenticatedUserId } from "../../../lib/server/auth";
import { selectKidnapSpot } from "../../../lib/kidnap/selector";

type KidnapPostDependencies = {
  getKidnapContextForUser: (userId: string) => Promise<KidnapContext | null>;
  now: () => Date;
  getUserIdFromRequest: (request: Request) => Promise<string | null>;
};

type KidnapRequestBody = {
  excludeSpotId?: string;
  rerollCount?: number;
};

async function resolveUserId(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (auth) {
    const [scheme, token] = auth.split(" ");
    if (scheme === "Bearer" && token) {
      return token;
    }
  }

  try {
    return await getAuthenticatedUserId();
  } catch {
    return null;
  }
}

async function parseKidnapRequestBody(
  request: Request,
): Promise<KidnapRequestBody> {
  try {
    const body = (await request.json()) as KidnapRequestBody;
    return {
      excludeSpotId:
        typeof body?.excludeSpotId === "string" ? body.excludeSpotId : undefined,
      rerollCount:
        typeof body?.rerollCount === "number" ? body.rerollCount : undefined,
    };
  } catch {
    return {};
  }
}

export function createKidnapPostHandler(deps: KidnapPostDependencies) {
  return async function kidnapPostHandler(request: Request): Promise<Response> {
    const userId = await deps.getUserIdFromRequest(request);

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await parseKidnapRequestBody(request);

      if ((body.rerollCount ?? 0) > 1) {
        return Response.json(
          { error: "Only one reroll is allowed per session" },
          { status: 400 },
        );
      }

      const context = await deps.getKidnapContextForUser(userId);

      if (!context) {
        return Response.json({ error: "No eligible spots" }, { status: 404 });
      }

      const result = selectKidnapSpot({
        ...context,
        now: deps.now(),
        excludedSpotIds: body.excludeSpotId ? [body.excludeSpotId] : undefined,
      });

      if (!result) {
        return Response.json({ error: "No eligible spots" }, { status: 404 });
      }

      return Response.json({ spot: result.spot }, { status: 200 });
    } catch {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export const POST = createKidnapPostHandler({
  getKidnapContextForUser,
  now: () => new Date(),
  getUserIdFromRequest: resolveUserId,
});
