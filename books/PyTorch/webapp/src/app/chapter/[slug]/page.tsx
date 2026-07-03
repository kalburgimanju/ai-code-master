import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { CHAPTERS } from "@/lib/book-data";
import ChapterReader from "@/components/ChapterReader";

export function generateStaticParams() {
  return CHAPTERS.map((ch) => ({ slug: ch.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = CHAPTERS.find((ch) => ch.slug === slug);

  if (!chapter) {
    notFound();
  }

  const fileName = chapter.filename;
  const paths = [
    path.join(process.cwd(), "book-content", fileName),
    path.join(process.cwd(), "..", "book", fileName),
  ];

  let content = "";
  for (const filePath of paths) {
    try {
      content = fs.readFileSync(filePath, "utf-8");
      break;
    } catch {
      continue;
    }
  }

  if (!content) {
    notFound();
  }

  return <ChapterReader chapter={chapter} content={content} />;
}
