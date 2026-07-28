import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, api } from '../api/client';
import { Campaign, Message } from '../types';
import { PageHeader } from '../components/StatCard';
import { Input, Textarea, Button } from '../components/ui';

export default function CampaignsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('Hi {name}, our {course} starts soon!');
  const [selected, setSelected] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => get<Campaign[]>('/campaigns'),
  });

  const create = useMutation({
    mutationFn: () => post('/campaigns', { name, message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      setName('');
    },
  });

  const send = useMutation({
    mutationFn: (id: string) => post(`/campaigns/${id}/send`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const { data: messages } = useQuery({
    queryKey: ['campaign-messages', selected],
    queryFn: () => get<Message[]>(`/campaigns/${selected}/messages`),
    enabled: !!selected,
  });

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Broadcast personalized WhatsApp messages" />

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4 max-w-2xl">
        <h3 className="text-sm font-semibold mb-3">New Campaign</h3>
        <Input
          className="mb-3 w-full"
          placeholder="Campaign name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          rows={3}
          placeholder="Message (use {name}, {course}, {city})"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="mt-3" disabled={!name || create.isPending} onClick={() => create.mutate()}>
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((c) => (
                <tr
                  key={c.id}
                  className={`border-t border-slate-100 cursor-pointer ${selected === c.id ? 'bg-brand-50' : ''}`}
                  onClick={() => setSelected(c.id)}
                >
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3 text-right">
                    <button
                      className="text-brand-600 text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        send.mutate(c.id);
                      }}
                    >
                      Send →
                    </button>
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-3">
            Messages {selected ? `(campaign ${selected.slice(0, 6)})` : ''}
          </h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {(messages ?? []).map((m) => (
              <div key={m.id} className="text-sm border border-slate-100 rounded-lg p-2">
                <p className="text-slate-600">{m.body}</p>
                <div className="flex gap-2 mt-1 text-xs text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full ${m.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-slate-100'}`}>
                    {m.status}
                  </span>
                  <span>{m.provider}</span>
                </div>
              </div>
            ))}
            {!selected && <p className="text-sm text-slate-400">Select a campaign to view messages.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
