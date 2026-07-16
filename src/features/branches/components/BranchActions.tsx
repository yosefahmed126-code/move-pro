"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

interface Props {
  branchId: number;
}

export default function BranchActions({
  branchId,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={`/branches/${branchId}/edit`}
        title="Edit"
        className="rounded-md p-2 text-orange-500 transition hover:bg-orange-50"
      >
        <Pencil size={18} />
      </Link>
    </div>
  );
}