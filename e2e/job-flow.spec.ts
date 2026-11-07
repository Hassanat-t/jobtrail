import { expect, test } from "@playwright/test";

// The main journey: sign up, add a job, move it along, check stats, save one through the
// extension API, delete, log out. Each run signs up a fresh user, so it doesn't depend on old data.

test("a job seeker can track a job from saved to interview", async ({ page, request }) => {
  const email = `e2e-${Date.now()}@jobtrail.test`;
  const password = "e2e-password-123";

  await test.step("sign up and land on an empty board", async () => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Tolu Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Add your first job" })).toBeVisible();
  });

  await test.step("add a job", async () => {
    await page.getByRole("button", { name: "+ Add job" }).click();
    await page.getByLabel("Company", { exact: true }).fill("Paystack");
    await page.getByLabel("Job title").fill("Frontend developer");
    await page.getByLabel("Link to the job post").fill("https://paystack.com/careers/frontend");
    await page.getByLabel("Salary").fill("₦500k/month");
    await page.getByRole("button", { name: "Save job" }).click();

    const saved = page.getByRole("region", { name: /^Saved, 1 job/ });
    await expect(saved.getByText("Paystack")).toBeVisible();
  });

  await test.step("move it to Interview on the job page and see the history", async () => {
    await page.getByRole("link", { name: "Paystack" }).click();
    await expect(page.getByRole("heading", { name: "Paystack", level: 1 })).toBeVisible();

    await page.getByRole("combobox", { name: "Status" }).selectOption("applied");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved → Applied")).toBeVisible();

    await page.getByRole("combobox", { name: "Status" }).selectOption("interview");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Applied → Interview")).toBeVisible();
    await expect(page.getByLabel("Salary")).toHaveValue("₦500k/month");
  });

  await test.step("stats count the reply", async () => {
    await page.getByRole("link", { name: "Stats" }).click();
    await expect(page.getByText("1 of 1 replied")).toBeVisible();
    await expect(page.getByText("100%").first()).toBeVisible();
  });

  await test.step("create an API token and save a job like the extension does", async () => {
    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Create token" }).click();
    const token = await page.getByLabel("New API token").inputValue();
    expect(token).toMatch(/^jt_/);

    const headers = { Authorization: `Bearer ${token}` };
    const me = await request.get("/api/me", { headers });
    expect(await me.json()).toEqual({ name: "Tolu Test", email });

    const created = await request.post("/api/applications", {
      headers,
      data: { company: "Kuda", title: "React engineer", url: "https://jobs.lever.co/kuda/1", source: "company_site" },
    });
    expect(created.status()).toBe(201);

    const lookup = await request.get(`/api/applications?url=${encodeURIComponent("https://jobs.lever.co/kuda/1")}`, {
      headers,
    });
    expect((await lookup.json()).application).toMatchObject({ company: "Kuda", status: "saved" });

    await page.getByRole("link", { name: "JobTrail" }).click();
    await expect(page.getByRole("region", { name: /^Saved, 1 job/ }).getByText("Kuda")).toBeVisible();
  });

  await test.step("delete a job", async () => {
    await page.getByRole("link", { name: "Kuda" }).click();
    await page.getByRole("button", { name: "Delete job" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("link", { name: "Kuda" })).toHaveCount(0);
    await expect(page.getByText("1 tracked")).toBeVisible();
  });

  await test.step("log out, and the board needs logging in again", async () => {
    await page.getByRole("button", { name: "Log out" }).click();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test("the extension API rejects requests without a valid token", async ({ request }) => {
  expect((await request.get("/api/me")).status()).toBe(401);
  expect((await request.get("/api/me", { headers: { Authorization: "Bearer jt_wrong" } })).status()).toBe(401);
  expect((await request.post("/api/applications", { data: { company: "X", title: "Y" } })).status()).toBe(401);
});
