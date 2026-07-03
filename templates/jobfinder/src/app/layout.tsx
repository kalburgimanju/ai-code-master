import './globals.css';
export const metadata = { title: 'JobFinder AI', description: 'Find jobs matching your resume' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
