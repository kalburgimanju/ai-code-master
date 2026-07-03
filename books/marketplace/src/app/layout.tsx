import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookStore — AI & Tech Books',
  description: 'Browse and purchase premium AI, programming, and technology books.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>BookStore</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="btn-ghost text-sm">Browse Books</Link>
              <span className="text-dark-500 text-xs">By Manjunath Kalburgi</span>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-dark-700 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-dark-500 text-sm">
            © 2025 Manjunath Kalburgi. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
