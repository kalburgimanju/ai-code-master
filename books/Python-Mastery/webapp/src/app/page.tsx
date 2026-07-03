"use client";

import Link from "next/link";
import { BookOpen, Code, ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { BOOK, CHAPTERS, PARTS } from "@/lib/book-data";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--surface)]/80 border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">
              Python Mastery
            </span>
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

      {/* Hero */}
      <section className="hero-gradient text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-10 h-10" />
            <span className="text-lg font-medium opacity-90">A Book by {BOOK.author}</span>
          </div>
          <h1 className="animate-fade-in animate-delay-1 text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            {BOOK.title}
          </h1>
          <p className="animate-fade-in animate-delay-2 text-xl md:text-2xl opacity-90 mb-8 font-light">
            {BOOK.subtitle}
          </p>
          <p className="animate-fade-in animate-delay-3 text-base opacity-80 max-w-2xl mx-auto mb-10">
            {BOOK.description}
          </p>
          <Link
            href={`/chapter/${CHAPTERS[0].slug}`}
            className="animate-fade-in animate-delay-4 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-lg"
          >
            Start Reading
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
          Table of Contents
        </h2>

        {PARTS.map((part) => {
          const chapters = CHAPTERS.filter((ch) => ch.partNumber === part.number);
          return (
            <div key={part.number} className="mb-12">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Part {part.number}
                </span>
                {part.title}
              </h3>
              <div className="grid gap-4">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.slug}
                    href={`/chapter/${chapter.slug}`}
                    className="chapter-card rounded-xl p-5 bg-[var(--surface)] block"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-bold text-primary/30 min-w-[2.5rem]">
                        {String(chapter.number).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground mb-1">
                          {chapter.title}
                        </h4>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                          {chapter.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary/40 mt-1 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 text-center text-sm text-foreground/50">
        <p>&copy; {new Date().getFullYear()} {BOOK.author}. All rights reserved.</p>
      </footer>
    </div>
  );
}
