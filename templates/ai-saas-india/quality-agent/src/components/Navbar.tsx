import { Factory, Menu, X } from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

export default function Navbar({ onNavigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <Factory size={20} />
          </div>
          <span className="font-bold text-lg text-industrial">
            QualityAgent
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate("landing")}
            className="text-gray-600 hover:text-primary transition-colors cursor-pointer text-sm font-medium"
          >
            Home
          </button>
          <a
            href="#features"
            className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          >
            Pricing
          </a>
          <button
            onClick={() => onNavigate("demo")}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-5 rounded-lg text-sm transition-all cursor-pointer"
          >
            Try Demo
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 cursor-pointer"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 py-3 space-y-2">
          <button
            onClick={() => {
              onNavigate("landing");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-gray-600 hover:text-primary py-2 cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate("demo");
              setMenuOpen(false);
            }}
            className="block w-full text-left bg-primary text-white text-center py-2 rounded-lg font-semibold cursor-pointer"
          >
            Try Demo
          </button>
        </div>
      )}
    </nav>
  );
}
