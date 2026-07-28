"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Download,
  Users,
  ArrowLeft,
  Box,
} from "lucide-react";

const links = [
  { href: "/portal", label: "Overview", icon: LayoutDashboard },
  { href: "/portal/downloads", label: "Downloads", icon: Download },
  { href: "/portal/users", label: "Users", icon: Users },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-60 bg-neutral-900 text-neutral-300 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-1">
            <Box className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-white">Admin Portal</span>
          </div>
          <p className="text-xs text-neutral-500">MKSystems Analytics</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? "bg-brand-600/20 text-brand-400"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-8">{children}</main>
    </div>
  );
}
