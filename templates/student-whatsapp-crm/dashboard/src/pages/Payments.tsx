import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../api/client';
import { Payment, Student } from '../types';
import { PageHeader } from '../components/StatCard';
import { Input, Button } from '../components/ui';

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('25000');

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => get<Student[]>('/students'),
  });
  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => get<Payment[]>('/payments'),
  });

  const create = useMutation({
    mutationFn: () => post('/payments', { studentId, amount: Number(amount) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Collect fees via Razorpay / Stripe (mock by default)" />

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4 max-w-xl">
        <h3 className="text-sm font-semibold mb-3">Create Payment</h3>
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full mb-3"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          <option value="">Select student…</option>
          {(students ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.course}
            </option>
          ))}
        </select>
        <Input
          className="w-full mb-3"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button disabled={!studentId || create.isPending} onClick={() => create.mutate()}>
          Create Payment
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-3">Student</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Provider</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3">{students?.find((s) => s.id === p.studentId)?.name ?? p.studentId.slice(0, 6)}</td>
                <td className="p-3">₹{p.amount.toLocaleString()}</td>
                <td className="p-3">{p.provider}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-xs">{p.status}</span>
                </td>
              </tr>
            ))}
            {(payments ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">No payments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
