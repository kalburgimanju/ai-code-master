import { products } from '@/lib/data';
import { ExternalLink } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-dark-900">Our Products</h1>
        <p className="text-dark-400 mt-3 max-w-xl mx-auto">
          AI-powered tools built to transform how you work, create, and grow.
        </p>
      </div>

      <div className="space-y-8">
        {products.map((product, i) => (
          <div
            key={product.id}
            id={product.id}
            className="bg-white rounded-2xl border border-dark-200 overflow-hidden hover:shadow-lg hover:shadow-brand-500/5 transition-all"
          >
            <div className="grid md:grid-cols-3 gap-0">
              <div className={`bg-gradient-to-br ${product.color} p-8 flex items-center justify-center`}>
                <div className="text-center text-white">
                  <span className="text-5xl font-extrabold">{product.name.charAt(0)}</span>
                  <p className="text-sm mt-2 opacity-80">{product.name}</p>
                </div>
              </div>
              <div className="md:col-span-2 p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">
                      Product {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-2xl font-bold text-dark-900 mt-1">{product.name}</h2>
                    <p className="text-brand-600 text-sm font-medium mt-1">{product.tagline}</p>
                  </div>
                  {product.url !== '#' && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 text-sm font-semibold hover:bg-brand-100 transition-colors shrink-0"
                    >
                      <ExternalLink size={14} />
                      Live Demo
                    </a>
                  )}
                </div>
                <p className="text-dark-500 text-sm leading-relaxed mt-4">{product.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
