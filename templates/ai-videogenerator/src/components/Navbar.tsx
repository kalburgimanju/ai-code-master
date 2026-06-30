'use client';

import Link from 'next/link';
import { Video } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-dark-900">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center">
            <Video size={18} className="text-white" />
          </span>
          AI Video Generator
        </Link>
      </div>
    </nav>
  );
}
