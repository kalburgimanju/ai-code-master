import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  currentPage: "landing" | "demo";
  onNavigate: (page: "landing" | "demo") => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Health<span className="text-teal-600">AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate("landing")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentPage === "landing"
                  ? "text-teal-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("demo")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentPage === "demo"
                  ? "text-teal-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Demo
            </button>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </a>
            <button
              onClick={() => onNavigate("demo")}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
            >
              Try Free
            </button>
          </div>

          <button
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                onNavigate("landing");
                setMobileOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate("demo");
                setMobileOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              Demo
            </button>
            <button
              onClick={() => {
                onNavigate("demo");
                setMobileOpen(false);
              }}
              className="block w-full bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-semibold text-center cursor-pointer"
            >
              Try Free
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
