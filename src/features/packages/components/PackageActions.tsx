"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

interface Props {
  packageId: number;
}

export default function PackageActions({
  packageId,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={`/packages/${packageId}/edit`}
        title="Edit"
        className="rounded-md p-2 text-orange-500 transition hover:bg-orange-50"
      >
        <Pencil size={18} />
      </Link>
    </div>
  );
}