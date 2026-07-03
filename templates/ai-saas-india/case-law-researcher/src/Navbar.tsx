import { Scale, Menu, X } from "lucide-react";
import { useState } from "react";
import type { Page } from "./App";

interface NavbarProps {
  page: Page;
  setPage: (page: Page) => void;
}

export default function Navbar({ page, setPage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-navy-800 bg-navy-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setPage("landing")}
          className="flex items-center gap-2 text-accent transition hover:text-accent-light"
        >
          <Scale className="h-7 w-7" />
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold">
            CaseLaw<span className="text-navy-200"> India</span>
          </span>
        </button>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink
            label="Home"
            active={page === "landing"}
            onClick={() => setPage("landing")}
          />
          <NavLink
            label="Research"
            active={page === "demo"}
            onClick={() => setPage("demo")}
          />
          <NavLink label="Pricing" onClick={() => setPage("landing")} href="#pricing" />
          <NavLink label="Contact" onClick={() => setPage("landing")} href="#features" />
          <button
            onClick={() => setPage("demo")}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-navy-950 transition hover:bg-accent-light"
          >
            Start Researching
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-navy-200 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-navy-800 bg-navy-950 px-4 pb-4 md:hidden">
          <button
            onClick={() => {
              setPage("landing");
              setMobileOpen(false);
            }}
            className="block w-full py-2 text-left text-navy-200 transition hover:text-accent"
          >
            Home
          </button>
          <button
            onClick={() => {
              setPage("demo");
              setMobileOpen(false);
            }}
            className="block w-full py-2 text-left text-navy-200 transition hover:text-accent"
          >
            Research
          </button>
          <button
            onClick={() => {
              setPage("demo");
              setMobileOpen(false);
            }}
            className="mt-2 w-full rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-navy-950 transition hover:bg-accent-light"
          >
            Start Researching
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  label,
  active,
  onClick,
  href,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  if (href && onClick) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`text-sm font-medium transition ${
          active ? "text-accent" : "text-navy-300 hover:text-accent"
        }`}
      >
        {label}
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium transition ${
        active ? "text-accent" : "text-navy-300 hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}
