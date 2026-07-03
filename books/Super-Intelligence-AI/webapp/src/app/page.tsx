import Link from "next/link";
import { CHAPTERS, BOOK_INFO, PARTS } from "@/lib/book-data";

const delayClasses = ["animate-delay-1", "animate-delay-2", "animate-delay-3", "animate-delay-4"];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
            Super Intelligence AI
          </h1>
          <p className="text-xl md:text-2xl mb-2 opacity-90">
            The Complete Guide
          </p>
          <p className="text-lg opacity-75 mb-8 max-w-2xl">
            Understanding, Building, and Controlling the Future of Intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/chapter/${CHAPTERS[0].slug}`}
              className="px-8 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:bg-red-50 transition-colors text-lg"
            >
              Start Reading →
            </Link>
            <a
              href="#chapters"
              className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors text-lg"
            >
              Browse Chapters
            </a>
          </div>
          <p className="mt-6 text-sm opacity-60">
            By {BOOK_INFO.author} &bull; {BOOK_INFO.totalChapters} Chapters &bull; {BOOK_INFO.totalEstimatedPages}+ Pages
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            About This Book
          </h2>
          <p className="text-lg text-[var(--foreground)] opacity-70 max-w-3xl mx-auto">
            {BOOK_INFO.description}
          </p>
        </div>
      </section>

      {/* Parts & Chapters */}
      <section id="chapters" className="py-16 px-4 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          {PARTS.map((part) => (
            <div key={part.title} className="mb-16 last:mb-0">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  {part.title}
                </h2>
                <p className="text-[var(--foreground)] opacity-60">
                  {part.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {part.chapters.map((chapter, idx) => (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.slug}`}
                    className={`chapter-card p-6 rounded-2xl bg-[var(--surface)] animate-fade-in ${delayClasses[Math.min(idx, 3)]}`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{chapter.icon}</span>
                      <div>
                        <span className="text-xs font-medium text-primary opacity-80">
                          Chapter {chapter.number}
                        </span>
                        <h3 className="text-lg font-bold text-[var(--foreground)] mt-1">
                          {chapter.title}
                        </h3>
                        <p className="text-sm text-[var(--foreground)] opacity-60 mt-2">
                          {chapter.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {chapter.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {topic}
                            </span>
                          ))}
                          {chapter.topics.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--foreground)] opacity-60">
                              +{chapter.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[var(--surface)] border-t border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-[var(--foreground)] opacity-60">
            © 2025 {BOOK_INFO.author}. All rights reserved.
          </p>
          <p className="text-xs text-[var(--foreground)] opacity-40 mt-2">
            Super Intelligence AI: The Complete Guide — {BOOK_INFO.totalChapters} Chapters &bull; {BOOK_INFO.totalEstimatedPages}+ Pages
          </p>
        </div>
      </footer>
    </main>
  );
}
