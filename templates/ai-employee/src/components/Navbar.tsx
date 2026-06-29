import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { navLinks } from '../data';

interface NavbarProps {
  onCreateAgent: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCreateAgent }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-brand-400">MyAI</span>
          <span className="text-white">Employee</span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-dark-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={onCreateAgent}
          className="hidden md:inline-flex btn-primary !py-2 !px-4 text-sm cursor-pointer"
        >
          <Zap size={16} />
          Create AI Employee
        </button>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-dark-300">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900 border-t border-white/5 overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-dark-300 hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { setOpen(false); onCreateAgent(); }}
                  className="btn-primary text-center mt-2 w-full cursor-pointer"
                >
                  <Zap size={16} />
                  Create AI Employee
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
