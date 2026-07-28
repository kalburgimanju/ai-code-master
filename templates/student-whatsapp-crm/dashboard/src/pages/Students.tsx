import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../api/client';
import { Student } from '../types';
import { PageHeader } from '../components/StatCard';
import { Input, Button } from '../components/ui';

export default function StudentsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [city, setCity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => get<Student[]>('/students'),
  });

  const addStudent = useMutation({
    mutationFn: () =>
      post('/students', { name, phone, course, city }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setName('');
      setPhone('');
      setCourse('');
      setCity('');
    },
  });

  return (
    <div>
      <PageHeader title="Students" subtitle="Your CRM of leads and enrolled students" />

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold mb-3">Add Student</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <Button
          className="mt-3"
          disabled={!name || !phone || addStudent.isPending}
          onClick={() => addStudent.mutate()}
        >
          Add Student
        </Button>
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.phone}</td>
                <td className="p-3">{s.course ?? '—'}</td>
                <td className="p-3">{s.city ?? '—'}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-brand-50 text-brand-700 text-xs">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  No students yet. Import or add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
