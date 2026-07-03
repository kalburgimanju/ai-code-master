import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  currentPage: "landing" | "chat" | "resources";
  onNavigate: (page: "landing" | "chat" | "resources") => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ayurvedic-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 bg-ayurvedic-500 rounded-lg flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Ayur<span className="text-ayurvedic-600">Vedic</span>
              <span className="text-ayurvedic-500 text-xs ml-1">AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate("landing")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentPage === "landing"
                  ? "text-ayurvedic-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("chat")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentPage === "chat"
                  ? "text-ayurvedic-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Chat Assistant
            </button>
            <button
              onClick={() => onNavigate("resources")}
              className={`text-sm font-medium cursor-pointer transition-colors ${
                currentPage === "resources"
                  ? "text-ayurvedic-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => onNavigate("chat")}
              className="bg-ayurvedic-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-ayurvedic-600 transition-colors cursor-pointer shadow-md hover:shadow-lg"
            >
              Get Treatment Plan
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
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-ayurvedic-50 rounded-lg cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate("chat");
                setMobileOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-ayurvedic-50 rounded-lg cursor-pointer"
            >
              Chat Assistant
            </button>
            <button
              onClick={() => {
                onNavigate("resources");
                setMobileOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-ayurvedic-50 rounded-lg cursor-pointer"
            >
              Resources
            </button>
            <button
              onClick={() => {
                onNavigate("chat");
                setMobileOpen(false);
              }}
              className="block w-full bg-ayurvedic-500 text-white px-5 py-2 rounded-lg text-sm font-semibold text-center cursor-pointer"
            >
              Get Treatment Plan
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}