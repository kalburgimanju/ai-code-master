"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { CHAPTERS, BOOK_INFO, type Chapter } from "@/lib/book-data";

interface ChapterReaderProps {
  content: string;
  currentChapter: Chapter;
}

export default function ChapterReader({ content, currentChapter }: ChapterReaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [readProgress, setReadProgress] = useState(0);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Extract headings for TOC
  const headings = content
    .split("\n")
    .filter((line) => line.startsWith("#"))
    .map((line) => {
      const match = line.match(/^(#{1,4})\s+(.+)/);
      if (!match) return null;
      return {
        level: match[1].length,
        text: match[2].replace(/[*_`]/g, ""),
        id: match[2]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      };
    })
    .filter(Boolean) as { level: number; text: string; id: string }[];

  // Track active heading on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean);
      let current = "";
      for (const el of headingElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) current = el.id;
        }
      }
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const currentIndex = CHAPTERS.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? CHAPTERS[currentIndex - 1] : null;
  const nextChapter = currentIndex < CHAPTERS.length - 1 ? CHAPTERS[currentIndex + 1] : null;

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readProgress}%` }} />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border-color)] z-40 no-print">
        <div className="flex items-center justify-between px-4 py-2 max-w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
            <Link href="/" className="text-sm font-semibold text-primary hover:underline hidden sm:inline">
              AGI Book
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-60">
            <span className="hidden md:inline">Chapter {currentChapter.number}</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="hidden lg:inline">{currentChapter.title}</span>
            <span className="lg:hidden">{currentChapter.icon}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Back to top"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12V4M4 7l4-4 4 4" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-12 min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-12 bottom-0 w-72 bg-[var(--surface)] border-r border-[var(--border-color)] overflow-y-auto transition-transform duration-300 z-30 no-print ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            {/* Chapter Header */}
            <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                Chapter {currentChapter.number}
              </span>
              <h2 className="text-lg font-bold text-[var(--foreground)] mt-1">
                {currentChapter.title}
              </h2>
              <p className="text-xs text-[var(--foreground)] opacity-60 mt-1">
                ~{currentChapter.estimatedPages} pages &bull; {currentChapter.part}
              </p>
            </div>

            {/* In-page TOC */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-50 mb-3">
                On this page
              </h3>
              <div className="space-y-1">
                {headings
                  .filter((h) => h.level <= 3)
                  .map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`block text-sm py-1 rounded transition-all ${
                        heading.level === 1
                          ? "pl-0 font-semibold"
                          : heading.level === 2
                            ? "pl-3"
                            : "pl-6 opacity-70"
                      } ${
                        activeSection === heading.id
                          ? "text-primary bg-primary/10"
                          : "text-[var(--foreground)] opacity-60 hover:opacity-100 hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
              </div>
            </div>

            {/* Chapter Navigation */}
            <div className="border-t border-[var(--border-color)] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-50 mb-3">
                Chapters
              </h3>
              <div className="space-y-1">
                {CHAPTERS.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/chapter/${ch.slug}`}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all ${
                      ch.id === currentChapter.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-[var(--foreground)] opacity-60 hover:opacity-100 hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <span className="text-base">{ch.icon}</span>
                    <span className="truncate">{ch.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-72" : "ml-0"
          } max-w-4xl px-6 md:px-12 py-12`}
        >
          {/* Chapter Title Card */}
          <div className="mb-10 pb-8 border-b-2 border-primary/20">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
              {currentChapter.part}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 -webkit-background-clip-text text-transparent bg-clip-text">
              Chapter {currentChapter.number}: {currentChapter.title}
            </h1>
            <p className="text-xl text-[var(--foreground)] opacity-70">{currentChapter.subtitle}</p>
          </div>

          {/* Markdown Content */}
          <article className="prose-book">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl font-extrabold mt-12 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold mt-10 mb-3 border-b-2 border-primary pb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mt-8 mb-2 text-primary">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold mt-6 mb-2 text-primary-light">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-justify">{children}</p>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-[#1c1917] text-[#e7e5e4] p-4 rounded-xl overflow-x-auto my-6 border border-[#44403c]">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 my-6 bg-primary/5 p-4 rounded-r-lg italic text-[var(--foreground)] opacity-80">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-primary text-white px-4 py-3 text-left font-semibold border border-[var(--border-color)]">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 border border-[var(--border-color)]">
                    {children}
                  </td>
                ),
                tr: ({ children }) => (
                  <tr className="odd:bg-primary/5 even:bg-transparent">{children}</tr>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[var(--foreground)]">{children}</li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary-dark"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-10 border-0 border-t-2 border-[var(--border-color)]" />,
                strong: ({ children }) => (
                  <strong className="font-bold text-primary">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Prev/Next Navigation */}
          <div className="mt-16 pt-8 border-t-2 border-[var(--border-color)]">
            <div className="flex justify-between items-stretch gap-4">
              {prevChapter ? (
                <Link
                  href={`/chapter/${prevChapter.slug}`}
                  className="flex-1 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="text-xs text-[var(--foreground)] opacity-50">← Previous</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{prevChapter.icon}</span>
                    <span className="font-semibold text-[var(--foreground)] group-hover:text-primary">
                      {prevChapter.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextChapter ? (
                <Link
                  href={`/chapter/${nextChapter.slug}`}
                  className="flex-1 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:border-primary hover:bg-primary/5 transition-all group text-right"
                >
                  <span className="text-xs text-[var(--foreground)] opacity-50">Next →</span>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="font-semibold text-[var(--foreground)] group-hover:text-primary">
                      {nextChapter.title}
                    </span>
                    <span className="text-xl">{nextChapter.icon}</span>
                  </div>
                </Link>
              ) : (
                <div className="flex-1 text-right p-4 rounded-xl border border-primary bg-primary/5">
                  <span className="text-sm text-primary font-bold">🎉 You finished the book!</span>
                  <Link
                    href="/"
                    className="block mt-2 text-sm text-primary underline hover:text-primary-dark"
                  >
                    Return to Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
