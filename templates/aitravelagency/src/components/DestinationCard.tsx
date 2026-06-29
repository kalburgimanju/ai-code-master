'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import type { Destination } from '@/data/destinations';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function DestinationCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={`/destinations?id=${dest.id}`}
      className="group bg-white rounded-2xl border border-dark-200 overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-dark-700 flex items-center gap-1">
          <Star size={12} className="text-sand-400 fill-sand-400" />
          {dest.rating}
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-brand-700">
          {dest.category}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 text-dark-400 text-xs mb-1">
          <MapPin size={12} />
          {dest.country}
        </div>
        <h3 className="text-lg font-bold text-dark-800 mb-1">{dest.name}</h3>
        <p className="text-sm text-dark-500 mb-3 line-clamp-2">{dest.tagline}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-400">From</p>
            <p className="text-lg font-bold text-brand-600">{formatCurrency(dest.avgCost)}</p>
          </div>
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            Explore →
          </button>
        </div>
      </div>
    </Link>
  );
}
