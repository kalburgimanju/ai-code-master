import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Brain,
  Palette,
  Cloud,
  Clock,
  Signal,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { bootcamps } from '../data';

const iconMap: Record<string, React.ReactNode> = {
  code: <Code2 size={28} />,
  brain: <Brain size={28} />,
  palette: <Palette size={28} />,
  cloud: <Cloud size={28} />,
};

interface BootcampsProps {
  onEnroll: (name: string) => void;
}

const Bootcamps: React.FC<BootcampsProps> = ({ onEnroll }) => {
  return (
    <section id="bootcamps" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3"
          >
            Our Bootcamps
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading"
          >
            Choose your path
          </motion.h2>
          <p className="section-sub">
            Intensive, hands-on programs designed to take you from learner to builder in weeks, not years.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {bootcamps.map((bootcamp, index) => (
            <motion.div
              key={bootcamp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${bootcamp.color} text-white shadow-lg`}>
                  {iconMap[bootcamp.icon]}
                </div>
                {bootcamp.spotsLeft <= 10 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                    <Signal size={12} className="animate-pulse" />
                    {bootcamp.spotsLeft} spots left
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{bootcamp.title}</h3>
              <p className="text-brand-600 font-medium mb-3">{bootcamp.tagline}</p>
              <p className="text-slate-500 leading-relaxed mb-6">{bootcamp.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {bootcamp.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Signal size={14} /> {bootcamp.level}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} /> Cohort starts {bootcamp.startDate}
                </span>
              </div>

              {/* Outcomes */}
              <ul className="space-y-2 mb-6">
                {bootcamp.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{bootcamp.price.toLocaleString('en-IN')}
                  </span>
                  {bootcamp.originalPrice && (
                    <span className="ml-2 text-sm text-slate-400 line-through">
                      ₹{bootcamp.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onEnroll(bootcamp.title)}
                  className="btn-primary !py-2.5 !px-5 text-sm group-hover:scale-105 transition-transform cursor-pointer"
                >
                  Enroll <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bootcamps;
