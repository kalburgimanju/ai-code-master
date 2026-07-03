import { CHAPTERS } from "@/lib/book-data";
import ChapterReader from "@/components/ChapterReader";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

export function generateStaticParams() {
  return CHAPTERS.map((ch) => ({ slug: ch.slug }));
}

const SLUG_TO_FILE: Record<string, string> = {
  "arch-microservices": "chapter-01-microservices.md",
  "arch-modular-monolith": "chapter-02-modular-monolith.md",
  "arch-event-driven": "chapter-03-event-driven.md",
  "arch-caching": "chapter-04-caching.md",
  "arch-load-balancing": "chapter-05-load-balancing.md",
  "arch-database-sharding": "chapter-06-database-sharding.md",
  "arch-database-replication": "chapter-07-database-replication.md",
  "arch-api-gateway": "chapter-08-api-gateway.md",
  "arch-cqrs": "chapter-09-cqrs.md",
  "arch-event-sourcing": "chapter-10-event-sourcing.md",
  "arch-cap-theorem": "chapter-11-cap-theorem.md",
  "arch-observability": "chapter-12-observability.md",
  "arch-distributed-transactions": "chapter-13-distributed-transactions.md",
  "arch-resilience": "chapter-14-resilience.md",
  "arch-clean-architecture": "chapter-15-clean-architecture.md",
};

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) notFound();

  const fileName = SLUG_TO_FILE[slug];
  let content = "";
  for (const dir of ["book-content", "../book"]) {
    try { content = fs.readFileSync(path.join(process.cwd(), dir, fileName), "utf-8"); break; } catch {}
  }
  if (!content) notFound();

  return <ChapterReader chapter={chapter} content={content} />;
}
