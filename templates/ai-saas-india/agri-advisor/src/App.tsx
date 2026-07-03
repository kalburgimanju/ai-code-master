import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import DemoPage from "./pages/DemoPage";

export type Page = "landing" | "demo";

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <div className="min-h-screen bg-white">
      {page === "landing" ? (
        <LandingPage onNavigate={setPage} />
      ) : (
        <DemoPage onNavigate={setPage} />
      )}
    </div>
  );
}
