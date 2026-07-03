import Link from "next/link";
import { CHAPTERS, BOOK } from "@/lib/book-data";

const StatsCard = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
  <div className="flex flex-col items-center p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-2xl font-bold text-primary">{value}</span>
    <span className="text-sm text-[var(--foreground)] opacity-60">{label}</span>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="hero-gradient text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
            First Edition &bull; 2025
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight leading-tight">{BOOK.title}</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2 font-light max-w-3xl mx-auto">{BOOK.subtitle}</p>
          <p className="text-white/70 mb-6 text-lg">by <span className="font-semibold text-white">{BOOK.author}</span></p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">15 Chapters</span>
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">150+ Pages</span>
            <span className="px-3 py-1 bg-white/15 rounded-full text-sm backdrop-blur-sm">Code Examples</span>
          </div>
          <Link href={`/chapter/${CHAPTERS[0].slug}`} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl text-lg hover:bg-white/90 transition-all shadow-lg">
            Start Reading →
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Chapters" value={CHAPTERS.length} icon="📖" />
          <StatsCard label="Pages" value="150+" icon="📄" />
          <StatsCard label="Concepts" value="15" icon="🏗️" />
          <StatsCard label="Code Examples" value="50+" icon="💻" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">All Chapters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHAPTERS.map((ch) => (
            <Link key={ch.id} href={`/chapter/${ch.slug}`} className="chapter-card block rounded-2xl bg-[var(--surface)] p-6 hover:no-underline group">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{ch.icon}</span>
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">Chapter {ch.number}</span>
                  <h4 className="text-lg font-bold text-[var(--foreground)] group-hover:text-primary transition-colors">{ch.title}</h4>
                </div>
              </div>
              <p className="text-sm text-[var(--foreground)] opacity-70 mb-3 line-clamp-2">{ch.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ch.topics.slice(0, 3).map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                ))}
              </div>
              <div className="text-xs opacity-50 group-hover:text-primary transition-colors">Read →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[var(--surface)] border-t border-[var(--border-color)] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-400 mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg">MK</div>
          <h3 className="text-2xl font-bold mb-2">About the Author</h3>
          <p className="text-lg text-[var(--foreground)] opacity-80 mb-4">
            <strong>{BOOK.author}</strong> is a passionate technologist with deep expertise in software architecture and distributed systems.
          </p>
          <p className="text-[var(--foreground)] opacity-60">&copy; 2025 {BOOK.author}. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}
