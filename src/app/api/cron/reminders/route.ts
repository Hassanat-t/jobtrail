import { timingSafeEqual } from "node:crypto";
import { sendFollowUpReminders } from "@/lib/reminders";

// Called once a day by Vercel Cron (see vercel.json), which sends `Authorization: Bearer $CRON_SECRET`.

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const result = await sendFollowUpReminders();
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Reminders failed" }, { status: 500 });
  }
}
