import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it } from "vitest";
import { parseJobPage } from "./parse.js";

// Runs the parser against a small hand-written page at the given address.
function parseAt(url, html) {
  const dom = new JSDOM(`<!doctype html><html><head>${html.head ?? ""}</head><body>${html.body ?? ""}</body></html>`, {
    url,
  });
  globalThis.document = dom.window.document;
  globalThis.location = dom.window.location;
  return parseJobPage();
}

afterEach(() => {
  delete globalThis.document;
  delete globalThis.location;
});

const jobPosting = (data) =>
  `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "JobPosting", ...data })}</script>`;

describe("LinkedIn", () => {
  it("reads the job card and saves a clean job link", () => {
    const job = parseAt("https://www.linkedin.com/jobs/search/?currentJobId=4012345678&keywords=react&trk=abc", {
      body: `
        <div class="job-details-jobs-unified-top-card__company-name"><a href="#"> Paystack </a></div>
        <div class="job-details-jobs-unified-top-card__job-title"><h1>Frontend   Developer</h1></div>
        <div class="job-details-jobs-unified-top-card__primary-description-container">
          <span class="tvm__text">Lagos, Nigeria</span><span class="tvm__text">2 days ago</span>
        </div>`,
    });
    expect(job).toEqual({
      title: "Frontend Developer",
      company: "Paystack",
      location: "Lagos, Nigeria",
      salary: "",
      url: "https://www.linkedin.com/jobs/view/4012345678/",
      source: "linkedin",
    });
  });

  it("falls back to the page title when LinkedIn changes its markup", () => {
    const job = parseAt("https://www.linkedin.com/jobs/view/senior-engineer-at-kuda-4099999999/?refId=x", {
      head: "<title>(3) Senior Engineer | Kuda | LinkedIn</title>",
    });
    expect(job.title).toBe("Senior Engineer");
    expect(job.company).toBe("Kuda");
    expect(job.url).toBe("https://www.linkedin.com/jobs/view/4099999999/");
  });
});

describe("Indeed", () => {
  it("reads the header and keeps only the job key in the link", () => {
    const job = parseAt("https://ng.indeed.com/viewjob?jk=a1b2c3d4&from=serp&vjs=3", {
      body: `
        <h1 data-testid="jobsearch-JobInfoHeader-title"><span>React Engineer - job post</span></h1>
        <div data-testid="inlineHeader-companyName"><a>Flutterwave</a></div>
        <div data-testid="inlineHeader-companyLocation">Remote</div>
        <div id="salaryInfoAndJobType"><span>₦600,000 a month</span></div>`,
    });
    expect(job).toEqual({
      title: "React Engineer",
      company: "Flutterwave",
      location: "Remote",
      salary: "₦600,000 a month",
      url: "https://ng.indeed.com/viewjob?jk=a1b2c3d4",
      source: "indeed",
    });
  });
});

describe("Company career sites", () => {
  it("uses schema.org JobPosting data", () => {
    const job = parseAt("https://careers.moniepoint.com/jobs/123?utm_source=x&utm_medium=y#apply", {
      head: jobPosting({
        title: "Product Designer &amp; Researcher",
        hiringOrganization: { "@type": "Organization", name: "Moniepoint" },
        jobLocation: { "@type": "Place", address: { addressLocality: "Lagos", addressCountry: "NG" } },
        baseSalary: { currency: "NGN", value: { minValue: 400000, maxValue: 550000, unitText: "MONTH" } },
      }),
    });
    expect(job).toEqual({
      title: "Product Designer & Researcher",
      company: "Moniepoint",
      location: "Lagos, NG",
      salary: "NGN 400,000–550,000 / month",
      url: "https://careers.moniepoint.com/jobs/123",
      source: "company_site",
    });
  });

  it("finds a JobPosting inside an @graph and handles remote jobs", () => {
    const graph = {
      "@context": "https://schema.org",
      "@graph": [{ "@type": "WebPage" }, { "@type": "JobPosting", title: "Backend Engineer", hiringOrganization: "Piggyvest", jobLocationType: "TELECOMMUTE" }],
    };
    const job = parseAt("https://piggyvest.com/careers/backend", {
      head: `<script type="application/ld+json">${JSON.stringify(graph)}</script>`,
    });
    expect(job.title).toBe("Backend Engineer");
    expect(job.company).toBe("Piggyvest");
    expect(job.location).toBe("Remote");
  });

  it("takes the company from hosted job board links", () => {
    const job = parseAt("https://jobs.lever.co/cowrywise/abc-123?lever-source=LinkedIn", {
      head: "<title>Cowrywise - Software Engineer</title>",
    });
    expect(job.company).toBe("Cowrywise");
    expect(job.title).toBe("Software Engineer");
    expect(job.url).toBe("https://jobs.lever.co/cowrywise/abc-123");
  });

  it("splits 'Role at Company' titles", () => {
    const job = parseAt("https://example.org/role", { head: "<title>Data Analyst at Andela</title>" });
    expect(job.title).toBe("Data Analyst");
    expect(job.company).toBe("Andela");
  });

  it("ignores broken JSON-LD instead of failing", () => {
    const job = parseAt("https://careers.example.com/x", {
      head: '<script type="application/ld+json">{ not json</script><title>QA Engineer</title>',
    });
    expect(job.title).toBe("QA Engineer");
    expect(job.company).toBe("Example");
  });
});
