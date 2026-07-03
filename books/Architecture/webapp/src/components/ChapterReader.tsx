"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { BookOpen, ChevronLeft, ChevronRight, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { CHAPTERS } from "@/lib/book-data";
import type { Chapter } from "@/lib/book-data";

interface ChapterReaderProps {
  chapter: Chapter;
  content: string;
}

export default function ChapterReader({ chapter, content }: ChapterReaderProps) {
  const { theme, setTheme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentIndex = CHAPTERS.findIndex((ch) => ch.slug === chapter.slug);
  const prevChapter = currentIndex > 0 ? CHAPTERS[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < CHAPTERS.length - 1 ? CHAPTERS[currentIndex + 1] : null;

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
  }, []);

  useEffect(() => {
    setMounted(true);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen">
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      {/* Top navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--surface)]/80 border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm text-foreground hidden sm:inline">
                Safety Experts
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50 mr-2">
              Ch {chapter.number} / {CHAPTERS.length}
            </span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[53px] left-0 z-30 h-[calc(100vh-53px)] w-72 bg-[var(--surface)] border-r border-[var(--border-color)] overflow-y-auto transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              {chapter.part}
            </p>
            <p className="text-sm font-bold text-foreground mb-4">
              Part {chapter.partNumber}
            </p>

            {CHAPTERS.map((ch) => (
              <Link
                key={ch.slug}
                href={`/chapter/${ch.slug}`}
                onClick={() => setSidebarOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm mb-1 transition-all ${
                  ch.slug === chapter.slug
                    ? "sidebar-active font-semibold"
                    : "text-foreground/70 hover:bg-[var(--surface-hover)] hover:text-foreground"
                }`}
              >
                <span className="text-foreground/40 mr-2 text-xs">
                  {String(ch.number).padStart(2, "0")}
                </span>
                {ch.title}
              </Link>
            ))}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-8 py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary mb-1">
              Chapter {chapter.number}
            </p>
            <p className="text-xs text-foreground/50 mb-4">
              Part {chapter.partNumber}: {chapter.part}
            </p>
          </div>

          <article className="prose-book text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Chapter navigation */}
          <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex justify-between items-center gap-4">
            {prevChapter ? (
              <Link
                href={`/chapter/${prevChapter.slug}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border-color)] hover:border-primary hover:bg-primary/5 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-xs text-foreground/50">Previous</p>
                  <p className="font-medium text-foreground">{prevChapter.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Link
                href={`/chapter/${nextChapter.slug}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border-color)] hover:border-primary hover:bg-primary/5 transition-all text-sm"
              >
                <div className="text-right">
                  <p className="text-xs text-foreground/50">Next</p>
                  <p className="font-medium text-foreground">{nextChapter.title}</p>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all text-sm font-medium"
              >
                Back to Home
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
