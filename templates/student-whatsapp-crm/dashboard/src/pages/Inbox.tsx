import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../api/client';
import { Conversation, ConversationMessage, Student } from '../types';
import { PageHeader } from '../components/StatCard';
import { Input, Button } from '../components/ui';

const SENDER_STYLE: Record<string, string> = {
  student: 'bg-slate-100 text-slate-700 self-start',
  counselor: 'bg-brand-600 text-white self-end',
  ai: 'bg-emerald-100 text-emerald-700 self-start',
};

export default function InboxPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [aiMsg, setAiMsg] = useState('What is the fee?');

  const { data: convs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => get<Conversation[]>('/conversations'),
  });
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => get<Student[]>('/students'),
  });
  const { data: messages } = useQuery({
    queryKey: ['conv-messages', selected],
    queryFn: () => get<ConversationMessage[]>(`/conversations/${selected}/messages`),
    enabled: !!selected,
  });

  const studentName = (id: string) => students?.find((s) => s.id === id)?.name ?? id.slice(0, 6);

  const sendReply = useMutation({
    mutationFn: () =>
      post(`/conversations/${selected}/messages`, { body: reply, sender: 'counselor' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conv-messages', selected] });
      setReply('');
    },
  });

  const aiReply = useMutation({
    mutationFn: () => post(`/conversations/${selected}/ai-reply`, { message: aiMsg }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conv-messages', selected] }),
  });

  return (
    <div>
      <PageHeader title="Team Inbox" subtitle="Collaborate on student conversations" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[520px]">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto">
          {(convs ?? []).map((c) => (
            <button
              key={c.id}
              className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 ${selected === c.id ? 'bg-brand-50' : ''}`}
              onClick={() => setSelected(c.id)}
            >
              <p className="font-medium text-sm">{studentName(c.studentId)}</p>
              <p className="text-xs text-slate-400">{c.status}</p>
            </button>
          ))}
          {(convs ?? []).length === 0 && (
            <p className="p-4 text-sm text-slate-400">
              No conversations. Send a campaign or create one.
            </p>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          {!selected && (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Select a conversation
            </div>
          )}
          {selected && (
            <>
              <div className="flex-1 overflow-auto p-4 space-y-2 flex flex-col">
                {(messages ?? []).map((m) => (
                  <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${SENDER_STYLE[m.sender]}`}>
                    <p>{m.body}</p>
                    <p className="text-[10px] opacity-60 mt-1">{m.sender}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Reply as counselor…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <Button disabled={!reply || sendReply.isPending} onClick={() => sendReply.mutate()}>
                    Send
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    className="flex-1"
                    placeholder="Ask the AI agent…"
                    value={aiMsg}
                    onChange={(e) => setAiMsg(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={!aiMsg || aiReply.isPending}
                    onClick={() => aiReply.mutate()}
                  >
                    AI Reply
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
