import type { RouteStop } from '../types';

interface Props {
  stops: RouteStop[];
  city: string;
}

// Generates deterministic but city-specific coordinates for a mock SVG map
function getStopCoordinates(stops: RouteStop[], city: string): { x: number; y: number }[] {
  const citySeeds: Record<string, number> = {
    Bangalore: 42,
    Mumbai: 17,
    Delhi: 73,
    Chennai: 31,
    Hyderabad: 59,
  };
  const seed = citySeeds[city] || 50;
  const padding = 60;
  const width = 500;
  const height = 340;

  return stops.map((_, i) => {
    const angle = (i / stops.length) * Math.PI * 2 + seed * 0.01;
    const radiusFactor = 0.3 + (((seed * (i + 1) * 7) % 100) / 100) * 0.3;
    const cx = width / 2;
    const cy = height / 2;
    return {
      x: Math.round(padding + ((cx - padding * 2) * (0.3 + radiusFactor * 0.7)) + Math.cos(angle) * 100 * radiusFactor),
      y: Math.round(padding + ((cy - padding * 2) * (0.3 + radiusFactor * 0.7)) + Math.sin(angle) * 70 * radiusFactor),
    };
  });
}

const trafficColors: Record<string, string> = {
  low: '#22d3ee',
  medium: '#f59e0b',
  high: '#ef4444',
};

export default function RouteMap({ stops, city }: Props) {
  const coords = getStopCoordinates(stops, city);

  return (
    <div className="glass-card p-4 overflow-hidden">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Route Map — {city}
      </h3>

      <svg
        viewBox="0 0 500 340"
        className="w-full h-auto rounded-lg"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e20 50%, #0f172a 100%)' }}
      >
        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * 34}
            x2={500}
            y2={i * 34}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 34}
            y1={0}
            x2={i * 34}
            y2={340}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Route lines */}
        {coords.map((coord, i) => {
          if (i === 0) return null;
          const prev = coords[i - 1];
          const traffic = stops[i]?.trafficLevel || 'low';
          const midX = (prev.x + coord.x) / 2 + (i % 2 === 0 ? 15 : -15);
          const midY = (prev.y + coord.y) / 2 + (i % 2 === 0 ? -10 : 10);

          return (
            <g key={`line-${i}`}>
              {/* Glow */}
              <path
                d={`M ${prev.x} ${prev.y} Q ${midX} ${midY} ${coord.x} ${coord.y}`}
                fill="none"
                stroke={trafficColors[traffic]}
                strokeWidth={4}
                opacity={0.15}
                strokeLinecap="round"
              />
              {/* Line */}
              <path
                d={`M ${prev.x} ${prev.y} Q ${midX} ${midY} ${coord.x} ${coord.y}`}
                fill="none"
                stroke={trafficColors[traffic]}
                strokeWidth={2}
                strokeDasharray={traffic === 'high' ? '6 3' : traffic === 'medium' ? '2 2' : 'none'}
                strokeLinecap="round"
                opacity={0.7}
              />
              {/* Arrow at midpoint */}
              <circle cx={midX} cy={midY} r={2} fill={trafficColors[traffic]} opacity={0.5} />
            </g>
          );
        })}

        {/* Stop markers */}
        {coords.map((coord, i) => {
          const isWarehouse = i === 0;
          return (
            <g key={`stop-${i}`}>
              {/* Pulse ring for warehouse */}
              {isWarehouse && (
                <circle cx={coord.x} cy={coord.y} r={16} fill="none" stroke="#22d3ee" strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" from="12" to="22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Marker bg */}
              <circle
                cx={coord.x}
                cy={coord.y}
                r={isWarehouse ? 12 : 8}
                fill={isWarehouse ? '#0891b2' : '#1e293b'}
                stroke={isWarehouse ? '#22d3ee' : trafficColors[stops[i]?.trafficLevel || 'low']}
                strokeWidth={2}
              />

              {/* Number */}
              <text
                x={coord.x}
                y={coord.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={isWarehouse ? 10 : 8}
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
              >
                {isWarehouse ? 'W' : i}
              </text>

              {/* Label */}
              <text
                x={coord.x}
                y={coord.y + (isWarehouse ? 22 : 18)}
                textAnchor="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize={7}
                fontFamily="Inter, sans-serif"
              >
                {isWarehouse ? 'Depot' : `Stop ${i}`}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(10, 310)">
          <circle cx={6} cy={6} r={4} fill="#22d3ee" />
          <text x={14} y={9} fill="rgba(255,255,255,0.5)" fontSize={8} fontFamily="Inter, sans-serif">Low Traffic</text>
          <circle cx={106} cy={6} r={4} fill="#f59e0b" />
          <text x={114} y={9} fill="rgba(255,255,255,0.5)" fontSize={8} fontFamily="Inter, sans-serif">Medium</text>
          <circle cx={186} cy={6} r={4} fill="#ef4444" />
          <text x={194} y={9} fill="rgba(255,255,255,0.5)" fontSize={8} fontFamily="Inter, sans-serif">High Traffic</text>
        </g>
      </svg>
    </div>
  );
}
