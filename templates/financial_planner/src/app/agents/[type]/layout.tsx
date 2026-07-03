import { AGENTS } from '@/lib/types';

export function generateStaticParams() {
  return AGENTS.map(a => ({ type: a.id }));
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
