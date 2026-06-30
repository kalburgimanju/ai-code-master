import Hero from '@/components/Hero';
import Link from 'next/link';
import { ArrowRight, Brain, PenTool, Film, Share2, Mail, Rocket } from 'lucide-react';
import { products, services, stats } from '@/lib/data';

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain size={24} />,
  PenTool: <PenTool size={24} />,
  Film: <Film size={24} />,
  Share2: <Share2 size={24} />,
  Mail: <Mail size={24} />,
  Rocket: <Rocket size={24} />,
};

export default function Home() {
  return (
    <>
      <Hero />

      {/* Stats */}
      <section className="bg-dark-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-dark-900">Our Products</h2>
            <p className="text-dark-400 mt-2 max-w-xl mx-auto">
              AI-powered tools built to transform how you work, create, and grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-dark-200 p-6 hover:shadow-lg hover:shadow-brand-500/5 hover:border-brand-200 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center text-white mb-4`}>
                  <span className="text-sm font-bold">{product.name.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-dark-900">{product.name}</h3>
                <p className="text-sm text-dark-400 mt-1">{product.tagline}</p>
                <p className="text-sm text-dark-500 mt-3 leading-relaxed">{product.description}</p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  View Product
                  <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-dark-200 text-dark-700 font-semibold hover:border-brand-300 hover:text-brand-600 transition-all"
            >
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-dark-900">Our Services</h2>
            <p className="text-dark-400 mt-2 max-w-xl mx-auto">
              End-to-end AI-powered services to accelerate your business growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-dark-200 p-6 hover:shadow-lg hover:shadow-brand-500/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  {iconMap[service.icon]}
                </div>
                <h3 className="text-lg font-bold text-dark-900">{service.title}</h3>
                <p className="text-sm text-dark-500 mt-2 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
            >
              View All Services
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-dark-900">
            Ready to Build with AI?
          </h2>
          <p className="text-dark-400 mt-3 max-w-xl mx-auto">
            Whether you need an AI product, content strategy, or startup guidance — we&apos;ve got you covered.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold hover:shadow-xl hover:shadow-brand-500/25 transition-all"
            >
              Get in Touch
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-dark-200 text-dark-700 font-semibold hover:border-brand-300 hover:text-brand-600 transition-all"
            >
              See Our Work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
