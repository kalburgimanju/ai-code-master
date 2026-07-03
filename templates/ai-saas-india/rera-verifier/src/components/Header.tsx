import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";

interface HeaderProps {
  onNavigate: (page: Page) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2"
        >
          <Shield className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-primary-900">
            RERA<span className="text-primary-600">Verify</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Pricing
          </a>
          <button
            onClick={() => onNavigate("demo")}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-700 transition-colors"
          >
            Try Free Demo
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="border-t border-primary-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-primary-600"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-primary-600"
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-primary-600"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </a>
            <button
              onClick={() => {
                setMenuOpen(false);
                onNavigate("demo");
              }}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-md"
            >
              Try Free Demo
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
