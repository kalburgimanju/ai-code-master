'use client';

import Link from 'next/link';
import { Plane, MapPin, Star, Calendar, CreditCard, Headphones, ArrowRight, Globe, Shield, Clock } from 'lucide-react';
import { destinations } from '@/data/destinations';
import DestinationCard from '@/components/DestinationCard';

const features = [
  { icon: <Globe size={24} />, title: 'AI Trip Planning', desc: 'Tell us your dream and we\'ll craft the perfect itinerary in seconds.' },
  { icon: <CreditCard size={24} />, title: 'Instant Booking', desc: 'Book flights, hotels, and experiences in one seamless flow.' },
  { icon: <Shield size={24} />, title: 'Secure Payments', desc: 'Bank-grade encryption on every transaction. Your money is safe.' },
  { icon: <Clock size={24} />, title: '24/7 AI Support', desc: 'Our AI assistant is always available to help with any travel need.' },
  { icon: <MapPin size={24} />, title: 'Best Price Guarantee', desc: 'We scan thousands of options to find you the best deals.' },
  { icon: <Headphones size={24} />, title: 'Live Follow-up', desc: 'Real-time updates on your booking status and travel alerts.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-ocean-50 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-ocean-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                AI-Powered Travel Agency
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-dark-900 leading-tight">
                Travel smarter with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-ocean-600">
                  AI assistance
                </span>
              </h1>
              <p className="mt-6 text-lg text-dark-500 leading-relaxed max-w-lg">
                From planning to booking to follow-up — our AI handles everything. Tell us where you want to go, and we&apos;ll make it happen.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/trip-planner"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-lg shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plane size={20} />
                  Plan My Trip
                </Link>
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-dark-200 text-dark-700 font-semibold text-lg hover:bg-dark-50 active:scale-[0.98] transition-all"
                >
                  Explore Destinations
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8 text-sm text-dark-400">
                <span className="flex items-center gap-2"><Star size={16} className="text-sand-400 fill-sand-400" /> 4.9/5 rating</span>
                <span className="flex items-center gap-2"><MapPin size={16} className="text-brand-500" /> 50+ destinations</span>
                <span className="flex items-center gap-2"><Calendar size={16} className="text-ocean-500" /> 10,000+ trips</span>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {destinations.slice(0, 4).map((dest, i) => (
                  <div
                    key={dest.id}
                    className={`rounded-2xl overflow-hidden shadow-lg ${i === 0 ? 'row-span-2 h-80' : 'h-38'} ${i === 1 ? 'mt-8' : ''}`}
                  >
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-dark-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark-800">100% Safe</p>
                  <p className="text-xs text-dark-400">Verified bookings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Why AI Travel</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 tracking-tight">
              Everything you need in one platform
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-white border border-dark-200 hover:shadow-lg hover:border-brand-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-dark-800 mb-2">{f.title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-2">Popular Destinations</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 tracking-tight">Where will you go?</h2>
            </div>
            <Link href="/destinations" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-brand-500 to-ocean-600 rounded-3xl p-12 text-white shadow-2xl shadow-brand-500/20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to start your journey?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Let our AI plan your perfect trip in seconds. No hassle, no hidden fees.
            </p>
            <Link
              href="/trip-planner"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <Plane size={20} />
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
