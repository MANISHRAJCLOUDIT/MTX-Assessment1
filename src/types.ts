export type FaqCategory = "Billing" | "Technical" | "Account";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export interface SearchResult extends FaqItem {
  score: number;
}

export type SearchOutcome =
  | { status: "ok"; results: SearchResult[] }
  | { status: "empty_query"; message: string }
  | { status: "no_results"; message: string };
