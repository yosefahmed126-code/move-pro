interface Props {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}

export default function TextArea({
  label,
  value,
  rows = 4,
  onChange,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-cyan-500"
      />
    </div>
  );
}