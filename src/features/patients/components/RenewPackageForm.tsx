"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DiscountType } from "@prisma/client";

import { createPatientPackage } from "../actions/createPatientPackage";

interface RenewPackageFormProps {
  patientId: number;

  packages: {
    id: number;
    name: string;
    sessions: number;
    price: number;
  }[];

  branches: {
    id: number;
    name: string;
  }[];

  hasActivePackage: boolean;
}

export default function RenewPackageForm({
  patientId,
  packages,
  branches,
  hasActivePackage,
}: RenewPackageFormProps) {
  const router = useRouter();

  const [packageId, setPackageId] = useState(0);
  const [branchId, setBranchId] = useState(0);

  const [discountType, setDiscountType] =
    useState<DiscountType>(DiscountType.NONE);

  const [discountValue, setDiscountValue] =
    useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedPackage = packages.find(
    (item) => item.id === packageId
  );

  const originalPrice =
    selectedPackage?.price ?? 0;

  let finalPrice = originalPrice;

  if (
    discountType === DiscountType.PERCENTAGE
  ) {
    finalPrice =
      originalPrice -
      originalPrice *
        (discountValue / 100);
  }

  if (discountType === DiscountType.FIXED) {
    finalPrice =
      originalPrice - discountValue;
  }

  if (finalPrice < 0) {
    finalPrice = 0;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (hasActivePackage) {
      setMessage(
        "Patient already has an active package."
      );
      return;
    }

    if (!packageId) {
      setMessage("Please select a package.");
      return;
    }

    if (!branchId) {
      setMessage("Please select a branch.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await createPatientPackage({
      patientId,
      packageId,
      branchId,
      discountType,
      discountValue:
        discountType === DiscountType.NONE
          ? 0
          : discountValue,
    });

    setLoading(false);

    if (!result.success) {
      setMessage(
        result.message ??
          "Something went wrong."
      );
      return;
    }

    setPackageId(0);
    setBranchId(0);
    setDiscountType(DiscountType.NONE);
    setDiscountValue(0);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {hasActivePackage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This patient already has an active
          package. Complete or cancel the current
          package before adding a new one.
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Package
          </label>

          <select
            value={packageId}
            onChange={(e) =>
              setPackageId(
                Number(e.target.value)
              )
            }
            disabled={hasActivePackage}
            className="w-full rounded-lg border p-3 disabled:bg-slate-100"
            required
          >
            <option value={0}>
              Select Package
            </option>

            {packages.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name} - {item.sessions}{" "}
                sessions
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Branch
          </label>

          <select
            value={branchId}
            onChange={(e) =>
              setBranchId(
                Number(e.target.value)
              )
            }
            disabled={hasActivePackage}
            className="w-full rounded-lg border p-3 disabled:bg-slate-100"
            required
          >
            <option value={0}>
              Select Branch
            </option>

            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Discount Type
          </label>

          <select
            value={discountType}
            onChange={(e) => {
              const value =
                e.target.value as DiscountType;

              setDiscountType(value);

              if (
                value === DiscountType.NONE
              ) {
                setDiscountValue(0);
              }
            }}
            disabled={hasActivePackage}
            className="w-full rounded-lg border p-3 disabled:bg-slate-100"
          >
            <option value={DiscountType.NONE}>
              No Discount
            </option>

            <option value={DiscountType.FIXED}>
              Fixed Amount
            </option>

            <option
              value={DiscountType.PERCENTAGE}
            >
              Percentage
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Discount Value
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={discountValue}
            onChange={(e) =>
              setDiscountValue(
                Number(e.target.value)
              )
            }
            disabled={
              hasActivePackage ||
              discountType === DiscountType.NONE
            }
            className="w-full rounded-lg border p-3 disabled:bg-slate-100"
          />
        </div>
      </div>

      {selectedPackage && (
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">
                Sessions
              </p>

              <p className="font-semibold">
                {selectedPackage.sessions}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Original Price
              </p>

              <p className="font-semibold">
                {originalPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Final Price
              </p>

              <p className="font-semibold text-cyan-700">
                {finalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || hasActivePackage}
        className="rounded-lg bg-cyan-600 px-6 py-3 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Adding Package..."
          : "Add Package"}
      </button>
    </form>
  );
}