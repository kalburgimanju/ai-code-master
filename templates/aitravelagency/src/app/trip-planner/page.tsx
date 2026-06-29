'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Users, DollarSign, Sparkles, ChevronRight } from 'lucide-react';
import { destinations, tripPlans } from '@/data/destinations';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function TripPlannerPage() {
  const [selectedDest, setSelectedDest] = useState('');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState('standard');
  const [guests, setGuests] = useState(2);

  const matchingPlans = tripPlans.filter((tp) => {
    if (selectedDest && tp.destinationId !== selectedDest) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Sparkles size={16} />
            AI-Powered Planning
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Plan Your Dream Trip</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Tell us where you want to go and we&apos;ll craft the perfect itinerary with hotels, activities, and cost estimates.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Planning Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-dark-100 p-8 mb-12">
          <h2 className="text-xl font-bold text-dark-800 mb-6">What are you looking for?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                <MapPin size={16} className="text-brand-500" />
                Destination
              </label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              >
                <option value="">Any destination</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                <Calendar size={16} className="text-brand-500" />
                Days
              </label>
              <input
                type="number"
                min={2}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                <Users size={16} className="text-brand-500" />
                Guests
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                <DollarSign size={16} className="text-brand-500" />
                Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              >
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trip Plans */}
        <h2 className="text-2xl font-bold text-dark-800 mb-6">
          {matchingPlans.length} Trip Plan{matchingPlans.length !== 1 ? 's' : ''} Found
        </h2>

        <div className="space-y-6">
          {matchingPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl border border-dark-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 font-medium capitalize">{plan.category}</span>
                      <span className="text-xs text-dark-400">{plan.days} Days / {plan.days - 1} Nights</span>
                    </div>
                    <h3 className="text-xl font-bold text-dark-800">{plan.name}</h3>
                    <p className="text-sm text-dark-500 mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-400">From</p>
                    <p className="text-2xl font-extrabold text-brand-600">{formatCurrency(plan.price)}</p>
                    <p className="text-xs text-dark-400">per person</p>
                  </div>
                </div>

                {/* Itinerary preview */}
                <div className="bg-dark-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-dark-500 mb-3 uppercase tracking-wide">Itinerary</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {plan.itinerary.map((day) => (
                      <div key={day.day} className="min-w-[160px] bg-white rounded-xl p-3 border border-dark-100">
                        <p className="text-xs font-bold text-brand-600">Day {day.day}</p>
                        <p className="text-sm font-semibold text-dark-800 mt-1">{day.title}</p>
                        <p className="text-xs text-dark-400 mt-1">{day.activities.slice(0, 2).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Included */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {plan.included.map((item) => (
                    <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                      ✓ {item}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/booking?trip=${plan.id}&guests=${guests}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                  Book This Trip
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
