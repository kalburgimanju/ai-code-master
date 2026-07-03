import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Text Voice Generator',
  description: 'Generate videos, voiceovers, and AI avatars from text prompts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-900 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
