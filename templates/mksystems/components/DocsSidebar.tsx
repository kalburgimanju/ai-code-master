"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/tokens", label: "Design Tokens" },
    ],
  },
  {
    title: "Layout",
    items: [
      { href: "/docs/components/card", label: "Card" },
      { href: "/docs/components/drawer", label: "Drawer" },
      { href: "/docs/components/accordion", label: "Accordion" },
      { href: "/docs/components/tabs", label: "Tabs" },
      { href: "/docs/components/breadcrumb", label: "Breadcrumb" },
      { href: "/docs/components/table", label: "Table" },
    ],
  },
  {
    title: "Forms",
    items: [
      { href: "/docs/components/button", label: "Button" },
      { href: "/docs/components/input", label: "Input" },
      { href: "/docs/components/textarea", label: "Textarea" },
      { href: "/docs/components/select", label: "Select" },
      { href: "/docs/components/checkbox", label: "Checkbox" },
      { href: "/docs/components/radio", label: "Radio" },
    ],
  },
  {
    title: "Data Display",
    items: [
      { href: "/docs/components/badge", label: "Badge" },
      { href: "/docs/components/avatar", label: "Avatar" },
      { href: "/docs/components/progress", label: "Progress" },
      { href: "/docs/components/spinner", label: "Spinner" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { href: "/docs/components/alert", label: "Alert" },
      { href: "/docs/components/modal", label: "Modal" },
      { href: "/docs/components/toast", label: "Toast" },
      { href: "/docs/components/tooltip", label: "Tooltip" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { href: "/docs/components/dropdown-menu", label: "Dropdown Menu" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto pb-8">
        {sections.map(({ title, items }) => (
          <div key={title}>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-3">
              {title}
            </h4>
            <ul className="space-y-0.5">
              {items.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      pathname === href
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
