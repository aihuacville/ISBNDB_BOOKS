import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const QUERIES_FILE = path.join(process.cwd(), "data", "queries.json");

function saveQuery(q: string, books: unknown[]) {
  try {
    const existing = fs.existsSync(QUERIES_FILE)
      ? (JSON.parse(fs.readFileSync(QUERIES_FILE, "utf-8")) as unknown[])
      : [];
    existing.push({ query: q, timestamp: new Date().toISOString(), results: books.length, books });
    fs.writeFileSync(QUERIES_FILE, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("Failed to save query:", err);
  }
}

const ISBNDB_BASE_URL = "https://api2.isbndb.com";

const querySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(200, "Search query is too long"),
});

interface IsbndbBook {
  isbn13?: string;
  isbn?: string;
  title?: string;
  authors?: string[];
  image?: string;
  publisher?: string;
  date_published?: string;
  pages?: number;
  synopsis?: string;
  subjects?: string[];
  language?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") ?? "" });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ISBNDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ISBNDB_API_KEY" },
      { status: 500 },
    );
  }

  const { q } = parsed.data;

  let upstream: Response;
  try {
    upstream = await fetch(
      `${ISBNDB_BASE_URL}/books/${encodeURIComponent(q)}?pageSize=20`,
      { headers: { Authorization: apiKey } },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to reach ISBNDB" },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `ISBNDB request failed (${upstream.status})` },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as { books?: IsbndbBook[] };

  const books = (data.books ?? []).map((book) => ({
    isbn13: book.isbn13 ?? book.isbn ?? "",
    title: book.title ?? "Untitled",
    authors: book.authors ?? [],
    image: book.image ?? null,
    publisher: book.publisher ?? null,
    datePublished: book.date_published ?? null,
    pages: book.pages ?? null,
    synopsis: book.synopsis ?? null,
    subjects: book.subjects ?? [],
    language: book.language ?? null,
  }));

  saveQuery(q, books);

  return NextResponse.json({ books });
}
