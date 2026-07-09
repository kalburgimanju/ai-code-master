import React from 'react';
import { Moon, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                <Moon size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">SleepPost</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              AI-powered social media management. Your brand never sleeps.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-500 hover:text-white text-sm transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-500 hover:text-white text-sm transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="text-gray-500 hover:text-white text-sm transition-colors">How It Works</a></li>
              <li><Link to="/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">API Reference</a></li>
              <li><a href="#faq" className="text-gray-500 hover:text-white text-sm transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 SleepPost AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 hover:text-white transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="text-gray-600 hover:text-white transition-colors">
              <Linkedin size={18} />
            </a>
            <a href="#" className="text-gray-600 hover:text-white transition-colors">
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
