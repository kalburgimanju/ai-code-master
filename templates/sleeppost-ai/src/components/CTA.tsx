import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Moon } from 'lucide-react';
import GradientButton from './shared/GradientButton';

const CTA: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative glass rounded-3xl p-12 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/10 to-pink-500/10" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
              <Moon size={32} className="text-white" />
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Sleep Post?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join 5,200+ creators who trust SleepPost AI to grow their online presence around the clock.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <GradientButton size="lg">
                Start Free <ArrowRight size={20} />
              </GradientButton>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              No credit card required · Free forever plan available
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
