import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-neutral-500 hover:text-brand-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-neutral-900 font-medium" : "text-neutral-500"}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
