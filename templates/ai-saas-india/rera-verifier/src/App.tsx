import { useState } from "react";
import LandingPage from "./components/LandingPage";
import DemoPage from "./components/DemoPage";

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
