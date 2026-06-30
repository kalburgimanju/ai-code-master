import Link from 'next/link';
import { Play, Github, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-white mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center">
                <Play size={16} className="text-white fill-white" />
              </span>
              FaceFlow
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              AI-powered tools to create, grow, and monetize faceless YouTube channels.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-dark-400 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-dark-400 hover:text-white transition-colors"><Youtube size={18} /></a>
              <a href="#" className="text-dark-400 hover:text-white transition-colors"><Github size={18} /></a>
            </div>
          </div>

          {[
            { title: 'Product', links: ['Video Ideas', 'Script Generator', 'SEO Tools', 'Analytics', 'Pricing'] },
            { title: 'Resources', links: ['Blog', 'YouTube Guide', 'API Docs', 'Changelog'] },
            { title: 'Company', links: ['About', 'Contact', 'Privacy', 'Terms'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-dark-400 hover:text-brand-400 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700 text-center text-xs text-dark-500">
          &copy; {new Date().getFullYear()} FaceFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
