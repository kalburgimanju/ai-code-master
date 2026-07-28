import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full"
    />
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }) {
  const base =
    variant === 'outline'
      ? 'border border-brand-600 text-brand-700 bg-white hover:bg-brand-50'
      : 'bg-brand-600 text-white hover:bg-brand-700';
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${base} ${className}`}
    >
      {children}
    </button>
  );
}
