import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  rows?: number;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

export default function TextArea({
  label,
  rows = 4,
  registration,
  error,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <textarea
        rows={rows}
        {...registration}
        className={`w-full rounded-lg border p-3 outline-none transition ${
          error
            ? "border-red-500"
            : "border-slate-300 focus:border-cyan-500"
        }`}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}