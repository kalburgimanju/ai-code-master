import { Link } from 'react-router-dom';
import { ArrowRight, Zap, MapPin, CloudRain } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-teal-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          AI-Powered Route Optimization for India
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
          <span className="text-white">Deliver Faster.</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Smarter. Cheaper.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          HyperRoute uses AI to optimize delivery routes in real-time — factoring in
          Bangalore traffic, Mumbai monsoons, and Delhi festival chaos. Cut delivery
          costs by 40% and times by 35%.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/demo" className="btn-primary text-lg !px-8 !py-4">
            Launch Demo <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="btn-secondary text-lg !px-8 !py-4">
            See Features
          </a>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span className="text-3xl font-bold text-white">8+</span>
            </div>
            <p className="text-sm text-slate-400">Indian Cities Covered</p>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-3xl font-bold text-white">2.5M+</span>
            </div>
            <p className="text-sm text-slate-400">Routes Optimized</p>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              <span className="text-3xl font-bold text-white">35%</span>
            </div>
            <p className="text-sm text-slate-400">Faster Deliveries</p>
          </div>
        </div>
      </div>
    </section>
  );
}
