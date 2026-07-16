"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PatientToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  function handleSearch(value: string) {
    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.push(`/patients?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search patient..."
            className="w-full rounded-lg border py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select className="rounded-lg border px-3 py-2">
          <option>All Branches</option>
        </select>

        <select className="rounded-lg border px-3 py-2">
          <option>All Status</option>
        </select>
      </div>
    </div>
  );
}