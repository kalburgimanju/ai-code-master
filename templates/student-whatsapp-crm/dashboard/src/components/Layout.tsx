import { NavLink, Outlet } from 'react-router-dom';
import {
  Users,
  Upload,
  Megaphone,
  Workflow,
  Inbox,
  BarChart3,
  CreditCard,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/import', label: 'Import', icon: Upload },
  { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/workflows', label: 'Workflows', icon: Workflow },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/payments', label: 'Payments', icon: CreditCard },
];

export default function Layout() {
  return (
    <div className="flex h-full">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200">
          <h1 className="font-bold text-brand-700">WhatsApp CRM</h1>
          <p className="text-xs text-slate-400">Student Automation</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
