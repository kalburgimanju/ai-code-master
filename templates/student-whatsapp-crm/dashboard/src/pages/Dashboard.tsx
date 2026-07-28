import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { get } from '../api/client';
import { AnalyticsOverview } from '../types';
import { StatCard, PageHeader } from '../components/StatCard';
import { MessageSquare, Send, UserCheck, IndianRupee } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => get<AnalyticsOverview>('/analytics/overview'),
  });

  const funnel = data
    ? [
        { stage: 'Sent', count: data.messagesSent },
        { stage: 'Delivered', count: data.delivered },
        { stage: 'Opened', count: data.opened },
        { stage: 'Clicked', count: data.clicked },
        { stage: 'Replied', count: data.replied },
        { stage: 'Enrolled', count: data.enrolled },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Campaign performance and enrollment" />
      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Messages Sent" value={data.messagesSent} icon={<Send size={20} />} />
            <StatCard
              label="Delivery Rate"
              value={`${Math.round(data.deliveryRate * 100)}%`}
              sub={`${data.delivered} delivered`}
              icon={<MessageSquare size={20} />}
            />
            <StatCard
              label="Response Rate"
              value={`${Math.round(data.responseRate * 100)}%`}
              sub={`${data.replied} replies`}
              icon={<UserCheck size={20} />}
            />
            <StatCard
              label="Revenue"
              value={`₹${data.revenue.toLocaleString()}`}
              sub={`${data.enrolled} enrolled`}
              icon={<IndianRupee size={20} />}
            />
          </div>

          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <StatCard label="Students" value={data.students} />
            <StatCard label="Avg Lead Score" value={data.avgLeadScore.toFixed(1)} />
            <StatCard label="Paid" value={data.paidCount} />
          </div>
        </>
      )}
    </div>
  );
}
