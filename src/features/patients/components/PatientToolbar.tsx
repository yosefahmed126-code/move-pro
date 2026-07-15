"use client";

import { Search } from "lucide-react";

export default function PatientToolbar() {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search patient..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select className="border rounded-lg px-3 py-2">
          <option>All Branches</option>
          <option>New Cairo</option>
          <option>Nasr City</option>
        </select>

        <select className="border rounded-lg px-3 py-2">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
    </div>
  );
}