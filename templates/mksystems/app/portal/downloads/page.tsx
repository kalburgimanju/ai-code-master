"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface DownloadEntry {
  date: string;
  component: string;
  user: string;
  version: string;
  userAgent: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);

  useEffect(() => {
    fetch("/api/downloads")
      .then((r) => r.json())
      .then((data) => setDownloads(data.downloads ?? []))
      .catch(() => setDownloads([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Downloads</h1>
      <p className="text-sm text-neutral-500 mb-8">Complete history of component downloads.</p>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        {downloads.length === 0 ? (
          <div className="text-center py-16">
            <Download className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No downloads recorded yet.</p>
            <p className="text-xs text-neutral-300 mt-1">Data appears when users install components.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Component</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Version</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d, i) => (
                  <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="px-4 py-3 text-neutral-600">
                      {new Date(d.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
                        {d.component}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{d.version}</td>
                    <td className="px-4 py-3 text-neutral-600">{d.user}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs max-w-[200px] truncate">
                      {d.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
