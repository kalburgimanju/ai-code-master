'use client';

import { useState } from 'react';
import { Search, Star, Wifi, UtensilsCrossed, Dumbbell, Waves, Check } from 'lucide-react';
import { hotels, destinations } from '@/data/destinations';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function HotelsPage() {
  const [destFilter, setDestFilter] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  const filtered = hotels.filter((h) => {
    if (destFilter && h.destinationId !== destFilter) return false;
    if (h.pricePerNight < priceRange[0] || h.pricePerNight > priceRange[1]) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="bg-gradient-to-br from-brand-600 to-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Find Your Perfect Stay</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Handpicked hotels and resorts at the best prices. From budget stays to luxury retreats.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-dark-600 mb-1">Destination</label>
            <select
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
            >
              <option value="">All destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-dark-600 mb-1">
              Max price: {formatCurrency(priceRange[1])}/night
            </label>
            <input
              type="range"
              min={0}
              max={50000}
              step={1000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full accent-brand-500"
            />
          </div>
        </div>

        <p className="text-sm text-dark-500 mb-6">{filtered.length} hotel{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel) => {
            const dest = destinations.find((d) => d.id === hotel.destinationId);
            return (
              <div key={hotel.id} className="bg-white rounded-2xl border border-dark-200 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-dark-700">
                    {'⭐'.repeat(hotel.stars)}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 text-dark-700">
                    <Star size={12} className="text-sand-400 fill-sand-400" />
                    {hotel.rating}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-brand-600 font-medium mb-1">{dest?.name}, {dest?.country}</p>
                  <h3 className="text-lg font-bold text-dark-800 mb-2">{hotel.name}</h3>
                  <p className="text-sm text-dark-500 mb-3 line-clamp-2">{hotel.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {hotel.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-dark-50 text-dark-500 border border-dark-100">{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                    <div>
                      <p className="text-2xl font-extrabold text-brand-600">{formatCurrency(hotel.pricePerNight)}</p>
                      <p className="text-xs text-dark-400">per night</p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
