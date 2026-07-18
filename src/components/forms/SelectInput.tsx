interface Option {
  value: number | string;
  label: string;
}

interface Props {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  options: Option[];
}

export default function SelectInput({
  label,
  value,
  onChange,
  options,
}: Props) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        {label}
      </label>

      <select
        className="w-full rounded-lg border p-3"
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
      >
        <option value={0}>
          Select...
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