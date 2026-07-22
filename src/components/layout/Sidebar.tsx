"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  FileText,
  Settings,
  Stethoscope,
  Building2,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    title: "schedule",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    title: "Therapists",
    href: "/therapists",
    icon: Stethoscope,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },

{
  title: "Branches",
  href: "/branches",
  icon: Building2,
},
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-cyan-400">
          Move Pro
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          Physiotherapy System
        </p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 px-6 py-4 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
            >
              <Icon size={20} />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}