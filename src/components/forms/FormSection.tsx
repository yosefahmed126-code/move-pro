import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function FormSection({
  title,
  children,
}: Props) {
  return (
    <div className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
}