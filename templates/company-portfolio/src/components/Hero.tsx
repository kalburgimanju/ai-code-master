import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-fire-50 opacity-60" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-fire-200 rounded-full blur-3xl opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium mb-8">
            <Sparkles size={14} />
            AI-Powered SaaS Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-900 leading-tight tracking-tight">
            Build Smarter with{' '}
            <span className="bg-gradient-to-r from-brand-500 to-fire-500 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h1>

          <p className="mt-6 text-lg text-dark-500 max-w-2xl mx-auto leading-relaxed">
            From AI video generation to employee automation, travel planning to faceless YouTube channels &mdash;
            we build the tools that power the next generation of businesses.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold hover:shadow-xl hover:shadow-brand-500/25 transition-all"
            >
              Explore Products
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-dark-200 bg-white text-dark-700 font-semibold hover:border-brand-300 hover:text-brand-600 transition-all"
            >
              Our Services
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-dark-400">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-accent-500" />
              <span>AI-First Technology</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-neon-500" />
              <span>Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-500" />
              <span>6+ Products</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
