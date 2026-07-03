import { projects } from '@/lib/data';

export function generateStaticParams() {
  return projects.map(p => ({ id: p.id }));
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
