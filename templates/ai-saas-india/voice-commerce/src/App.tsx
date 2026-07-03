import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { DemoPage } from "./components/DemoPage";
import type { Page } from "./types";

export function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <>
      {page === "home" && <LandingPage onNavigate={setPage} />}
      {page === "demo" && <DemoPage onBack={() => setPage("home")} />}
    </>
  );
}
