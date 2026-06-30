import { services } from '@/lib/data';
import { Brain, PenTool, Film, Share2, Mail, Rocket, CheckCircle } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain size={28} />,
  PenTool: <PenTool size={28} />,
  Film: <Film size={28} />,
  Share2: <Share2 size={28} />,
  Mail: <Mail size={28} />,
  Rocket: <Rocket size={28} />,
};

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-dark-900">Our Services</h1>
        <p className="text-dark-400 mt-3 max-w-xl mx-auto">
          Comprehensive AI-driven services to help you create, market, and scale your business.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            id={service.id}
            className="bg-white rounded-2xl border border-dark-200 p-8 hover:shadow-lg hover:shadow-brand-500/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
              {iconMap[service.icon]}
            </div>
            <h2 className="text-xl font-bold text-dark-900">{service.title}</h2>
            <p className="text-dark-500 text-sm leading-relaxed mt-2">{service.description}</p>
            <ul className="mt-5 space-y-2">
              {service.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-dark-600">
                  <CheckCircle size={16} className="text-neon-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
