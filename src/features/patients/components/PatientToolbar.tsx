"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function PatientToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(currentSearch);

  const [debouncedSearch] = useDebounce(search, 300);

  useEffect(() => {
    // Don't navigate if nothing actually changed
    if (debouncedSearch === currentSearch) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());

      // Reset pagination when searching
      params.set("page", "1");
    } else {
      params.delete("search");
      params.delete("page");
    }

    const query = params.toString();

    const url = query
      ? `${pathname}?${query}`
      : pathname;

    router.replace(url);
  }, [
    debouncedSearch,
    currentSearch,
    pathname,
    router,
    searchParams,
  ]);

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
            onChange={(e) => setSearch(e.target.value)}
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