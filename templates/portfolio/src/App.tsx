import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Briefcase, User, Mail, ExternalLink, Menu, X } from 'lucide-react';
import { format } from 'date-fns';
import Typewriter from 'react-typewriter';

import './App.css';

import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  featured?: boolean;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

const Navigation: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white hover:text-slate-300 transition-colors"
      >
        <X size={24} />
      </button>

      <ul className="flex flex-col gap-8 text-center">
        {navItems.map((item, index) => (
          <motion.li
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <a
              href={item.href}
              onClick={onClose}
              className="text-3xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              {item.label}
            </a>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};

const MainContent: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="relative">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
              Alex Johnson
            </Link>

            <button
              onClick={() => setNavOpen(!navOpen)}
              className="p-2 text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {navOpen && (
          <Navigation isOpen={navOpen} onClose={() => setNavOpen(false)} />
        )}
      </AnimatePresence>

      <main className="pt-16">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-400">© 2024 Alex Johnson. All rights reserved.</p>
            <p className="text-slate-500 text-sm mt-2">
              Built with React, TypeScript, and love for clean code.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

export default App;