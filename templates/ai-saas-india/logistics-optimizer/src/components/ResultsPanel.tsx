import { Fuel, TrendingUp, CloudRain, CalendarHeart, Timer, IndianRupee } from 'lucide-react';
import type { RouteResult } from '../types';

interface Props {
  result: RouteResult;
}

export default function ResultsPanel({ result }: Props) {
  const metrics = [
    { icon: TrendingUp, label: 'Total Distance', value: result.totalDistance, color: 'text-cyan-400' },
    { icon: Timer, label: 'Est. Time', value: result.totalTime, color: 'text-teal-400' },
    { icon: Fuel, label: 'Fuel Cost', value: result.fuelCost, color: 'text-amber-400' },
    { icon: IndianRupee, label: 'Savings', value: result.savingsCompared, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-xs text-slate-400">{m.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Traffic Score */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Traffic Score</span>
          <span className="text-sm font-bold text-white">{result.trafficScore}/10</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${result.trafficScore * 10}%`,
              background: result.trafficScore >= 7 ? '#ef4444' : result.trafficScore >= 4 ? '#f59e0b' : '#22d3ee',
            }}
          />
        </div>
      </div>

      {/* Weather & Festival */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-3 mb-3">
          <CloudRain className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-300 mb-1">Weather Impact</p>
            <p className="text-xs text-slate-400 leading-relaxed">{result.weatherImpact}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarHeart className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-300 mb-1">Festival Status</p>
            <p className="text-xs text-slate-400 leading-relaxed">{result.festivalNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
