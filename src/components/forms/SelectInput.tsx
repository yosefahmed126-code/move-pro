interface Option {
  value: string | number;
  label: string;
}

interface SelectInputProps {
  label: string;
  value: string | number | "";
  options: Option[];
  required?: boolean;
  onChange: (value: string) => void;
}

export default function SelectInput({
  label,
  value,
  options,
  onChange,
  required = false,
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
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-cyan-500"
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}