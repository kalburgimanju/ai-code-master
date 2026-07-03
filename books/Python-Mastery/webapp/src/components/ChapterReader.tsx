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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    if (typeof window !== "undefined") {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      setProgress(scrolled);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      const prevChapter = CHAPTERS.find((c) => c.number === chapter.number - 1);
      if (prevChapter) {
        window.location.href = `/chapter/${prevChapter.slug}`;
      }
    } else if (e.key === "ArrowRight") {
      const nextChapter = CHAPTERS.find((c) => c.number === chapter.number + 1);
      if (nextChapter) {
        window.location.href = `/chapter/${nextChapter.slug}`;
      }
    } else if (e.key === "Escape" && isMenuOpen) {
      setIsMenuOpen(false);
    } else if (e.key === "/" && !isMenuOpen) {
      e.preventDefault();
      setIsMenuOpen(true);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown, isMenuOpen]);

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Navbar */}
      <nav className="md:hidden bg-[var(--surface)]/80 backdrop-blur-sm border-b border-[var(--border-color)] px-4 py-3 z-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button onClick={handleMenuToggle} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Python Mastery</span>
            </Link>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Desktop Navbar */}
      <nav className="hidden md:block sticky top-0 z-40 backdrop-blur-md bg-[var(--surface)]/80 border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Python Mastery</span>
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--surface)]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
            <span className="font-bold text-lg text-foreground">Chapters</span>
            <button onClick={handleMenuToggle} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-6 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors"
              >
                <BookOpen className="w-5 h-5 text-primary" />
                Home
              </Link>
              {CHAPTERS.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/chapter/${ch.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${chapter.slug === ch.slug ? "bg-[var(--surface-hover)] text-primary" : "hover:bg-[var(--surface-hover)] transition-colors"}`}
                >
                  <span className="w-5 flex-shrink-0"> {ch.number} </span>
                  {ch.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-[var(--border-color)] px-4 py-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full px-4 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-2"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-5 h-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleMenuToggle} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors md:hidden">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-foreground/60">
              Chapter {chapter.number} of {CHAPTERS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50">
              {Math.round(progress)}% Complete
            </span>
            <div className="w-16 h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-width duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <article className="prose-book dark:prose-book mx-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            className="max-w-none"
          >
            {content}
          </ReactMarkdown>
        </article>

        <div className="mt-12 flex justify-between">
          {chapter.number > 1 ? (
            <Link
              href={`/chapter/${CHAPTERS.find((c) => c.number === chapter.number - 1)?.slug}`}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden md:inline">Previous Chapter</span>
            </Link>
          ) : (
            <div />
          )}
          {chapter.number < CHAPTERS.length ? (
            <Link
              href={`/chapter/${CHAPTERS.find((c) => c.number === chapter.number + 1)?.slug}`}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <span className="hidden md:inline">Next Chapter</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${progress}%` }}></div>
    </div>
  );
}
