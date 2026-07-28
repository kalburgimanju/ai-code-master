'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Music, Menu, X, Sparkles } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Create' },
  { href: '/library', label: 'Library' },
  { href: '/guide', label: 'Guide' },
  { href: '/api-docs', label: 'API' },
  { href: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-purple-400 shadow-lg shadow-brand-500/30">
            <Music className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Suno<span className="gradient-text">Clone</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-300 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink-300">{session.user?.name || session.user?.email}</span>
              <button onClick={() => signOut()} className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-white">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => signIn()} className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-white">
              Sign In
            </button>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400"
          >
            <Sparkles className="h-4 w-4" /> Create
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
