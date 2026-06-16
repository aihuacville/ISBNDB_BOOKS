# ISBNDB Book Search — Full Stack

A Next.js (TypeScript, App Router) site that lets readers search the
[ISBNDB](https://isbndb.com) catalog for books matching a topic, title,
author, or ISBN.

---

## Features

- **Book card grid** — search results render as a responsive card grid with cover image, title, and author.
- **Click-to-detail modal** — click any card to open a detail panel showing publisher, date, pages, language, ISBN, synopsis (rendered as HTML), and subject tags. Close with `Esc`, the `×` button, or clicking outside.
- **Smart author search** — every query runs two ISBNDB requests in parallel: a full-text search and an author-column search. Results are merged and deduplicated, with author matches ranked first.
- **Query normalization** — repeated-syllable words are hyphenated before searching (e.g. `yoyo` → `yo-yo`), so `yoyo ma` finds Yo-Yo Ma correctly.
- **Query logging** — every successful search is appended to `data/queries.json` with the query text, timestamp, result count, and full book list.
- **Secure API key** — the ISBNDB key lives in `.env.local` (server-only) and is never sent to the browser.

---

## Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend & Backend | Next.js (TypeScript, App Router) | UI + server-side API route |
| Validation | Zod | Validates query params on the API route |
| External data | ISBNDB API | Book search/lookup, called server-side only |

```
Browser
  └── Next.js App Router (app/page.tsx, app/BookSearch.tsx)
        └── Next.js API Route (app/api/books/search/route.ts)
              ├── ISBNDB /books/{q}              (full-text search)
              └── ISBNDB /books/{q}?column=author (author search)
```

---

## Project layout

```
app/
  layout.tsx                Root layout, page metadata
  page.tsx                  Home page (static content + <BookSearch />)
  BookSearch.tsx            Client component: search box, card grid, detail modal
  globals.css               Site styles
  api/books/search/
    route.ts                Server-side proxy to ISBNDB with Zod validation,
                            parallel author search, query normalization, and logging
data/
  queries.json              Auto-generated log of every search query (gitignored)
.env.example                Template for required env vars
.env.local                  Your real ISBNDB_API_KEY (gitignored, not committed)
```

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in ISBNDB_API_KEY
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

---

## API

`GET /api/books/search?q=<term>`

- `q` is required, 1–200 chars (validated with Zod).
- Fires two ISBNDB requests in parallel (text + author column) and merges results.
- Normalizes repeated-syllable words in the query before searching (`yoyo` → `yo-yo`).
- Returns `{ books: [...] }` — each book has `isbn13`, `title`, `authors`, `image`,
  `publisher`, `datePublished`, `pages`, `synopsis`, `subjects`, `language`.
- Returns `400` on invalid input, `502` if ISBNDB is unreachable, and the
  upstream status code if ISBNDB itself errors.
- Appends every successful search to `data/queries.json`.

---

## Possible next steps

- **Accounts + saved books** — [Clerk](https://clerk.com) or
  [NextAuth.js](https://next-auth.js.org) for auth, plus
  [Prisma](https://prisma.io) + [Neon Postgres](https://neon.tech) to
  persist a user's saved/favorite books.
- **Rate limiting** — [Upstash Redis](https://upstash.com) in front of
  the search route if traffic grows, since ISBNDB plans have call limits.
- **E-commerce** (cart, Stripe checkout, order history, transactional
  email) — only relevant if the site starts actually selling books rather
  than just helping readers discover them.
