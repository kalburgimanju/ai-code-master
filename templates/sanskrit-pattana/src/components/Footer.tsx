import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-sanskritBlue-500 p-2 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">संस्कृत-पतनम्</span>
            </Link>
            <p className="text-slate-400 text-sm">
              Your comprehensive platform for learning Sanskrit from beginner to advanced levels.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/curriculum" className="text-slate-400 hover:text-white">Curriculum</Link></li>
              <li><Link to="/resources" className="text-slate-400 hover:text-white">Resources</Link></li>
              <li><Link to="/practice" className="text-slate-400 hover:text-white">Practice</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-white">About</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/books" className="text-slate-400 hover:text-white">Books & Texts</Link></li>
              <li><Link to="/audio" className="text-slate-400 hover:text-white">Audio Lessons</Link></li>
              <li><Link to="/videos" className="text-slate-400 hover:text-white">Video Tutorials</Link></li>
              <li><Link to="/references" className="text-slate-400 hover:text-white">References</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@sanskritpattana.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91-XXXX-XXXX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {currentYear} Sanskrit Pattana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;