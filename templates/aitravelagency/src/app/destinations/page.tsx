'use client';

import { useState } from 'react';
import { Search, Filter, Star, MapPin } from 'lucide-react';
import { destinations } from '@/data/destinations';
import DestinationCard from '@/components/DestinationCard';

const categories = ['all', 'beach', 'mountain', 'city', 'cultural', 'adventure', 'island'];

export default function DestinationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = destinations.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || d.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Explore Destinations</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Discover breathtaking places around the world. From tropical beaches to majestic mountains.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by destination or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-dark-800 placeholder-dark-400 outline-none shadow-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-dark-600 border border-dark-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <p className="text-sm text-dark-500 mb-6">{filtered.length} destination{filtered.length !== 1 ? 's' : ''} found</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-dark-400 text-lg">No destinations match your search. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
