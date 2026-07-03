import './globals.css';
export const metadata = { title: 'AI Safety Expert', description: 'Build AI safety agents with custom guardrails and rules' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
