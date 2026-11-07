import { apiError, json, preflight, withUser } from "@/lib/api-route";
import { createApplication, findApplicationByUrl } from "@/lib/applications";
import { apiJobSchema, urlSchema } from "@/lib/job-schema";

/** GET /api/applications?url=…  → { application: { id, company, title, status } | null } */
export const GET = withUser(async (request, user) => {
  const url = urlSchema.safeParse(new URL(request.url).searchParams.get("url"));
  if (!url.success || !url.data) return apiError(request, 400, "Pass the page link as ?url=");

  return json(request, { application: await findApplicationByUrl(user.id, url.data) });
});

/** POST /api/applications  { company, title, url?, source?, location?, salary?, status?, notes? } → 201 { id } */
export const POST = withUser(async (request, user) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return apiError(request, 400, "Send the job details as a JSON object.");
  const parsed = apiJobSchema.safeParse(body);
  if (!parsed.success) return apiError(request, 400, parsed.error.issues[0].message);

  const id = await createApplication(user.id, parsed.data);
  return json(request, { id }, 201);
});

export const OPTIONS = preflight;
