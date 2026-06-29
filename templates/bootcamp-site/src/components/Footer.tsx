import React from 'react';
import { GraduationCap, Github, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <GraduationCap size={28} className="text-brand-400" />
              LaunchPad
            </a>
            <p className="text-sm leading-relaxed">
              AI-powered bootcamps that turn learners into builders. Based in Bangalore, serving the world.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:text-brand-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-brand-400 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-brand-400 transition-colors"><Github size={20} /></a>
              <a href="#" className="hover:text-brand-400 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Bootcamps */}
          <div>
            <h4 className="text-white font-semibold mb-4">Bootcamps</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#bootcamps" className="hover:text-white transition-colors">AI Web Development</a></li>
              <li><a href="#bootcamps" className="hover:text-white transition-colors">AI & Data Science</a></li>
              <li><a href="#bootcamps" className="hover:text-white transition-colors">AI Product Design</a></li>
              <li><a href="#bootcamps" className="hover:text-white transition-colors">AI DevOps & Cloud</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
          <p>© 2026 LaunchPad. All rights reserved. Made with ❤️ in Bangalore.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
