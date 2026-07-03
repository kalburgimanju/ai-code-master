import { MapPin, Cpu, Navigation, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    step: '01',
    title: 'Add Delivery Addresses',
    description: 'Enter your warehouse location and all delivery destinations. Bulk import from CSV or add addresses one by one.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Analyzes Conditions',
    description: 'Our AI processes real-time traffic data, weather forecasts, festival calendars, and historical delivery patterns.',
  },
  {
    icon: Navigation,
    step: '03',
    title: 'Get Optimized Route',
    description: 'Receive turn-by-turn directions with time estimates for each stop. Exports to Google Maps, WhatsApp, or your fleet app.',
  },
  {
    icon: CheckCircle,
    step: '04',
    title: 'Track & Adapt',
    description: 'Monitor deliveries in real-time. Routes dynamically adapt to changing conditions — unexpected traffic, rain, or road closures.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Four Steps to Faster Deliveries
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From address input to optimized route in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
              )}
              <div className="glass-card p-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-cyan-400 font-mono text-sm mb-2">Step {step.step}</div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
