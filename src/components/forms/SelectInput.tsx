import { FieldError } from "react-hook-form";

interface Option {
  value: string | number;
  label: string;
}

interface SelectInputProps {
  label: string;
  value: string | number | "";
  options: Option[];
  onChange: (value: string) => void;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
}

export default function SelectInput({
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  disabled = false,
}: SelectInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border p-3 outline-none transition ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-300 focus:border-cyan-500"
        } ${
          disabled ? "cursor-not-allowed bg-slate-100" : ""
        }`}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}