"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface UserEntry {
  email: string;
  name: string;
  lastActive: string;
  downloads: number;
  components: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Users</h1>
      <p className="text-sm text-neutral-500 mb-8">Active users who have downloaded components.</p>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No users recorded yet.</p>
            <p className="text-xs text-neutral-300 mt-1">User data appears when downloads are tracked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Downloads</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Components</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-brand-700">
                            {u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-neutral-700 font-medium">{u.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                    <td className="px-4 py-3 text-neutral-600 font-mono">{u.downloads}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.components.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {new Date(u.lastActive).toLocaleDateString()}
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
