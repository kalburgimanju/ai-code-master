'use client';

import { MapPin, Star, Calendar, Compass, Shield, BookOpen } from 'lucide-react';
import { destinations } from '@/data/destinations';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-dark-50">
      <div className="bg-gradient-to-br from-brand-600 to-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <BookOpen size={16} />
            AI Travel Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Travel Guide</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Everything you need to know before you travel. Tips, safety, best seasons, and local insights.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* General Travel Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark-800 mb-6">Essential Travel Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Shield size={24} />, title: 'Safety First', tips: ['Always carry travel insurance', 'Keep digital copies of documents', 'Share itinerary with family', 'Register with embassy for abroad trips'] },
              { icon: <Calendar size={24} />, title: 'Best Time to Book', tips: ['Book flights 6-8 weeks in advance', 'Hotels are cheapest 30 days before', 'Avoid peak season for better prices', 'Mid-week flights are usually cheaper'] },
              { icon: <Compass size={24} />, title: 'Local Etiquette', tips: ['Learn basic local phrases', 'Respect dress codes at temples', 'Tipping customs vary by country', 'Ask before photographing locals'] },
            ].map((section) => (
              <div key={section.title} className="bg-white rounded-2xl border border-dark-200 p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  {section.icon}
                </div>
                <h3 className="text-lg font-bold text-dark-800 mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-dark-600">
                      <span className="text-brand-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Destination Guides */}
        <div>
          <h2 className="text-2xl font-bold text-dark-800 mb-6">Destination Guides</h2>
          <div className="space-y-6">
            {destinations.map((dest) => (
              <div key={dest.id} className="bg-white rounded-2xl border border-dark-200 overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-72 h-48 md:h-auto shrink-0">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-brand-500" />
                      <span className="text-xs text-dark-400">{dest.country}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 capitalize">{dest.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-dark-800 mb-1">{dest.name}</h3>
                    <p className="text-sm text-dark-500 mb-4">{dest.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Highlights</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dest.highlights.map((h) => (
                            <span key={h} className="text-xs px-2.5 py-1 rounded-full bg-dark-50 text-dark-600 border border-dark-100">{h}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-brand-500" />
                          <span className="text-dark-600">Best Season: <strong>{dest.bestSeason}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-sand-400" />
                          <span className="text-dark-600">Rating: <strong>{dest.rating}/5</strong> ({dest.reviewCount.toLocaleString()} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-dark-600">💰 Starting from: <strong className="text-brand-600">₹{dest.avgCost.toLocaleString('en-IN')}/person</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
