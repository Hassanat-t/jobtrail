// Reads job details from the page the user is on.
//
// Chrome runs this function inside the job page (chrome.scripting.executeScript), so it must be
// self-contained: no imports and no variables from outside the function.
//
// Order of preference:
//   1. Site-specific selectors for LinkedIn and Indeed
//   2. schema.org JobPosting data (most company career sites and job boards include it)
//   3. The page title and Open Graph tags

/**
 * @returns {{ title: string, company: string, location: string, salary: string, url: string, source: string }}
 */
export function parseJobPage() {
  const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, 200);

  const firstText = (...selectors) => {
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        const t = clean(el.textContent);
        if (t) return t;
      }
    }
    return "";
  };

  const meta = (key) =>
    clean(document.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute("content"));

  const decodeEntities = (s) => {
    const el = document.createElement("textarea");
    el.innerHTML = s;
    return el.value;
  };

  const titleCase = (slug) =>
    slug
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  // ---- Which site is this? ----
  const host = location.hostname.replace(/^www\./, "");
  const onLinkedIn = /(^|\.)linkedin\.com$/.test(host);
  const onIndeed = /(^|\.)indeed\.[a-z.]+$/.test(host);
  const otherBoards = /(^|\.)(glassdoor|wellfound|jobberman|myjobmag|remoteok|weworkremotely|otta|welcometothejungle)\./;
  const source = onLinkedIn ? "linkedin" : onIndeed ? "indeed" : otherBoards.test(host) ? "other" : "company_site";

  // ---- A clean link to save (no tracking, one canonical form per job) ----
  function canonicalUrl() {
    const u = new URL(location.href);
    if (onLinkedIn) {
      const id = u.pathname.match(/\/jobs\/view\/(?:[^/]*?-)?(\d+)/)?.[1] ?? u.searchParams.get("currentJobId");
      if (id) return `https://www.linkedin.com/jobs/view/${id}/`;
    }
    if (onIndeed) {
      const jk = u.searchParams.get("jk") ?? u.searchParams.get("vjk");
      if (jk) return `${u.origin}/viewjob?jk=${jk}`;
    }
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_|gh_src$|ref$|refId$|trk|trackingId$|source$|lever-source)/i.test(key)) u.searchParams.delete(key);
    }
    return u.toString();
  }

  // ---- schema.org JobPosting ----
  function findJobPosting() {
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      let data;
      try {
        data = JSON.parse(script.textContent);
      } catch {
        continue;
      }
      const stack = [data];
      while (stack.length) {
        const item = stack.pop();
        if (!item || typeof item !== "object") continue;
        if (Array.isArray(item)) {
          stack.push(...item);
          continue;
        }
        const type = item["@type"];
        if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return item;
        if (item["@graph"]) stack.push(item["@graph"]);
      }
    }
    return null;
  }

  function postingLocation(posting) {
    if (posting.jobLocationType === "TELECOMMUTE") return "Remote";
    const places = [posting.jobLocation].flat().filter(Boolean);
    const names = places.map((p) => {
      const a = p.address ?? {};
      if (typeof a === "string") return a;
      const country = typeof a.addressCountry === "object" ? a.addressCountry?.name : a.addressCountry;
      return [a.addressLocality, a.addressRegion, country].filter(Boolean).join(", ");
    });
    return clean(names.filter(Boolean).join(" / "));
  }

  function postingSalary(posting) {
    const s = posting.baseSalary;
    if (!s || typeof s !== "object") return "";
    const v = s.value ?? {};
    const n = (x) => (typeof x === "number" ? x.toLocaleString("en-GB") : x);
    const amount =
      typeof v === "object"
        ? v.minValue && v.maxValue
          ? `${n(v.minValue)}–${n(v.maxValue)}`
          : n(v.value ?? v.minValue ?? v.maxValue)
        : n(v);
    if (!amount) return "";
    const unit = typeof v === "object" && v.unitText ? ` / ${String(v.unitText).toLowerCase()}` : "";
    return clean(`${s.currency ?? ""} ${amount}${unit}`);
  }

  // ---- Company from the address, for hosted job boards and career sites ----
  function companyFromUrl() {
    const atsPath = /(^|\.)(greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|breezy\.hr|smartrecruiters\.com)$/;
    const firstSegment = location.pathname.split("/").filter(Boolean)[0];
    if (atsPath.test(host) && firstSegment && !/^(jobs?|embed|o|j)$/i.test(firstSegment)) return titleCase(firstSegment);
    if (source !== "company_site") return "";
    const parts = host.split(".").filter((p) => !/^(careers?|jobs?|apply|boards|work|join)$/.test(p));
    return parts.length >= 2 ? titleCase(parts[parts.length - 2]) : "";
  }

  // ---- Title like "Frontend Developer | Paystack | LinkedIn" or "Engineer at Paystack" ----
  // `knownCompany` (from the URL or page) tells us which half is the company, e.g. "Cowrywise - Software Engineer".
  function fromPageTitle(knownCompany) {
    const raw = clean(meta("og:title") || document.title).replace(/^\(\d+\)\s*/, "");
    const parts = raw
      .split(/\s+[|–—-]\s+/)
      .map((p) => p.trim())
      .filter((p) => p && !/^(linkedin|indeed(\.com)?|careers?|jobs?)$/i.test(p));
    const known = knownCompany?.toLowerCase();
    const companyIndex = known ? parts.findIndex((p) => p.toLowerCase() === known) : -1;
    if (companyIndex !== -1 && parts.length >= 2) {
      return { title: parts.find((_, i) => i !== companyIndex), company: parts[companyIndex] };
    }
    let [title = "", company = ""] = parts;
    const at = title.match(/^(.+?)\s+at\s+(.+)$/i);
    if (at && !company) [, title, company] = at;
    return { title, company };
  }

  const result = { title: "", company: "", location: "", salary: "", url: canonicalUrl(), source };

  if (onLinkedIn) {
    result.title = firstText(
      ".job-details-jobs-unified-top-card__job-title h1",
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      ".top-card-layout__title",
      ".topcard__title",
    );
    result.company = firstText(
      ".job-details-jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name",
      ".topcard__org-name-link",
      ".top-card-layout__second-subline a",
    );
    result.location = firstText(
      ".job-details-jobs-unified-top-card__primary-description-container .tvm__text",
      ".job-details-jobs-unified-top-card__bullet",
      ".topcard__flavor--bullet",
    );
  } else if (onIndeed) {
    result.title = firstText(
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      ".jobsearch-JobInfoHeader-title",
    ).replace(/\s*-\s*job post$/i, "");
    result.company = firstText(
      '[data-testid="inlineHeader-companyName"]',
      '[data-company-name="true"]',
      ".jobsearch-CompanyInfoContainer a",
    );
    result.location = firstText(
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="job-location"]',
      '[data-testid="jobsearch-JobInfoHeader-companyLocation"]',
    );
    result.salary = firstText("#salaryInfoAndJobType span", '[data-testid="attribute_snippet_testid"]');
  }

  const posting = findJobPosting();
  if (posting) {
    const org = posting.hiringOrganization;
    result.title ||= clean(decodeEntities(String(posting.title ?? "")));
    result.company ||= clean(decodeEntities(String(typeof org === "string" ? org : (org?.name ?? ""))));
    result.location ||= postingLocation(posting);
    result.salary ||= postingSalary(posting);
  }

  const urlCompany = companyFromUrl();
  const fallback = fromPageTitle(result.company || urlCompany);
  result.title ||= fallback.title;
  result.company ||= fallback.company || urlCompany || meta("og:site_name");

  return result;
}
