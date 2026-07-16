"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePatient } from "../actions/deletePatient";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Trash2 } from "lucide-react";

interface Props {
  patientId: number;
  patientName: string;
}

export default function DeletePatientDialog({
  patientId,
  patientName,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deletePatient(patientId);
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="rounded-md p-2 text-red-600 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Patient</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete
            <strong> {patientName}</strong>?
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
         import { DialogClose } from "@/components/ui/dialog";
         <DialogClose asChild>
  <Button variant="outline">
    Cancel
  </Button>
</DialogClose>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}