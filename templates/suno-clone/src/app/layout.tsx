import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suno Clone — AI Song & Music Generator',
  description:
    'Describe a song and watch it come to life. Lyrics, style and music generated free with OpenRouter + Hugging Face.',
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
