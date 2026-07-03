import { Link } from 'react-router-dom';
import { Truck, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">HyperRoute</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
            <Link to="/demo" className="btn-primary text-sm !px-4 !py-2">
              Try Demo
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-4 pb-4">
          <a href="#features" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#pricing" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>Pricing</a>
          <Link to="/demo" className="btn-primary mt-2 text-sm" onClick={() => setMobileOpen(false)}>Try Demo</Link>
        </div>
      )}
    </nav>
  );
}
