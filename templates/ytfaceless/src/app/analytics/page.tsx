'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Eye, DollarSign, Users, Play, ArrowUp, ArrowDown } from 'lucide-react';
import { channels } from '@/data/content';

const timeRanges = ['7D', '30D', '90D', '1Y'];

const metrics = [
  { label: 'Total Views', value: '2.4M', change: '+18.2%', up: true, icon: <Eye size={20} />, color: 'from-brand-500 to-brand-600' },
  { label: 'Subscribers', value: '42.1K', change: '+12.5%', up: true, icon: <Users size={20} />, color: 'from-fire-500 to-accent-500' },
  { label: 'Revenue', value: '$8,420', change: '+23.1%', up: true, icon: <DollarSign size={20} />, color: 'from-neon-500 to-neon-600' },
  { label: 'Watch Time', value: '186K hrs', change: '+9.7%', up: true, icon: <Play size={20} />, color: 'from-sky-500 to-sky-600' },
];

const recentVideos = [
  { title: '10 AI Tools Nobody Is Talking About', views: '156K', revenue: '$420', days: 3, trend: 'up' },
  { title: 'Why You Procrastinate (Dark Psychology)', views: '289K', revenue: '$780', days: 7, trend: 'up' },
  { title: '5 Side Hustles That Actually Work in 2026', views: '98K', revenue: '$265', days: 12, trend: 'down' },
  { title: 'The Science of Morning Routines', views: '134K', revenue: '$362', days: 18, trend: 'up' },
  { title: 'Scary Internet Mysteries Explained', views: '412K', revenue: '$1,112', days: 25, trend: 'up' },
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('30D');

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-neon-500 to-sky-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <BarChart3 size={16} />
            Channel Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Track your channel performance, revenue, and growth across all your faceless channels.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Time Range */}
        <div className="flex items-center gap-2 mb-8">
          <p className="text-sm font-medium text-dark-500 mr-2">Period:</p>
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRange === r ? 'bg-brand-500 text-white shadow-sm' : 'bg-white text-dark-500 border border-dark-200 hover:border-brand-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center`}>
                  {m.icon}
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold ${m.up ? 'text-neon-500' : 'text-fire-500'}`}>
                  {m.up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-dark-800">{m.value}</p>
              <p className="text-xs text-dark-400 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart placeholder */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
            <h3 className="text-lg font-bold text-dark-800 mb-6">Views Over Time</h3>
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end gap-2 px-4">
                {[65, 45, 78, 52, 88, 62, 95, 70, 82, 58, 92, 75, 85, 68, 90, 72, 88, 60, 95, 78, 82, 65, 90, 70, 85, 62, 78, 55, 88, 72].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 hover:from-brand-600 hover:to-brand-400 transition-colors cursor-pointer group relative" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.round(h * 120)}K views
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-dark-200" />
            </div>
            <div className="flex justify-between mt-4 text-xs text-dark-400 px-4">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>

          {/* Channels */}
          <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
            <h3 className="text-lg font-bold text-dark-800 mb-4">Your Channels</h3>
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id} className="p-3 rounded-xl bg-dark-50 border border-dark-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-dark-800">{ch.name}</p>
                    <p className="text-xs font-bold text-neon-500">{ch.revenue}/mo</p>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-dark-400">
                    <span>{ch.subscribers} subs</span>
                    <span>{ch.videos} videos</span>
                    <span>{ch.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
          <h3 className="text-lg font-bold text-dark-800 mb-4">Recent Videos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Video</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Views</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Revenue</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Days Live</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Trend</th>
                </tr>
              </thead>
              <tbody>
                {recentVideos.map((v, i) => (
                  <tr key={i} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-dark-800">{v.title}</td>
                    <td className="px-4 py-3 text-sm text-dark-600">{v.views}</td>
                    <td className="px-4 py-3 text-sm font-bold text-neon-500">{v.revenue}</td>
                    <td className="px-4 py-3 text-sm text-dark-500">{v.days}d</td>
                    <td className="px-4 py-3">
                      {v.trend === 'up' ? <ArrowUp size={16} className="text-neon-500" /> : <ArrowDown size={16} className="text-fire-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
