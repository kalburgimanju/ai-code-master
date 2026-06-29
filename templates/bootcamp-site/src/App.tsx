import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Bootcamps from './components/Bootcamps';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EnrollmentModal from './components/EnrollmentModal';

const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBootcamp, setSelectedBootcamp] = useState('');

  const openEnrollment = (name: string) => {
    setSelectedBootcamp(name);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar onEnroll={() => openEnrollment('LaunchPad')} />
      <main>
        <Hero />
        <Bootcamps onEnroll={openEnrollment} />
        <Testimonials />
        <Pricing onEnroll={openEnrollment} />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bootcampName={selectedBootcamp}
      />
    </div>
  );
};

export default App;
