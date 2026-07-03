import './globals.css';
export const metadata = { title: 'Bank Analyzer', description: 'Indian bank customer analysis with budgets and expenditure tracking' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
