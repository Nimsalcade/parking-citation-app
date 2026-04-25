"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { fetcher } from "@/lib/utils";
import { citationSchema, CitationFormInput } from "@/lib/validators";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

type ReferenceData = {
  officers: Array<{ id: number; name: string; badgeNumber: string }>;
  vehicles: Array<{ id: number; label: string }>;
  violations: Array<{ id: number; code: string; description: string; fineAmount: number }>;
};

export function CitationForm({ onCreated }: { onCreated: (newCitationId?: number) => void }) {
  const { data: referenceData } = useSWR<ReferenceData>("/api/reference", fetcher);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CitationFormInput>({
    resolver: zodResolver(citationSchema),
    defaultValues: {
      status: "issued",
      amountDue: 0,
    },
  });

  const violationId = watch("violationId");

  const violationFineById = useMemo(() => {
    const map = new Map<number, number>();
    referenceData?.violations.forEach((violation) => map.set(violation.id, violation.fineAmount));
    return map;
  }, [referenceData]);

  useEffect(() => {
    if (!violationId) return;
    const fine = violationFineById.get(Number(violationId));
    if (fine) {
      setValue("amountDue", fine, { shouldValidate: true });
    }
  }, [setValue, violationFineById, violationId]);

  const onSubmit = async (values: CitationFormInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const parsed = citationSchema.parse(values);

      const response = await fetch("/api/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        throw new Error("Unable to create citation. Please verify required fields and retry.");
      }

      const created = await response.json();
      reset({ status: "issued", amountDue: 0 });
      setSubmitSuccess(`Citation ${created.citationNumber ?? "record"} created successfully.`);
      onCreated(created.id);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unexpected error while creating citation.");
    }
  };

  const isReferenceLoaded = Boolean(referenceData);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Citation Number</label>
        <input
          {...register("citationNumber")}
          className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Auto-generated if empty"
        />
        {errors.citationNumber && <p className="mt-1 text-sm text-red-600">{errors.citationNumber.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Officer</label>
          <select
            {...register("officerId", { valueAsNumber: true })}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={!isReferenceLoaded}
            required
          >
            <option value="">Select officer</option>
            {referenceData?.officers.map((officer) => (
              <option key={officer.id} value={officer.id}>
                {officer.name} (Badge {officer.badgeNumber})
              </option>
            ))}
          </select>
          {errors.officerId && <p className="mt-1 text-sm text-red-600">{errors.officerId.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Vehicle</label>
          <select
            {...register("vehicleId", { valueAsNumber: true })}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={!isReferenceLoaded}
            required
          >
            <option value="">Select vehicle</option>
            {referenceData?.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
          {errors.vehicleId && <p className="mt-1 text-sm text-red-600">{errors.vehicleId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Violation</label>
          <select
            {...register("violationId", { valueAsNumber: true })}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={!isReferenceLoaded}
            required
          >
            <option value="">Select violation</option>
            {referenceData?.violations.map((violation) => (
              <option key={violation.id} value={violation.id}>
                {violation.code} - {violation.description} (${violation.fineAmount.toFixed(2)})
              </option>
            ))}
          </select>
          {errors.violationId && <p className="mt-1 text-sm text-red-600">{errors.violationId.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <input
            {...register("location")}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g., 5th Ave & Pine St"
            required
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Amount Due</label>
          <input
            type="number"
            step="0.01"
            {...register("amountDue", { valueAsNumber: true })}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
          {errors.amountDue && <p className="mt-1 text-sm text-red-600">{errors.amountDue.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
          <input
            type="date"
            {...register("dueDate")}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select
          {...register("status")}
          className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="void">Void</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Optional supporting notes"
        />
      </div>

      {submitError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}
      {submitSuccess && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitSuccess}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="subtle-ring w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Issuing Citation..." : "Issue Citation"}
      </button>
    </form>
  );
}
