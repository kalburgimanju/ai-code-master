'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Plane, Globe } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/trip-planner', label: 'Trip Planner' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/booking', label: 'Book Now' },
  { href: '/cost-estimator', label: 'Cost Estimator' },
  { href: '/follow-up', label: 'Follow-up' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-dark-200/60 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-brand-500 to-ocean-500">
            <Plane size={20} className="text-white" />
          </div>
          <span className="text-brand-700">AI</span>
          <span className="text-dark-800">Travel</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-dark-500 hover:text-dark-800 hover:bg-dark-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/booking"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-brand-500/25 transition-all"
          >
            <Globe size={16} />
            Plan My Trip
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-dark-600 hover:bg-dark-50 rounded-lg"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-dark-100 shadow-lg">
          <ul className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-dark-600 hover:bg-dark-50'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-sm mt-2"
              >
                Plan My Trip
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
