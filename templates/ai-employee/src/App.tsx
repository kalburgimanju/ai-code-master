import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import EmployeeShowcase from './components/EmployeeShowcase';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import AgentDashboard from './components/AgentDashboard';
import EmbedPreview from './components/EmbedPreview';
import CTA from './components/CTA';
import Footer from './components/Footer';
import CreateAgentModal from './components/CreateAgentModal';

const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onCreateAgent={() => setModalOpen(true)} />
      <main>
        <Hero onCreateAgent={() => setModalOpen(true)} />
        <HowItWorks />
        <EmployeeShowcase />
        <Features />
        <Pricing />
        <Testimonials />
        <AgentDashboard />
        <EmbedPreview />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <CreateAgentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default App;
