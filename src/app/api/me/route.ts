import { json, preflight, withUser } from "@/lib/api-route";

/** Lets the extension check its token. */
export const GET = withUser(async (request, user) => json(request, { name: user.name, email: user.email }));

export const OPTIONS = preflight;
