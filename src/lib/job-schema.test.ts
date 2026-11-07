import { describe, expect, it } from "vitest";
import { apiJobSchema, jobSchema } from "./job-schema";

const valid = { company: " Paystack ", title: "Frontend developer", source: "linkedin", status: "applied" };

describe("jobSchema", () => {
  it("trims text and turns empty optional fields into undefined", () => {
    const job = jobSchema.parse({ ...valid, url: "", location: "  ", salary: "₦500k/month" });
    expect(job.company).toBe("Paystack");
    expect(job.url).toBeUndefined();
    expect(job.location).toBeUndefined();
    expect(job.salary).toBe("₦500k/month");
  });

  it("needs a company and a title", () => {
    expect(jobSchema.safeParse({ ...valid, company: "" }).error?.issues[0].message).toBe("Enter the company name");
    expect(jobSchema.safeParse({ ...valid, title: " " }).error?.issues[0].message).toBe("Enter the job title");
  });

  it("only accepts http and https links", () => {
    expect(jobSchema.safeParse({ ...valid, url: "https://paystack.com/careers" }).success).toBe(true);
    expect(jobSchema.safeParse({ ...valid, url: "javascript:alert(1)" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, url: "paystack.com" }).success).toBe(false);
  });

  it("rejects unknown statuses and sources", () => {
    expect(jobSchema.safeParse({ ...valid, status: "ghosted" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...valid, source: "twitter" }).success).toBe(false);
  });
});

describe("apiJobSchema", () => {
  it("defaults source to other and status to saved for the extension", () => {
    const job = apiJobSchema.parse({ company: "Kuda", title: "Engineer", notes: null });
    expect(job.source).toBe("other");
    expect(job.status).toBe("saved");
    expect(job.notes).toBeUndefined();
  });
});
