import "server-only";
import { userFromRequest } from "./api-tokens";
import type { CurrentUser } from "./auth";

// Helpers for the REST endpoints the Chrome extension calls.
// Auth is a Bearer token (no cookies), so cross-origin calls are allowed from extension pages only.

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  if (!origin?.startsWith("chrome-extension://")) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: { ...corsHeaders(request), "Cache-Control": "no-store" } });
}

export const apiError = (request: Request, status: number, error: string) => json(request, { error }, status);

/** Answers the browser's CORS preflight. Export as OPTIONS from a route file. */
export function preflight(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** Runs the handler with the token's user, or answers 401. */
export function withUser(handler: (request: Request, user: CurrentUser) => Promise<Response>) {
  return async (request: Request) => {
    try {
      const user = await userFromRequest(request);
      if (!user) return apiError(request, 401, "Your token is missing or no longer valid. Create a new one in Settings.");
      return await handler(request, user);
    } catch (err) {
      console.error(err);
      return apiError(request, 500, "Something went wrong on our side. Try again.");
    }
  };
}
