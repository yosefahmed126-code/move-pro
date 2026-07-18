interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export default function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: Props) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        {label}
      </label>

      <input
        type={type}
        className="w-full rounded-lg border p-3"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}