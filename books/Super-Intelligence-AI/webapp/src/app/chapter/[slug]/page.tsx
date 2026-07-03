import { CHAPTERS } from "@/lib/book-data";
import ChapterReader from "@/components/ChapterReader";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

// Generate static params for all chapters
export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({
    slug: chapter.slug,
  }));
}

// Slug to markdown filename mapping
const SLUG_TO_FILE: Record<string, string> = {
  "si-superintelligence-foundations": "chapter-01-superintelligence-foundations.md",
  "si-forms-of-superintelligence": "chapter-02-forms-of-superintelligence.md",
  "si-intelligence-explosion": "chapter-03-intelligence-explosion.md",
  "si-ai-development-paths": "chapter-04-ai-development-paths.md",
  "si-capabilities": "chapter-05-superintelligence-capabilities.md",
  "si-optimization-goals": "chapter-06-optimization-and-goal-systems.md",
  "si-control-problem": "chapter-07-the-control-problem.md",
  "si-philosophical-implications": "chapter-08-philosophical-implications.md",
  "si-research-landscape": "chapter-09-research-landscape.md",
  "si-roadmap": "chapter-10-roadmap-to-superintelligence.md",
};

async function getChapterContent(slug: string): Promise<string> {
  const fileName = SLUG_TO_FILE[slug];
  if (!fileName) return "";

  // Read from book-content directory (copied into webapp for deployment)
  const paths = [
    path.join(process.cwd(), "book-content", fileName),
    path.join(process.cwd(), "..", "book", fileName),
  ];

  for (const filePath of paths) {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }
  }

  return "";
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = CHAPTERS.find((c) => c.slug === slug);

  if (!chapter) {
    notFound();
  }

  const content = await getChapterContent(slug);

  return (
    <div>
      <ChapterReader content={content} currentChapter={chapter} />
    </div>
  );
}
