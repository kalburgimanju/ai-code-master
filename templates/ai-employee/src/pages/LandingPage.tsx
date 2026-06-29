import React, { useState } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import EmployeeShowcase from '../components/EmployeeShowcase';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import CreateAgentModal from '../components/CreateAgentModal';

const LandingPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Hero onCreateAgent={() => setModalOpen(true)} />
      <HowItWorks />
      <EmployeeShowcase />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <CreateAgentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default LandingPage;
