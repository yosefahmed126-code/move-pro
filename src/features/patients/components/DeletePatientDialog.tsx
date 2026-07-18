"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

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

      router.push("/patients");
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger
  className="rounded-md p-2 text-red-600 transition hover:bg-red-50"
  title="Delete"
>
  <Trash2 size={18} />
</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Patient</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{patientName}</strong>?
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
        <DialogTrigger
  className="rounded-md p-2 text-red-600 transition hover:bg-red-50"
  title="Delete"
>
  <Trash2 size={18} />
</DialogTrigger>
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