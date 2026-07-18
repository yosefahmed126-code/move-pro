interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: Props) {
  return (
    <input
      className="w-full rounded-lg border p-3"
      placeholder={placeholder}
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
    />
  );
}