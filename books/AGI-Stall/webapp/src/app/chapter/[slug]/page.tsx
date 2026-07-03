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

// Map slug to filename
const FILE_MAP: Record<string, string> = {
  "introduction-to-agi": "chapter-01-introduction-to-agi.md",
  "core-concepts": "chapter-02-core-concepts.md",
  "agi-architecture": "chapter-03-agi-architecture.md",
  "market-impact": "chapter-04-market-impact.md",
  "developing-agi": "chapter-05-developing-agi.md",
  "engineer-roadmap": "chapter-06-engineer-roadmap.md",
  "getting-jobs": "chapter-07-getting-jobs.md",
  "interview-preparation": "chapter-08-interview-preparation.md",
  "study-materials": "chapter-09-study-materials.md",
  "example-projects": "chapter-10-example-projects.md",
};

async function getChapterContent(slug: string): Promise<string> {
  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) return "";

  const fileName = FILE_MAP[slug];
  if (!fileName) return "";

  // Try to read from the book-content directory (copied into webapp for deployment)
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

  return getPlaceholderContent(chapter);
}

function getPlaceholderContent(chapter: (typeof CHAPTERS)[0]): string {
  return `# Chapter ${chapter.number}: ${chapter.title}

## ${chapter.subtitle}

*This chapter is being written. Content will be available soon.*

### Topics Covered

${chapter.topics.map((t) => `- ${t}`).join("\n")}

### About This Chapter

${chapter.description}

---

*Full content coming soon. Check back for the complete chapter.*
`;
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
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
