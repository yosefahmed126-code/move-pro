"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteTherapist } from "../actions/deleteTherapist";
import { useRouter } from "next/navigation";

interface Props {
  therapistId: number;
}

export default function TherapistActions({
  therapistId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this therapist?"
    );

    if (!confirmed) return;

    setLoading(true);

    const result = await deleteTherapist(therapistId);

    setLoading(false);

    if (!result.success) {
      alert(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex justify-center gap-2">
      <Link
        href={`/therapists/${therapistId}/edit`}
        className="rounded-lg p-2 text-orange-500 hover:bg-orange-50"
      >
        <Pencil size={18} />
      </Link>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}