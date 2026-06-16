# ISBNDB Book Search — Full Stack

A Next.js (TypeScript, App Router) site that lets readers search the
[ISBNDB](https://isbndb.com) catalog for books matching a topic, title,
author, or ISBN.

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
              └── ISBNDB API  (key stays server-side, never sent to the browser)
```

This replaces the previous static `index.html` / `script.js` site, which
called the ISBNDB API directly from the browser with the API key embedded
in client-side JS — visible to anyone who opened dev tools. The key now
lives in `ISBNDB_API_KEY` (server-only env var) and all ISBNDB calls go
through the `/api/books/search` route.

> **Note:** the key that was previously hardcoded in `script.js` has been
> moved into `.env.local`. Since it was exposed client-side before this
> change, consider rotating it in your ISBNDB dashboard.

---

## Project layout

```
app/
  layout.tsx              Root layout, page metadata
  page.tsx                Home page (static content + <BookSearch />)
  BookSearch.tsx           Client component: search box, dropdown, results
  globals.css              Site styles (ported from the old style.css)
  api/books/search/
    route.ts               Server-side proxy to ISBNDB, validated with Zod
.env.example               Template for required env vars
.env.local                 Your real ISBNDB_API_KEY (gitignored, not committed)
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
- Looks up `https://api2.isbndb.com/books/{q}` server-side using
  `ISBNDB_API_KEY`, and returns a trimmed `{ books: [...] }` shape
  (`isbn13`, `title`, `authors`, `image`).
- Returns `400` on invalid input, `502` if ISBNDB is unreachable, and the
  upstream status code if ISBNDB itself errors.

---

## Possible next steps

These aren't built yet — add them only if the feature is actually needed:

- **Accounts + saved books** — [Clerk](https://clerk.com) or
  [NextAuth.js](https://next-auth.js.org) for auth, plus
  [Prisma](https://prisma.io) + [Neon Postgres](https://neon.tech) to
  persist a user's saved/favorite books.
- **Rate limiting** — [Upstash Redis](https://upstash.com) in front of
  the search route if traffic grows, since ISBNDB plans have call limits.
- **E-commerce** (cart, Stripe checkout, order history, transactional
  email) — only relevant if the site starts actually selling books rather
  than just helping readers discover them.
