import './globals.css';
import type { Metadata } from 'next';
import AppShell from './AppShell';

export const metadata: Metadata = {
  title: 'FinPlanner — AI-Powered Financial & Real Estate Platform',
  description: 'Analyze real estate projects in Hubli, Bangalore & Mysore. Get AI-powered financial planning, investment advice, legal opinions, and property management tools.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
