"use client";

import { useState, type HTMLAttributes } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "success" | "warning" | "error" | "info";
  /** Alert title */
  title?: string;
  /** Allow dismissing */
  dismissible?: boolean;
  /** Called when dismissed */
  onClose?: () => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    styles: "bg-success-50 text-success-700 border-success-200",
    iconColor: "text-success-500",
  },
  warning: {
    icon: AlertTriangle,
    styles: "bg-warning-50 text-warning-700 border-warning-200",
    iconColor: "text-warning-500",
  },
  error: {
    icon: AlertCircle,
    styles: "bg-error-50 text-error-700 border-error-200",
    iconColor: "text-error-500",
  },
  info: {
    icon: Info,
    styles: "bg-info-50 text-info-700 border-info-200",
    iconColor: "text-info-500",
  },
};

export default function Alert({
  variant = "info",
  title,
  dismissible = false,
  onClose,
  className = "",
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  return (
    <div
      role="alert"
      className={`flex gap-3 p-4 rounded-xl border ${config.styles} ${className}`}
      {...props}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
