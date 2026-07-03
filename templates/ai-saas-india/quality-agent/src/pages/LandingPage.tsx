import type { Page } from "../App";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Props {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}
