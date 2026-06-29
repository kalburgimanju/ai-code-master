import React from 'react';
import Link from 'next/link';
import { Plane, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-brand-500 to-ocean-500">
                <Plane size={20} className="text-white" />
              </div>
              <span className="text-brand-400">AI</span>
              <span className="text-white">Travel</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered travel agency that plans, books, and manages your trips. From dream to destination.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail size={14} /> hello@aitravel.com</p>
              <p className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> Bangalore, India</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Destinations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/destinations" className="hover:text-white transition-colors">All Destinations</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">Bali, Indonesia</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">Paris, France</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">Tokyo, Japan</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">Goa, India</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/trip-planner" className="hover:text-white transition-colors">Trip Planner</Link></li>
              <li><Link href="/hotels" className="hover:text-white transition-colors">Hotel Booking</Link></li>
              <li><Link href="/booking" className="hover:text-white transition-colors">Online Booking</Link></li>
              <li><Link href="/cost-estimator" className="hover:text-white transition-colors">Cost Estimator</Link></li>
              <li><Link href="/follow-up" className="hover:text-white transition-colors">Follow-up Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-12 pt-8 text-center text-sm">
          <p>© 2026 AI Travel Agency. All rights reserved. Made with ❤️ in Bangalore.</p>
        </div>
      </div>
    </footer>
  );
}
