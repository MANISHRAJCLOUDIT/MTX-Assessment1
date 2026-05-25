import type { FaqItem, FaqCategory, SearchOutcome, SearchResult } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "must", "shall", "can", "need", "i", "you", "he", "she", "it",
  "we", "they", "what", "which", "who", "when", "where", "why", "how",
  "my", "your", "our", "their", "this", "that", "these", "those", "me",
]);

export const EMPTY_QUERY_MESSAGE =
  "Please enter a search term before searching.";

export const NO_RESULTS_MESSAGE =
  "No results found. Try different keywords or remove the category filter.";

const MAX_RESULTS = 3;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function buildDocumentText(item: FaqItem): string {
  return `${item.question} ${item.answer} ${item.category}`;
}

function termFrequency(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

function cosineSimilarity(
  queryTf: Map<string, number>,
  docTf: Map<string, number>,
  idf: Map<string, number>,
): number {
  let dot = 0;
  let queryNorm = 0;
  let docNorm = 0;

  const allTerms = new Set([...queryTf.keys(), ...docTf.keys()]);

  for (const term of allTerms) {
    const q = (queryTf.get(term) ?? 0) * (idf.get(term) ?? 0);
    const d = (docTf.get(term) ?? 0) * (idf.get(term) ?? 0);
    dot += q * d;
    queryNorm += q * q;
    docNorm += d * d;
  }

  if (queryNorm === 0 || docNorm === 0) return 0;
  return dot / (Math.sqrt(queryNorm) * Math.sqrt(docNorm));
}

function computeIdf(corpus: string[][]): Map<string, number> {
  const docCount = corpus.length;
  const documentFrequency = new Map<string, number>();

  for (const doc of corpus) {
    const unique = new Set(doc);
    for (const term of unique) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of documentFrequency) {
    idf.set(term, Math.log((1 + docCount) / (1 + df)) + 1);
  }
  return idf;
}

export function searchFaqs(
  query: string,
  faqs: FaqItem[],
  options?: { category?: FaqCategory | "All" },
): SearchOutcome {
  const trimmed = query.trim();
  if (!trimmed) {
    return { status: "empty_query", message: EMPTY_QUERY_MESSAGE };
  }

  const categoryFilter = options?.category ?? "All";
  const filtered =
    categoryFilter === "All"
      ? faqs
      : faqs.filter((item) => item.category === categoryFilter);

  if (filtered.length === 0) {
    return { status: "no_results", message: NO_RESULTS_MESSAGE };
  }

  const queryTokens = tokenize(trimmed);
  if (queryTokens.length === 0) {
    return { status: "empty_query", message: EMPTY_QUERY_MESSAGE };
  }

  const corpusTokens = filtered.map((item) => tokenize(buildDocumentText(item)));
  const idf = computeIdf(corpusTokens);
  const queryTf = termFrequency(queryTokens);

  const scored: SearchResult[] = filtered
    .map((item, index) => {
      const docTf = termFrequency(corpusTokens[index]);
      let score = cosineSimilarity(queryTf, docTf, idf);

      const queryLower = trimmed.toLowerCase();
      const haystack = buildDocumentText(item).toLowerCase();
      if (haystack.includes(queryLower)) {
        score += 0.5;
      }

      for (const token of queryTokens) {
        if (item.question.toLowerCase().includes(token)) {
          score += 0.15;
        }
        if (item.category.toLowerCase() === token) {
          score += 0.25;
        }
      }

      return { ...item, score };
    })
    .filter((item) => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  if (scored.length === 0) {
    return { status: "no_results", message: NO_RESULTS_MESSAGE };
  }

  return { status: "ok", results: scored };
}

export function previewAnswer(answer: string, maxLength = 160): string {
  if (answer.length <= maxLength) return answer;
  return `${answer.slice(0, maxLength).trimEnd()}…`;
}
