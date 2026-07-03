import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import DemoPage from "./components/DemoPage";
import Footer from "./components/Footer";

type Page = "landing" | "demo";

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar currentPage={page} onNavigate={setPage} />
      {page === "landing" ? (
        <LandingPage onNavigateToDemo={() => setPage("demo")} />
      ) : (
        <DemoPage />
      )}
      <Footer />
    </div>
  );
}
