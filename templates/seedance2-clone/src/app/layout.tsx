import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Highfi 2 — Multimodal AI Video & Image Studio',
  description:
    'Reference anything, edit anything, create anything. Generate videos and images from text, images, video and audio with Highfi 2 agents powered by OpenRouter.',
};

import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-ink-100 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
