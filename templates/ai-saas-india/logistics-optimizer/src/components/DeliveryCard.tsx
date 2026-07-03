import { MapPin, Clock, Navigation, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { RouteStop } from '../types';

interface Props {
  stop: RouteStop;
  isLast: boolean;
}

const trafficConfig = {
  low: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Clear' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Moderate' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Heavy' },
};

export default function DeliveryCard({ stop, isLast }: Props) {
  const tc = trafficConfig[stop.trafficLevel];

  return (
    <div className={`glass-card p-5 ${isLast ? '' : 'mb-3'}`}>
      <div className="flex items-start gap-4">
        {/* Stop number */}
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
            stop.trafficLevel === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : stop.trafficLevel === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          }`}>
            {stop.stopNumber}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <h4 className="text-sm font-semibold text-white truncate">{stop.address}</h4>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">{stop.instructions}</p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              {stop.distance}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {stop.estimatedTime}
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.color} border ${tc.border}`}>
              {stop.trafficLevel === 'high' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {tc.label}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-2" />
      </div>
    </div>
  );
}
