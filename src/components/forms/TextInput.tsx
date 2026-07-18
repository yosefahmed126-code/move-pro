import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextInputProps {
  label: string;
  type?: string;
  required?: boolean;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

export default function TextInput({
  label,
  type = "text",
  required = false,
  registration,
  error,
}: TextInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
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