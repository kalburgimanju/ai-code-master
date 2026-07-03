'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, Search, MapPin, Filter, SlidersHorizontal, Home, Star, ArrowRight } from 'lucide-react';
import { projects } from '@/lib/data';
import { City } from '@/lib/types';

const CITIES: City[] = ['Hubli', 'Bangalore', 'Mysore'];

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState<City | 'All'>((searchParams.get('city') as City) || 'All');
  const [type, setType] = useState('All');
  const [budget, setBudget] = useState('All');

  const filtered = projects.filter(p => {
    if (city !== 'All' && p.city !== city) return false;
    if (type !== 'All' && p.type !== type) return false;
    if (budget === 'Low') { if (p.priceMin > 50) return false; }
    else if (budget === 'Mid') { if (p.priceMin < 50 || p.priceMax > 150) return false; }
    else if (budget === 'High') { if (p.priceMax < 150) return false; }
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Real Estate Projects</h1><p className="text-dark-400 text-sm mt-1">Explore properties in Hubli, Bangalore & Mysore</p></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10 w-64" />
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-dark-400 shrink-0" />
        {[{ label: 'All Cities', value: 'All' }, ...CITIES.map(c => ({ label: c, value: c }))].map(f => (
          <button key={f.value} onClick={() => setCity(f.value as City | 'All')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${city === f.value ? 'bg-finance-600/20 text-finance-400 border border-finance-500/30' : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-transparent'}`}>{f.label}</button>
        ))}
        <div className="w-px h-5 bg-dark-700 mx-1" />
        {['All', 'Apartment', 'Villa', 'Plot'].map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t ? 'bg-dark-800 text-dark-200 border border-dark-600' : 'text-dark-500 hover:text-dark-300'}`}>{t}</button>
        ))}
        <div className="w-px h-5 bg-dark-700 mx-1" />
        {[{ label: 'All Budgets', value: 'All' }, { label: 'Under ₹50L', value: 'Low' }, { label: '₹50L-₹1.5Cr', value: 'Mid' }, { label: 'Above ₹1.5Cr', value: 'High' }].map(b => (
          <button key={b.value} onClick={() => setBudget(b.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${budget === b.value ? 'bg-dark-800 text-dark-200 border border-dark-600' : 'text-dark-500 hover:text-dark-300'}`}>{b.label}</button>
        ))}
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Link key={p.id} href={`/properties/${p.id}`} className="card-hover group overflow-hidden animate-fade-in">
            <div className="h-40 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-finance-600/20 to-prop-600/20 flex items-end relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent" />
              <div className="relative z-10 p-4 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge-blue text-[10px]">{p.city}</span>
                  <span className={`badge text-[10px] ${p.status === 'Ready to Move' ? 'badge-green' : p.status === 'Under Construction' ? 'badge-yellow' : 'badge-gray'}`}>{p.status}</span>
                  {p.tags.slice(0, 1).map(t => <span key={t} className="badge-gray text-[10px]">{t}</span>)}
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white truncate group-hover:text-finance-400 transition-colors">{p.name}</h3>
                <p className="text-xs text-dark-400">{p.builder}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /><span className="text-xs text-dark-300">{p.rating}</span></div>
            </div>
            <div className="flex items-center gap-1 text-xs text-dark-500 mt-1.5"><MapPin className="w-3 h-3" />{p.location}</div>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-prop-400 font-semibold">{p.priceRange}</span>
              <span className="text-dark-500 text-xs">•</span>
              <span className="text-dark-400 text-xs">{p.areaRange}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button className="btn-primary flex-1 text-xs py-2">View Details</button>
              <button className="btn-secondary text-xs py-2 px-3"><ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="card text-center py-12"><Building2 className="w-10 h-10 text-dark-600 mx-auto mb-3" /><p className="text-dark-400">No projects match your filters</p><p className="text-dark-500 text-xs mt-1">Try adjusting your search criteria</p></div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return <Suspense fallback={<div className="text-dark-400 p-6">Loading...</div>}><PropertiesContent /></Suspense>;
}
