import { useRef, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/StatCard';
import { Button } from '../components/ui';

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(kind: 'csv' | 'xlsx') {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setError(null);
    setUploading(true);
    setResult(null);
    const form = new FormData();
    form.append('file', file);
    const url = kind === 'csv' ? '/students/import' : '/students/import/xlsx';
    try {
      const { data } = await api.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Import" subtitle="Upload CSV or Excel to bulk-add students" />
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm max-w-xl">
        <input ref={fileRef} type="file" accept=".csv,.xlsx" className="block mb-3" />
        <div className="flex gap-3">
          <Button disabled={uploading} onClick={() => upload('csv')}>
            Import CSV
          </Button>
          <Button disabled={uploading} onClick={() => upload('xlsx')}>
            Import XLSX
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        {result && (
          <div className="mt-3 text-sm">
            <p className="text-green-600 font-medium">Imported {result.imported} students</p>
            <p className="text-slate-400">Skipped {result.skipped} (duplicates/empty)</p>
            {result.errors?.length > 0 && (
              <ul className="list-disc pl-5 text-red-400 mt-1">
                {result.errors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4">
          Expected columns: Name, Phone, Email, City, Course, Lead Source
        </p>
      </div>
    </div>
  );
}
