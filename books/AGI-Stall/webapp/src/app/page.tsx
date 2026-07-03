"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CHAPTERS, BOOK_INFO, PARTS } from "@/lib/book-data";

const StatsCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) => (
  <div className="flex flex-col items-center p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-2xl font-bold text-primary">{value}</span>
    <span className="text-sm text-[var(--foreground)] opacity-60">{label}</span>
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const filteredChapters = useMemo(() => {
    let chapters = CHAPTERS;
    if (selectedPart) {
      chapters = chapters.filter((c) => c.part === selectedPart);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      chapters = chapters.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.topics.some((t) => t.toLowerCase().includes(q))
      );
    }
    return chapters;
  }, [searchQuery, selectedPart]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="hero-gradient text-white py-20 px-6 relative overflow-hidden no-print">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
            {BOOK_INFO.edition} &bull; {BOOK_INFO.publishedYear}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight leading-tight">
            {BOOK_INFO.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2 font-light max-w-3xl mx-auto">
            {BOOK_INFO.subtitle}
          </p>
          <p className="text-white/70 mb-6 text-lg">
            by <span className="font-semibold text-white">{BOOK_INFO.author}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
              10 Chapters
            </span>
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
              ~150+ Pages
            </span>
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
              5 Projects
            </span>
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">
              25+ Interview Q&A
            </span>
          </div>
          <Link
            href={`/chapter/${CHAPTERS[0].slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Reading
            <span className="text-xl">→</span>
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 no-print">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Chapters" value={BOOK_INFO.totalChapters} icon="📖" />
          <StatsCard label="Pages" value="150+" icon="📄" />
          <StatsCard label="Projects" value="5" icon="🚀" />
          <StatsCard label="Interview Q&A" value="25+" icon="🎯" />
        </div>
      </section>

      {/* Description */}
      <section className="max-w-4xl mx-auto px-6 py-16 no-print">
        <h2 className="text-3xl font-bold mb-4 text-center">About This Book</h2>
        <p className="text-lg text-center text-[var(--foreground)] opacity-80 leading-relaxed">
          {BOOK_INFO.description}
        </p>
      </section>

      {/* Search & Filter */}
      <section className="max-w-6xl mx-auto px-6 pb-8 no-print">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search chapters, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedPart(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPart === null
                  ? "bg-primary text-white"
                  : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              All
            </button>
            {PARTS.map((part) => (
              <button
                key={part.title}
                onClick={() => setSelectedPart(part.title)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPart === part.title
                    ? "bg-primary text-white"
                    : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {part.title.split(": ")[1]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {!selectedPart && !searchQuery
          ? PARTS.map((part) => (
              <div key={part.title} className="mb-12">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold">{part.title}</h3>
                  <p className="text-[var(--foreground)] opacity-60">{part.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {part.chapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              </div>
            ))
          : (
              <div>
                <p className="text-[var(--foreground)] opacity-60 mb-6">
                  {filteredChapters.length} chapter{filteredChapters.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              </div>
            )}
      </section>

      {/* Author Section */}
      <section className="bg-[var(--surface)] border-t border-[var(--border-color)] py-16 px-6 no-print">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-500 mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            MK
          </div>
          <h3 className="text-2xl font-bold mb-2">About the Author</h3>
          <p className="text-lg text-[var(--foreground)] opacity-80 mb-4">
            <strong>Manjunath Kalburgi</strong> is a passionate technologist and AI enthusiast with
            deep expertise in machine learning, artificial intelligence, and emerging technologies.
            With a commitment to making complex AI concepts accessible, Manjunath has created this
            comprehensive guide to help the next generation of AGI engineers understand, develop,
            and build careers in artificial general intelligence.
          </p>
          <p className="text-[var(--foreground)] opacity-60">
            &copy; {BOOK_INFO.publishedYear} {BOOK_INFO.author}. All rights reserved.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border-color)] py-8 px-6 text-center text-[var(--foreground)] opacity-60 text-sm no-print">
        <p>
          {BOOK_INFO.title} &bull; {BOOK_INFO.author} &bull; {BOOK_INFO.edition}
        </p>
      </footer>
    </div>
  );
}

function ChapterCard({ chapter }: { chapter: (typeof CHAPTERS)[0] }) {
  return (
    <Link
      href={`/chapter/${chapter.slug}`}
      className="chapter-card block rounded-2xl bg-[var(--surface)] p-6 hover:no-underline group"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{chapter.icon}</span>
        <div>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Chapter {chapter.number}
          </span>
          <h4 className="text-xl font-bold text-[var(--foreground)] group-hover:text-primary transition-colors">
            {chapter.title}
          </h4>
        </div>
      </div>
      <p className="text-sm text-[var(--foreground)] opacity-70 mb-3 line-clamp-2">
        {chapter.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {chapter.topics.slice(0, 4).map((topic) => (
          <span
            key={topic}
            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
          >
            {topic}
          </span>
        ))}
        {chapter.topics.length > 4 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            +{chapter.topics.length - 4} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs opacity-50">
        <span>~{chapter.estimatedPages} pages</span>
        <span className="text-primary group-hover:translate-x-1 transition-transform">Read →</span>
      </div>
    </Link>
  );
}
