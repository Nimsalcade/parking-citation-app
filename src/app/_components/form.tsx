"use client";

import { useForm } from "react-hook-form";
import { citationSchema, CitationFormInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

type ReferenceData = {
  officers: Array<{ id: number; name: string; badgeNumber: string }>;
  vehicles: Array<{ id: number; label: string }>;
  violations: Array<{ id: number; code: string; description: string; fineAmount: number }>;
};

export function CitationForm({ onCreated }: { onCreated: () => void }) {
  const { data: referenceData } = useSWR<ReferenceData>("/api/reference", fetcher);
  const isReferenceLoaded = Boolean(referenceData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CitationFormInput>({
    resolver: zodResolver(citationSchema),
    defaultValues: {
      status: "issued",
      amountDue: 0,
    },
  });

  const onSubmit = async (values: CitationFormInput) => {
    const parsed = citationSchema.parse(values);

    await fetch("/api/citations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });

    reset();
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Citation Number</label>
        <input
          {...register("citationNumber")}
          className="w-full border rounded px-3 py-2"
          placeholder="Auto-generated if empty"
        />
        {errors.citationNumber && (
          <p className="text-red-600 text-sm">{errors.citationNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Officer</label>
          <select
            {...register("officerId", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
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
          {errors.officerId && (
            <p className="text-red-600 text-sm">{errors.officerId.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Vehicle</label>
          <select
            {...register("vehicleId", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
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
          {errors.vehicleId && (
            <p className="text-red-600 text-sm">{errors.vehicleId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Violation</label>
          <select
            {...register("violationId", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
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
          {errors.violationId && (
            <p className="text-red-600 text-sm">{errors.violationId.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            {...register("location")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.location && (
            <p className="text-red-600 text-sm">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Amount Due</label>
        <input
          type="number"
          step="0.01"
          {...register("amountDue", { valueAsNumber: true })}
          className="w-full border rounded px-3 py-2"
          required
        />
        {errors.amountDue && (
          <p className="text-red-600 text-sm">{errors.amountDue.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Due Date</label>
        <input
          type="date"
          {...register("dueDate")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.dueDate && <p className="text-red-600 text-sm">{errors.dueDate.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          {...register("status")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="void">Void</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          {...register("notes")}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Issuing..." : "Issue Citation"}
      </button>
    </form>
  );
}
