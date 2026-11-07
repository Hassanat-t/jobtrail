import { describe, expect, it } from "vitest";
import { buildReminderEmail } from "./reminder-email";

const job = { id: "11111111-1111-4111-8111-111111111111", company: "Paystack", title: "Frontend developer", daysWaiting: 9 };

describe("buildReminderEmail", () => {
  it("names the company in the subject when there's one job", () => {
    const email = buildReminderEmail({ name: "Anidu Hassanat", jobs: [job], appUrl: "https://jobtrail.app/" });
    expect(email.subject).toBe("No reply from Paystack after 9 days. Time to follow up?");
    expect(email.text).toContain("Hi Anidu,");
    expect(email.text).toContain(`https://jobtrail.app/dashboard/jobs/${job.id}`);
    expect(email.text).toContain("https://jobtrail.app/dashboard/settings");
  });

  it("counts the jobs in the subject when there are several", () => {
    const email = buildReminderEmail({
      name: "Ada",
      jobs: [job, { ...job, id: "2", company: "Kuda" }],
      appUrl: "http://localhost:3020",
    });
    expect(email.subject).toBe("2 applications are waiting on a reply. Time to follow up?");
    expect(email.html).toContain("Kuda");
  });

  it("escapes HTML in user-entered text", () => {
    const email = buildReminderEmail({
      name: "<b>Ada</b>",
      jobs: [{ ...job, company: `Evil <script>alert("x")</script> & Co` }],
      appUrl: "http://localhost:3020",
    });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("Evil &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; Co");
    expect(email.html).toContain("Hi &lt;b&gt;Ada&lt;/b&gt;,");
  });
});
