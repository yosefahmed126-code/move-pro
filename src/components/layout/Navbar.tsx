"use client";

import { Bell, Search, Moon } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search patients..."
          className="w-full rounded-lg border pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell className="text-gray-600" />

          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>

        <button>
          <Moon className="text-gray-600" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <h3 className="font-semibold">
              Yosef Ahmed
            </h3>

            <p className="text-sm text-gray-500">
              Executive Manager
            </p>
          </div>

          <div className="w-11 h-11 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
            Y
          </div>
        </div>
      </div>
    </header>
  );
}