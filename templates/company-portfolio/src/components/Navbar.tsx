'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-dark-900">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </span>
          NexusAI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/contact"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
          >
            Get Started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-dark-50">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-dark-100 bg-white px-4 py-4 space-y-2">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-dark-600">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-dark-100">
            <Link href="/contact" onClick={() => setOpen(false)} className="block px-5 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold text-center">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
