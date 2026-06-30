'use client';

import Link from 'next/link';
import { Play, Sparkles, TrendingUp, BarChart3, Search, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: <Sparkles size={24} />, title: 'AI Script Generator', desc: 'Generate viral hooks, outlines, and full scripts in seconds. Never face writer\'s block again.', color: 'from-brand-500 to-brand-700' },
  { icon: <TrendingUp size={24} />, title: 'Trending Video Ideas', desc: 'Discover high-view potential topics before they trend. Stay ahead of the curve.', color: 'from-fire-500 to-accent-600' },
  { icon: <Search size={24} />, title: 'SEO Optimization', desc: 'Titles, descriptions, tags, and hashtags — all optimized for maximum discoverability.', color: 'from-sky-500 to-sky-600' },
  { icon: <BarChart3 size={24} />, title: 'Channel Analytics', desc: 'Track growth, revenue, and performance across all your faceless channels in one dashboard.', color: 'from-neon-500 to-neon-600' },
  { icon: <Zap size={24} />, title: 'Thumbnail Generator', desc: 'AI-powered thumbnails that drive clicks. A/B testing built in.', color: 'from-accent-500 to-fire-500' },
  { icon: <Play size={24} />, title: 'Faceless Automation', desc: 'Full pipeline from idea to upload. AI voice, visuals, captions — all hands-free.', color: 'from-brand-600 to-fire-500' },
];

const stats = [
  { value: '50K+', label: 'Channels Managed' },
  { value: '2.1B', label: 'Total Views Generated' },
  { value: '$18M+', label: 'Creator Revenue' },
  { value: '99.9%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Alex Rivera', channel: 'Mind Maze · 850K subs', text: 'I went from 0 to 850K subscribers in 14 months without ever showing my face. The script generator alone is worth 10x the price.', avatar: 'AR' },
  { name: 'Priya Sharma', channel: 'Tech Uncovered · 420K subs', text: 'The SEO tools are insane. My videos rank on the first page within hours of uploading. I quit my day job last month.', avatar: 'PS' },
  { name: 'Jordan Wells', channel: 'Dark Truths · 1.4M subs', text: 'Running 3 faceless channels simultaneously and only working 2 hours a day. FaceFlow makes it possible.', avatar: 'JW' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-fire-50 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-fire-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              AI-Powered Faceless YouTube
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-dark-900 leading-tight">
              Build faceless YouTube channels that{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-fire-500">
                print money
              </span>
            </h1>
            <p className="mt-6 text-lg text-dark-500 leading-relaxed max-w-2xl mx-auto">
              Generate scripts, optimize SEO, track analytics, and grow your channel — all without showing your face.
              Join 50,000+ creators who chose freedom over fame.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold text-lg shadow-lg shadow-brand-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles size={20} />
                Start Free — No Card Needed
              </Link>
              <Link
                href="/ideas"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-dark-200 text-dark-700 font-semibold text-lg hover:bg-dark-50 active:scale-[0.98] transition-all"
              >
                Explore Ideas
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {['No face required', 'AI-generated scripts', 'SEO optimized', 'Free to start'].map((perk) => (
                <span key={perk} className="flex items-center gap-1.5 text-sm text-dark-500">
                  <CheckCircle2 size={16} className="text-neon-500" /> {perk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</p>
                <p className="text-sm text-dark-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Everything You Need</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 tracking-tight">
              Your complete faceless channel toolkit
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-white border border-dark-200 hover:shadow-lg hover:border-brand-200 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-dark-800 mb-2">{f.title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 tracking-tight">
              From idea to uploaded video in 3 steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a Niche & Topic', desc: 'Browse trending ideas or enter your own. Our AI finds topics with high views and low competition.' },
              { step: '02', title: 'Generate the Script', desc: 'AI writes the hook, outline, full script, and CTA — optimized for watch time and engagement.' },
              { step: '03', title: 'Optimize & Publish', desc: 'SEO-optimized title, description, tags, and thumbnail suggestions. Export and upload in minutes.' },
            ].map((s) => (
              <div key={s.step} className="relative p-6 rounded-2xl bg-white border border-dark-200">
                <span className="text-5xl font-extrabold text-brand-100">{s.step}</span>
                <h3 className="text-xl font-bold text-dark-800 mt-4 mb-2">{s.title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Creator Stories</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 tracking-tight">
              Real creators, real results
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white border border-dark-200">
                <p className="text-sm text-dark-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-fire-400 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-800">{t.name}</p>
                    <p className="text-xs text-dark-400">{t.channel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-brand-500 to-fire-500 rounded-3xl p-12 text-white shadow-2xl shadow-brand-500/20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to build your faceless empire?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of creators earning passive income without ever showing their face.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
