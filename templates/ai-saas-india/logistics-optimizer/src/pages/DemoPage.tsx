import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  MapPin,
  Zap,
  CloudRain,
  CalendarHeart,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { CITIES, SAMPLE_ADDRESSES, TIME_OPTIONS } from '../data';
import type { DeliveryStop, RouteResult } from '../types';
import { optimizeRoute } from '../utils/openRouter';
import RouteMap from '../components/RouteMap';
import DeliveryCard from '../components/DeliveryCard';
import ResultsPanel from '../components/ResultsPanel';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function DemoPage() {
  const [city, setCity] = useState(CITIES[0].name);
  const [stops, setStops] = useState<DeliveryStop[]>([
    { id: generateId(), address: 'Warehouse — Whitefield Main Road, Bangalore', label: 'Depot' },
  ]);
  const [timeOfDay, setTimeOfDay] = useState('midday');
  const [rainEnabled, setRainEnabled] = useState(false);
  const [festivalEnabled, setFestivalEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const cityData = CITIES.find((c) => c.name === city);

  const handleAddStop = () => {
    if (!newAddress.trim()) return;
    setStops((prev) => [...prev, { id: generateId(), address: newAddress.trim(), label: `Stop ${prev.length}` }]);
    setNewAddress('');
  };

  const handleAddSample = (addr: string) => {
    setStops((prev) => [...prev, { id: generateId(), address: addr, label: `Stop ${prev.length}` }]);
    setShowSamples(false);
  };

  const handleRemoveStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const handleOptimize = async () => {
    if (stops.length < 2) return;
    setLoading(true);
    setResult(null);
    try {
      const routeResult = await optimizeRoute(city, stops, timeOfDay, rainEnabled, festivalEnabled);
      setResult(routeResult);
    } finally {
      setLoading(false);
    }
  };

  const samples = SAMPLE_ADDRESSES[city] || [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">HyperRoute Demo</span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block">
            {import.meta.env.VITE_OPENROUTER_API_KEY ? 'API Connected' : 'Demo Mode'}
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel — Config */}
          <div className="lg:col-span-4 space-y-6">
            {/* City Selector */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Select City
              </h3>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    // Reset stops for the new city
                    const c = CITIES.find((c) => c.name === e.target.value);
                    setStops([
                      { id: generateId(), address: `Warehouse — ${c?.name} Central`, label: 'Depot' },
                    ]);
                    setResult(null);
                  }}
                  className="w-full appearance-none bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}, {c.state}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {cityData && (
                <div className="mt-3 p-3 rounded-lg bg-slate-800/50 text-xs text-slate-400 space-y-1">
                  <p><span className="text-slate-300 font-medium">Peak traffic:</span> {cityData.trafficPeakHours}</p>
                  <p><span className="text-slate-300 font-medium">Festival:</span> {cityData.commonFestival}</p>
                  <p><span className="text-slate-300 font-medium">Rainfall:</span> {cityData.avgRainfall}</p>
                </div>
              )}
            </div>

            {/* Delivery Stops */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Delivery Stops ({stops.length})</h3>

              {/* Existing stops */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                {stops.map((stop, i) => (
                  <div key={stop.id} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 text-sm">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {i === 0 ? 'W' : i}
                    </span>
                    <span className="text-slate-300 truncate flex-1">{stop.address}</span>
                    {i > 0 && (
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new stop */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStop()}
                  placeholder="Enter delivery address..."
                  className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handleAddStop}
                  disabled={!newAddress.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg px-3 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick-add samples */}
              <button
                onClick={() => setShowSamples(!showSamples)}
                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Quick-add sample addresses for {city}
              </button>

              {showSamples && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {samples
                    .filter((s) => !stops.some((existing) => existing.address === s))
                    .map((addr) => (
                      <button
                        key={addr}
                        onClick={() => handleAddSample(addr)}
                        className="w-full text-left text-xs text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors"
                      >
                        + {addr}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Time & Conditions */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Time of Day</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTimeOfDay(t.value)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        timeOfDay === t.value
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-white/10'
                      }`}
                    >
                      <span className="mr-1">{t.icon}</span> {t.label.replace(/\(.*\)/, '').trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Conditions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setRainEnabled(!rainEnabled)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      rainEnabled
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-white/10'
                    }`}
                  >
                    <CloudRain className="w-5 h-5" />
                    <span className="text-left">
                      <span className="block font-medium">Monsoon / Rain</span>
                      <span className="text-xs opacity-70">Factor in waterlogging & reduced speeds</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setFestivalEnabled(!festivalEnabled)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      festivalEnabled
                        ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-white/10'
                    }`}
                  >
                    <CalendarHeart className="w-5 h-5" />
                    <span className="text-left">
                      <span className="block font-medium">Festival Season</span>
                      <span className="text-xs opacity-70">Road closures & procession diversions</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Optimize Button */}
            <button
              onClick={handleOptimize}
              disabled={loading || stops.length < 2}
              className="w-full btn-primary !py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Optimizing Route...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Optimize Route ({stops.length} stops)
                </>
              )}
            </button>

            {stops.length < 2 && (
              <p className="text-xs text-amber-400 text-center">Add at least 2 stops to optimize</p>
            )}
          </div>

          {/* Right Panel — Results */}
          <div className="lg:col-span-8 space-y-6">
            {result ? (
              <>
                {/* Route Map */}
                <RouteMap stops={result.optimizedOrder} city={city} />

                {/* Summary Metrics */}
                <ResultsPanel result={result} />

                {/* Turn-by-turn Directions */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Turn-by-Turn Directions ({result.optimizedOrder.length} stops)
                  </h3>
                  <div className="space-y-3">
                    {result.optimizedOrder.map((stop, i) => (
                      <DeliveryCard
                        key={stop.stopNumber}
                        stop={stop}
                        isLast={i === result.optimizedOrder.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="glass-card p-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Optimize</h3>
                <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                  Add your delivery addresses, select the city and time of day, toggle weather/festival conditions,
                  and hit "Optimize Route" to see AI-powered delivery routing.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <p className="text-cyan-400 text-2xl font-bold">5</p>
                    <p className="text-xs text-slate-400">Cities</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <p className="text-teal-400 text-2xl font-bold">35%</p>
                    <p className="text-xs text-slate-400">Time Saved</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <p className="text-pink-400 text-2xl font-bold">24/7</p>
                    <p className="text-xs text-slate-400">Live Traffic</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
