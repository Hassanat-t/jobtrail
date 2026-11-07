// Builds the follow-up reminder email. Pure function, so it's easy to test.

export type ReminderJob = { id: string; company: string; title: string; daysWaiting: number };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export function buildReminderEmail({ name, jobs, appUrl }: { name: string; jobs: ReminderJob[]; appUrl: string }) {
  const base = appUrl.replace(/\/+$/, "");
  const jobUrl = (id: string) => `${base}/dashboard/jobs/${id}`;
  const settingsUrl = `${base}/dashboard/settings`;

  const subject =
    jobs.length === 1
      ? `No reply from ${jobs[0].company} after ${jobs[0].daysWaiting} days. Time to follow up?`
      : `${jobs.length} applications are waiting on a reply. Time to follow up?`;

  const text = [
    `Hi ${firstName(name)},`,
    "",
    jobs.length === 1
      ? "You haven't heard back about this application yet:"
      : "You haven't heard back about these applications yet:",
    "",
    ...jobs.map((j) => `- ${j.company}, ${j.title} (${j.daysWaiting} days): ${jobUrl(j.id)}`),
    "",
    "A short, friendly follow-up email to the recruiter often gets things moving.",
    "Heard back already? Move the card on your board so your stats stay right.",
    "",
    `Turn these reminders off in Settings: ${settingsUrl}`,
  ].join("\n");

  const rows = jobs
    .map(
      (j) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e7e0d6">
            <a href="${escapeHtml(jobUrl(j.id))}" style="color:#292524;font-weight:600;text-decoration:none">${escapeHtml(j.company)}</a>
            <div style="color:#78716c;font-size:14px">${escapeHtml(j.title)}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e7e0d6;text-align:right;color:#78716c;font-size:14px;white-space:nowrap">
            ${j.daysWaiting} days
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#faf7f2;font-family:Inter,'Segoe UI',Arial,sans-serif;color:#292524">
    <div style="max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e7e0d6;border-radius:10px;padding:28px">
      <div style="font-family:Georgia,serif;font-size:22px;margin-bottom:20px">JobTrail</div>
      <p style="margin:0 0 12px">Hi ${escapeHtml(firstName(name))},</p>
      <p style="margin:0 0 8px">${jobs.length === 1 ? "You haven't heard back about this application yet:" : "You haven't heard back about these applications yet:"}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px">${rows}</table>
      <p style="margin:0 0 12px">A short, friendly follow-up email to the recruiter often gets things moving.</p>
      <p style="margin:0 0 24px;color:#78716c">Heard back already? Move the card on your board so your stats stay right.</p>
      <a href="${escapeHtml(`${base}/dashboard`)}" style="display:inline-block;background:#c2410c;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600">Open your board</a>
      <p style="margin:28px 0 0;font-size:12px;color:#78716c">
        You get this because follow-up reminders are on. <a href="${escapeHtml(settingsUrl)}" style="color:#78716c">Turn them off</a>.
      </p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}
