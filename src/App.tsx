import { FormEvent, useState } from "react";
import faqData from "../faq.json";
import { previewAnswer, searchFaqs } from "./search";
import type { FaqCategory, FaqItem, SearchOutcome } from "./types";

const faqs = faqData as FaqItem[];

const CATEGORIES: Array<FaqCategory | "All"> = [
  "All",
  "Billing",
  "Technical",
  "Account",
];

function categoryClass(category: FaqCategory): string {
  return `badge badge-${category.toLowerCase()}`;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "All">("All");
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearched(true);
    setOutcome(searchFaqs(query, faqs, { category }));
  }

  return (
    <div className="page">
      <header className="header">
        <p className="eyebrow">MTX Practical Exercise</p>
        <h1>FAQ Search</h1>
        <p className="subtitle">
          Search billing, technical, and account help articles from a local
          dataset.
        </p>
      </header>

      <main className="card">
        <form className="search-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="query">
            Your question
          </label>
          <div className="search-row">
            <input
              id="query"
              name="query"
              type="search"
              placeholder="e.g. reset password, download invoice"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </div>

          <label className="field-label" htmlFor="category">
            Category filter
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as FaqCategory | "All")
            }
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value === "All" ? "All categories" : value}
              </option>
            ))}
          </select>
        </form>

        <section className="results" aria-live="polite">
          {!hasSearched && (
            <p className="hint">
              Enter a question above and click Search to see up to three
              matching FAQs.
            </p>
          )}

          {hasSearched && outcome?.status === "empty_query" && (
            <p className="message message-warning" role="alert">
              {outcome.message}
            </p>
          )}

          {hasSearched && outcome?.status === "no_results" && (
            <p className="message message-muted" role="status">
              {outcome.message}
            </p>
          )}

          {hasSearched && outcome?.status === "ok" && (
            <ul className="result-list">
              {outcome.results.map((item) => (
                <li key={item.id} className="result-item">
                  <div className="result-meta">
                    <span className={categoryClass(item.category)}>
                      {item.category}
                    </span>
                    <span className="score">
                      Relevance {item.score.toFixed(2)}
                    </span>
                  </div>
                  <h2>{item.question}</h2>
                  <p>{previewAnswer(item.answer)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>{faqs.length} FAQs loaded from faq.json</span>
      </footer>
    </div>
  );
}
