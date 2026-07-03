import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import DemoPage from "./pages/DemoPage";

type Page = "landing" | "demo";

function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setPage("landing")}
              className="flex items-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
            >
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#4f46e5" />
                <text
                  x="16"
                  y="22"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  GST
                </text>
              </svg>
              GST Automation Agent
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage("landing")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
                  page === "landing"
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setPage("demo")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer ${
                  page === "demo"
                    ? "text-white bg-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-16">
        {page === "landing" && <LandingPage onNavigateToDemo={() => setPage("demo")} />}
        {page === "demo" && <DemoPage />}
      </main>
    </div>
  );
}

export default App;
