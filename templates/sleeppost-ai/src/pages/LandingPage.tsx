import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import AvatarShowcase from '../components/AvatarShowcase';
import AgentShowcase from '../components/AgentShowcase';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';

const LandingPage: React.FC = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AvatarShowcase />
      <AgentShowcase />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
};

export default LandingPage;
