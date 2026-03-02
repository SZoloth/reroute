import {
  getRerouteContextForUser,
  type RerouteContext,
} from "../../../lib/reroute/context";
import { getAuthenticatedUserId } from "../../../lib/server/auth";
import { selectRerouteSpot } from "../../../lib/reroute/selector";

type ReroutePostDependencies = {
  getRerouteContextForUser: (userId: string) => Promise<RerouteContext | null>;
  now: () => Date;
  getUserIdFromRequest: (request: Request) => Promise<string | null>;
};

type RerouteRequestBody = {
  excludeSpotId?: string;
  rerollCount?: number;
};

export async function resolveUserIdFromRequest(
  _request: Request,
  getUserId: () => Promise<string | null> = getAuthenticatedUserId,
): Promise<string | null> {
  try {
    return await getUserId();
  } catch {
    return null;
  }
}

async function parseRerouteRequestBody(
  request: Request,
): Promise<RerouteRequestBody> {
  try {
    const body = (await request.json()) as RerouteRequestBody;
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

export function createReroutePostHandler(deps: ReroutePostDependencies) {
  return async function reroutePostHandler(request: Request): Promise<Response> {
    const userId = await deps.getUserIdFromRequest(request);

    if (!userId) {
      return Response.json({ error: "Unauthorized", message: "Sign in to get rerouted" }, { status: 401 });
    }

    try {
      const body = await parseRerouteRequestBody(request);

      const rerollCount = body.rerollCount ?? 0;
      if (!Number.isInteger(rerollCount) || rerollCount < 0 || rerollCount > 1) {
        return Response.json(
          { error: "Only one reroll is allowed per session" },
          { status: 400 },
        );
      }

      const context = await deps.getRerouteContextForUser(userId);

      if (!context) {
        return Response.json({ error: "No eligible spots", message: "No adventures found nearby — check back soon!" }, { status: 404 });
      }

      const result = selectRerouteSpot({
        ...context,
        now: deps.now(),
        excludedSpotIds: body.excludeSpotId ? [body.excludeSpotId] : undefined,
      });

      if (!result) {
        return Response.json({ error: "No eligible spots", message: "No adventures found nearby — check back soon!" }, { status: 404 });
      }

      return Response.json({ spot: result.spot }, { status: 200 });
    } catch {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export const POST = createReroutePostHandler({
  getRerouteContextForUser,
  now: () => new Date(),
  getUserIdFromRequest: resolveUserIdFromRequest,
});
