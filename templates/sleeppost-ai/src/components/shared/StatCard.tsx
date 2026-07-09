import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  color = 'from-brand-500 to-purple-500',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 glow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
