import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className="inline-flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className="peer sr-only"
              aria-invalid={!!error}
              {...props}
            />
            <div className="w-5 h-5 rounded-md border-2 border-neutral-300 bg-white transition-all peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/20 peer-disabled:opacity-50 group-hover:border-neutral-400" />
            <Check className="absolute inset-0 w-5 h-5 text-white p-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          {label && <span className="text-sm text-neutral-700">{label}</span>}
        </label>
        {error && (
          <p className="text-xs text-error-600 ml-7">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
