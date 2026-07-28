"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export interface ToastProps {
  /** Whether toast is visible */
  open: boolean;
  /** Called when toast should close */
  onClose: () => void;
  /** Toast variant */
  variant?: "success" | "error" | "warning" | "info";
  /** Toast message */
  message: string;
  /** Auto-close duration in ms (0 = no auto-close) */
  duration?: number;
}

const variantConfig = {
  success: { icon: CheckCircle, bg: "bg-success-600", text: "text-white" },
  error: { icon: AlertCircle, bg: "bg-error-600", text: "text-white" },
  warning: { icon: AlertTriangle, bg: "bg-warning-600", text: "text-white" },
  info: { icon: Info, bg: "bg-brand-600", text: "text-white" },
};

export default function Toast({
  open,
  onClose,
  variant = "info",
  message,
  duration = 4000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        role="alert"
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${config.bg} ${config.text} transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 p-0.5 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
