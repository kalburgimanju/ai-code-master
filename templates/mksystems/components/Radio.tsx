import { forwardRef, type InputHTMLAttributes } from "react";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label text */
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={radioId}
        className="inline-flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="relative">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 rounded-full border-2 border-neutral-300 bg-white transition-all peer-checked:border-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/20 peer-disabled:opacity-50 group-hover:border-neutral-400" />
          <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-brand-600 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        {label && <span className="text-sm text-neutral-700">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";

export default Radio;

export interface RadioGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  direction?: "horizontal" | "vertical";
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  direction = "vertical",
}: RadioGroupProps) {
  return (
    <div
      className={`flex ${direction === "horizontal" ? "flex-row gap-4" : "flex-col gap-2.5"}`}
      role="radiogroup"
    >
      {options.map((opt) => (
        <Radio
          key={opt.value}
          name={name}
          value={opt.value}
          label={opt.label}
          checked={value === opt.value}
          onChange={() => onChange?.(opt.value)}
        />
      ))}
    </div>
  );
}
