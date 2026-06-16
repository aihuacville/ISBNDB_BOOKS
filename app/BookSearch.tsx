"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MARKETING_COPIES = [
  "Searching for your next Eureka | Aha! moment !",
  "Searching for your Eureka moment",
  "Find the book that sparks your next Eureka moment.",
  "Find the book that sparks your next Aha! moment.",
  "Discover your next Eureka moment.",
  "Discover your next Aha! moment.",
  "One book away from an Aha! moment.",
  "One book away from a Eureka moment.",
  "Where curiosity meets discovery.",
  "Search. Discover. Aha!",
];

const SEARCH_PLACEHOLDERS = [
  "Describe a problem, idea, topic, title, author, or ISBN...",
  "What are you looking for?",
  "Type a problem, idea, topic, title, author, or ISBN...",
  "What do you want to discover?",
  "Describe a challenge, interest, or book you have in mind...",
  "What are you curious about today?",
  "Search for an idea worth exploring",
  "Start with a question, keyword, or theme",
  "What problem are you trying to solve?",
  "Find a book by keyword, idea, or question",
  "Search by title, author, topic, or ISBN",
  "What are you trying to learn",
  "Search books, ideas, problems, or authors",
];

const SEARCH_EXAMPLES = [
  "How to build good habits",
  "Why do we sleep",
  "Stoicism and daily life",
  "Productivity for deep work",
  "How to make friends and influence people",
  "Understanding human behavior",
  "Atomic habits",
  "Leadership and decision making",
  "How to think clearly under pressure",
  "Books about longevity and health",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

interface Book {
  isbn13: string;
  title: string;
  authors: string[];
  image: string | null;
}

export default function BookSearch() {
  const [copy, setCopy] = useState({
    heading: MARKETING_COPIES[0],
    placeholder: SEARCH_PLACEHOLDERS[0],
  });
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [books, setBooks] = useState<Book[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pick the random copy/placeholder on mount only, so server and client
  // render the same markup before hydration, then swap in the random
  // pick. This intentionally fires once after mount rather than during
  // render, so disable the lint rule that nudges towards computing state
  // during render (not applicable here since the goal is to avoid a
  // hydration mismatch, not to sync with an external system).
  /* eslint-disable react-hooks/set-state-in-effect --
     one-time post-mount randomization, not external-state sync */
  useEffect(() => {
    setCopy({
      heading: pickRandom(MARKETING_COPIES),
      placeholder: pickRandom(SEARCH_PLACEHOLDERS),
    });
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;

    setDropdownOpen(false);
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong");
        setBooks(null);
        return;
      }

      setBooks(data.books);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to reach the search API");
      setBooks(null);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{copy.heading}</h2>
      <div id="searchWrapper" ref={wrapperRef}>
        <input
          type="text"
          id="searchInput"
          placeholder={copy.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch(query);
          }}
        />
        {dropdownOpen && (
          <ul id="searchDropdown">
            {SEARCH_EXAMPLES.map((example) => (
              <li
                key={example}
                onClick={() => {
                  setQuery(example);
                  runSearch(example);
                }}
              >
                {example}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === "loading" && <p className="search-status">Searching…</p>}
      {status === "error" && (
        <p className="search-status error">{errorMessage}</p>
      )}

      {books && books.length === 0 && status === "idle" && (
        <p className="search-status">No books found for &quot;{query}&quot;.</p>
      )}

      {books && books.length > 0 && (
        <ol id="searchResults">
          {books.map((book) => (
            <li key={book.isbn13 || book.title} className="book-result">
              {book.image && (
                <Image
                  src={book.image}
                  alt={book.title}
                  width={48}
                  height={72}
                  style={{ height: "auto" }}
                  unoptimized
                />
              )}
              <div>
                <div className="book-title">{book.title}</div>
                {book.authors.length > 0 && (
                  <div className="book-authors">{book.authors.join(", ")}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
