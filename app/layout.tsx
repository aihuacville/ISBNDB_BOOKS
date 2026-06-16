import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leverage ISBNDB API to serve readers, authors, and publishers",
  description:
    "Search the ISBNDB catalog to find the book that sparks your next Eureka or Aha! moment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
