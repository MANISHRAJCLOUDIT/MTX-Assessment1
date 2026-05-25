import { describe, expect, it } from "vitest";
import faqData from "../faq.json";
import type { FaqItem } from "./types";
import {
  EMPTY_QUERY_MESSAGE,
  NO_RESULTS_MESSAGE,
  searchFaqs,
} from "./search";

const faqs = faqData as FaqItem[];

describe("searchFaqs", () => {
  it("returns at least one result for a query that should match an FAQ", () => {
    const outcome = searchFaqs("reset password", faqs);

    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.results.length).toBeGreaterThanOrEqual(1);
      expect(outcome.results[0].question.toLowerCase()).toContain("password");
    }
  });

  it("rejects empty or whitespace-only queries", () => {
    expect(searchFaqs("", faqs)).toEqual({
      status: "empty_query",
      message: EMPTY_QUERY_MESSAGE,
    });
    expect(searchFaqs("   \t  ", faqs)).toEqual({
      status: "empty_query",
      message: EMPTY_QUERY_MESSAGE,
    });
  });

  it("returns no results for unrelated queries", () => {
    const outcome = searchFaqs("zzzzxyzzyquantumflarn", faqs);
    expect(outcome.status).toBe("no_results");
    if (outcome.status === "no_results") {
      expect(outcome.message).toBe(NO_RESULTS_MESSAGE);
    }
  });

  it("limits results to three items", () => {
    const outcome = searchFaqs("account billing payment", faqs);
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.results.length).toBeLessThanOrEqual(3);
    }
  });

  it("filters by category when provided", () => {
    const outcome = searchFaqs("invoice", faqs, { category: "Billing" });
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.results.every((r) => r.category === "Billing")).toBe(true);
    }
  });
});
