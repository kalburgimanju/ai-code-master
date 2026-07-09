import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Menu, X } from 'lucide-react';
import { navLinks } from '../data';
import GradientButton from './shared/GradientButton';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Moon size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Sleep<span className="gradient-text">Post</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
              Dashboard
            </Link>
            <GradientButton size="sm" href="#pricing">
              Get Started
            </GradientButton>
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 glass rounded-2xl p-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              className="block text-brand-400 hover:text-brand-300 transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
