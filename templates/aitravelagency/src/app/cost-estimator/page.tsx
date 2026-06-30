'use client';

import { useState } from 'react';
import { DollarSign, Users, Calendar, MapPin, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { destinations, costEstimates, tripPlans, hotels } from '@/data/destinations';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function CostEstimatorPage() {
  const [selectedDest, setSelectedDest] = useState('');
  const [guests, setGuests] = useState(2);
  const [days, setDays] = useState(5);
  const [category, setCategory] = useState<'budget' | 'standard' | 'premium' | 'luxury'>('standard');

  const est = selectedDest ? costEstimates.find((e) => {
    const d = destinations.find((x) => x.id === selectedDest);
    return d && e.destination === d.name;
  }) : null;

  const selectedDestData = destinations.find((d) => d.id === selectedDest);
  const destHotels = selectedDest ? hotels.filter((h) => h.destinationId === selectedDest) : [];
  const destPlans = selectedDest ? tripPlans.filter((tp) => tp.destinationId === selectedDest) : [];

  const perPersonCost = est ? est[category] : 0;
  const totalCost = perPersonCost * guests;
  const dailyAvg = days > 0 ? Math.round(totalCost / days) : 0;

  const categories = [
    { key: 'budget' as const, label: 'Budget', icon: '🎒', description: 'Hostels, local food, public transport' },
    { key: 'standard' as const, label: 'Standard', icon: '🏨', description: '3-star hotels, mix of dining, guided tours' },
    { key: 'premium' as const, label: 'Premium', icon: '✨', description: '4-star resorts, fine dining, private transfers' },
    { key: 'luxury' as const, label: 'Luxury', icon: '👑', description: '5-star villas, private chefs, exclusive experiences' },
  ];

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="bg-gradient-to-br from-brand-600 to-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <DollarSign size={16} />
            Smart Cost Estimation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Trip Cost Estimator</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Get an instant estimate for your dream trip. Adjust guests, duration, and comfort level.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 space-y-5">
              <h2 className="text-lg font-bold text-dark-800">Configure Your Trip</h2>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                  <MapPin size={14} className="text-brand-500" /> Destination
                </label>
                <select value={selectedDest} onChange={(e) => setSelectedDest(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm">
                  <option value="">Select destination</option>
                  {destinations.map((d) => (<option key={d.id} value={d.id}>{d.name}, {d.country}</option>))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                  <Users size={14} className="text-brand-500" /> Guests: {guests}
                </label>
                <input type="range" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full accent-brand-500" />
                <div className="flex justify-between text-xs text-dark-400 mt-1"><span>1</span><span>20</span></div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-600 mb-2">
                  <Calendar size={14} className="text-brand-500" /> Days: {days}
                </label>
                <input type="range" min={2} max={21} value={days} onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-brand-500" />
                <div className="flex justify-between text-xs text-dark-400 mt-1"><span>2</span><span>21</span></div>
              </div>
            </div>

            {/* Category selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
              <h3 className="text-sm font-bold text-dark-600 mb-3 uppercase tracking-wide">Travel Style</h3>
              <div className="space-y-2">
                {categories.map((c) => (
                  <button key={c.key} onClick={() => setCategory(c.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      category === c.key ? 'border-brand-400 bg-brand-50 shadow-sm' : 'border-dark-100 hover:border-dark-200'
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-sm font-semibold text-dark-800">{c.label}</span>
                    </div>
                    <p className="text-xs text-dark-400 mt-1 ml-7">{c.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-6">
            {est ? (
              <>
                {/* Total estimate card */}
                <div className="bg-gradient-to-br from-brand-500 to-ocean-600 rounded-2xl p-8 text-white shadow-xl">
                  <p className="text-white/70 text-sm mb-1">Estimated Total Cost</p>
                  <p className="text-4xl md:text-5xl font-extrabold mb-2">{formatCurrency(totalCost)}</p>
                  <p className="text-white/70 text-sm">{guests} guest{guests > 1 ? 's' : ''} · {days} days · {categories.find((c) => c.key === category)?.label}</p>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-white/60 text-xs">Per Person</p>
                      <p className="text-lg font-bold">{formatCurrency(perPersonCost)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Daily Average</p>
                      <p className="text-lg font-bold">{formatCurrency(dailyAvg)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Best Season</p>
                      <p className="text-lg font-bold">{selectedDestData?.bestSeason?.split(',')[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Category comparison */}
                <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
                  <h3 className="text-lg font-bold text-dark-800 mb-4">Price Comparison</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {(['budget', 'standard', 'premium', 'luxury'] as const).map((cat) => {
                      const price = est[cat];
                      const isMax = cat === 'luxury';
                      const isMin = cat === 'budget';
                      return (
                        <div key={cat} className={`p-4 rounded-xl text-center border transition-all ${
                          category === cat ? 'border-brand-400 bg-brand-50 shadow-sm' : 'border-dark-100'
                        }`}>
                          <span className="text-2xl">{categories.find((c) => c.key === cat)?.icon}</span>
                          <p className="text-xs font-medium text-dark-500 mt-2 capitalize">{cat}</p>
                          <p className="text-lg font-bold text-dark-800 mt-1">{formatCurrency(price)}</p>
                          <p className="text-[10px] text-dark-400">per person</p>
                          {isMin && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Cheapest</span>}
                          {isMax && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-sand-100 text-sand-500">Most Premium</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Available trip plans */}
                {destPlans.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
                    <h3 className="text-lg font-bold text-dark-800 mb-4">Available Trip Plans</h3>
                    <div className="space-y-3">
                      {destPlans.map((tp) => (
                        <div key={tp.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-50 border border-dark-100">
                          <div>
                            <p className="font-semibold text-dark-800 text-sm">{tp.name}</p>
                            <p className="text-xs text-dark-400">{tp.days}D/{tp.days - 1}N · {tp.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-brand-600">{formatCurrency(tp.price)}</p>
                            <p className="text-[10px] text-dark-400">per person</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available hotels */}
                {destHotels.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
                    <h3 className="text-lg font-bold text-dark-800 mb-4">Hotel Options</h3>
                    <div className="space-y-3">
                      {destHotels.map((h) => (
                        <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 border border-dark-100">
                          <img src={h.image} alt={h.name} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <p className="font-semibold text-dark-800 text-sm">{h.name}</p>
                            <p className="text-xs text-dark-400">{'⭐'.repeat(h.stars)} · {h.rating}/5</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-brand-600">{formatCurrency(h.pricePerNight)}</p>
                            <p className="text-[10px] text-dark-400">per night</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
                  <h3 className="text-lg font-bold text-dark-800 mb-4">What&apos;s Included in the Estimate</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { label: 'Flights (round trip)', icon: '✈️' },
                      { label: 'Hotel accommodation', icon: '🏨' },
                      { label: 'Daily meals', icon: '🍽️' },
                      { label: 'Local transportation', icon: '🚗' },
                      { label: 'Activity entrance fees', icon: '🎫' },
                      { label: 'Travel insurance', icon: '🛡️' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 border border-dark-100">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-dark-700">{item.label}</span>
                        <span className="ml-auto text-green-600 text-xs font-medium">✓ Included</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-16 text-center">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="text-xl font-bold text-dark-800 mb-2">Select a Destination</h3>
                <p className="text-dark-500">Choose a destination from the left panel to see cost estimates.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
