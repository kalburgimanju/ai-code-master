import { Route, TrafficCone, CalendarHeart, LayoutDashboard, CloudRain, Map, Cpu, IndianRupee } from 'lucide-react';

const features = [
  {
    icon: Route,
    title: 'AI Route Optimization',
    description: 'Multi-stop delivery routes optimized using AI. Considers distance, traffic, road quality, and delivery windows.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: TrafficCone,
    title: 'Real-time Traffic',
    description: 'Live traffic data for Indian metros — signal timing, construction zones, peak hours, and lane closures factored in.',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    icon: CloudRain,
    title: 'Rain & Weather Impact',
    description: 'Monsoon-aware routing. Automatically adjusts speeds and routes during heavy rainfall, waterlogging, and storms.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: CalendarHeart,
    title: 'Festival Impact Analysis',
    description: 'Durga Puja processions, Ganesh Chaturthi visarjan, Diwali traffic — festivals don\'t slow down your fleet.',
    gradient: 'from-pink-400 to-purple-500',
  },
  {
    icon: LayoutDashboard,
    title: 'Fleet Dashboard',
    description: 'Monitor all deliveries in real-time. Track driver locations, ETAs, delays, and cost-per-delivery metrics.',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    icon: Map,
    title: 'Micro-market Mapping',
    description: 'Last-mile delivery zones mapped to lane-level accuracy. Know every galli, chowk, and colony in your city.',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    icon: Cpu,
    title: 'Predictive ETAs',
    description: 'Machine learning models trained on Indian road patterns. 95% accuracy on delivery time predictions.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: IndianRupee,
    title: 'Cost Calculator',
    description: 'Fuel cost, toll charges, driver overtime — real cost breakdowns per route with savings recommendations.',
    gradient: 'from-green-400 to-emerald-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Built for Indian Roads
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to optimize deliveries across India's most complex urban environments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-6 hover:bg-white/[0.07] transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
