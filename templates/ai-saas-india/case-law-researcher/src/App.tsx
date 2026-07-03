import { useState } from "react";
import DemoPage from "./DemoPage";
import LandingPage from "./LandingPage";
import Navbar from "./Navbar";

export type Page = "landing" | "demo";

function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <div className="min-h-screen bg-navy-950 text-gray-100">
      <Navbar page={page} setPage={setPage} />
      {page === "landing" ? (
        <LandingPage setPage={setPage} />
      ) : (
        <DemoPage />
      )}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-accent">
              CaseLaw India
            </h3>
            <p className="text-sm text-navy-300">
              AI-powered legal research for the Indian judiciary. Search, analyse and cite
              judgments from the Supreme Court and all High Courts.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-200">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-navy-300">
              <li className="hover:text-accent cursor-pointer transition">Judgment Search</li>
              <li className="hover:text-accent cursor-pointer transition">Citation Generator</li>
              <li className="hover:text-accent cursor-pointer transition">Case Summaries</li>
              <li className="hover:text-accent cursor-pointer transition">Draft Assistant</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-200">
              Courts Covered
            </h4>
            <ul className="space-y-2 text-sm text-navy-300">
              <li>Supreme Court of India</li>
              <li>All 25 High Courts</li>
              <li>Appellate Tribunals</li>
              <li>NCLT / NCLAT</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-200">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-navy-300">
              <li className="hover:text-accent cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-accent cursor-pointer transition">Terms of Service</li>
              <li className="hover:text-accent cursor-pointer transition">Disclaimer</li>
              <li className="hover:text-accent cursor-pointer transition">Contact</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-navy-800 pt-6 text-center text-xs text-navy-400">
          <p>
            &copy; {new Date().getFullYear()} CaseLaw India. All rights reserved. This tool is for
            research purposes only and does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default App;
