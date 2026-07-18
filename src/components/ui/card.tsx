interface Props {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  title,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm ${className}`}
    >
      {title && (
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>
        </div>
      )}

      <div className="p-6">{children}</div>
    </div>
  );
}