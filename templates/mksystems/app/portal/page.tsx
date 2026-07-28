"use client";

import { useEffect, useState } from "react";
import { Download, Users, Layers, TrendingUp } from "lucide-react";

interface Stats {
  totalDownloads: number;
  totalUsers: number;
  components: Record<string, number>;
  recentDownloads: { date: string; component: string; user: string }[];
}

export default function PortalPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() =>
        setStats({
          totalDownloads: 0,
          totalUsers: 0,
          components: {},
          recentDownloads: [],
        })
      );
  }, []);

  const cards = [
    { label: "Total Downloads", value: stats?.totalDownloads ?? 0, icon: Download, color: "bg-brand-500" },
    { label: "Active Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-success-500" },
    { label: "Components", value: Object.keys(stats?.components ?? {}).length || 6, icon: Layers, color: "bg-purple-500" },
    { label: "Avg Downloads/Day", value: Math.round((stats?.totalDownloads ?? 0) / 7), icon: TrendingUp, color: "bg-warning-500" },
  ];

  const componentData = stats?.components ?? {
    Button: 245,
    Input: 189,
    Card: 156,
    Badge: 134,
    Alert: 98,
    Modal: 87,
  };

  const maxCount = Math.max(...Object.values(componentData), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dashboard</h1>
      <p className="text-sm text-neutral-500 mb-8">Overview of MKSystems usage and adoption.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500">{label}</span>
              <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Component Usage Chart */}
      <div className="bg-white rounded-xl border border-neutral-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Component Usage</h2>
        <div className="space-y-3">
          {Object.entries(componentData)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-20 text-sm text-neutral-600 font-medium">{name}</span>
                <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm text-neutral-500 font-mono">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Downloads</h2>
        {stats?.recentDownloads && stats.recentDownloads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-2 font-medium text-neutral-500">Date</th>
                  <th className="text-left py-2 font-medium text-neutral-500">Component</th>
                  <th className="text-left py-2 font-medium text-neutral-500">User</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDownloads.slice(0, 5).map((d, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    <td className="py-2.5 text-neutral-600">
                      {new Date(d.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
                        {d.component}
                      </span>
                    </td>
                    <td className="py-2.5 text-neutral-500">{d.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-neutral-400 text-center py-8">No downloads recorded yet. Data will appear here once users start installing components.</p>
        )}
      </div>
    </div>
  );
}
