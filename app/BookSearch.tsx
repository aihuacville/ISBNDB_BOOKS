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
  publisher: string | null;
  datePublished: string | null;
  pages: number | null;
  synopsis: string | null;
  subjects: string[];
  language: string | null;
}

function BookDetailModal({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-header">
          {book.image ? (
            <div className="modal-cover">
              <Image
                src={book.image}
                alt={book.title}
                width={100}
                height={148}
                style={{ borderRadius: 6, display: "block" }}
                unoptimized
              />
            </div>
          ) : (
            <div className="modal-cover modal-cover-placeholder" />
          )}
          <div className="modal-info">
            <h3>{book.title}</h3>
            {book.authors.length > 0 && (
              <div className="book-authors">{book.authors.join(", ")}</div>
            )}
            {book.publisher && (
              <div className="modal-meta">Publisher: {book.publisher}</div>
            )}
            {book.datePublished && (
              <div className="modal-meta">Published: {book.datePublished}</div>
            )}
            {book.pages && (
              <div className="modal-meta">{book.pages} pages</div>
            )}
            {book.language && (
              <div className="modal-meta">Language: {book.language}</div>
            )}
            <div className="modal-meta">ISBN-13: {book.isbn13}</div>
          </div>
        </div>

        {book.synopsis && (
          <div
            className="modal-synopsis"
            dangerouslySetInnerHTML={{ __html: book.synopsis }}
          />
        )}

        {book.subjects.length > 0 && (
          <div className="modal-subjects">
            {book.subjects.map((s) => (
              <span key={s} className="subject-tag">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    setSelectedBook(null);

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
        <div className="book-grid">
          {books.map((book) => (
            <div
              key={book.isbn13 || book.title}
              className="book-card"
              onClick={() => setSelectedBook(book)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedBook(book);
              }}
            >
              {book.image ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  width={100}
                  height={148}
                  className="book-card-cover"
                  unoptimized
                />
              ) : (
                <div className="book-card-cover book-card-cover-placeholder" />
              )}
              <div className="book-title">{book.title}</div>
              {book.authors.length > 0 && (
                <div className="book-authors">{book.authors.join(", ")}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}
