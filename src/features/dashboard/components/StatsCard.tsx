import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "bg-cyan-500",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white`}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}