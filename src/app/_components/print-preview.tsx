"use client";

import { fetcher } from "@/lib/utils";
import { useState } from "react";
import useSWR from "swr";

type CitationPreview = {
  id: number;
  citationNumber: string;
  issuedAt: string;
  status: "issued" | "paid" | "void";
  location: string;
  amountDue: number;
  officerName?: string;
  vehiclePlate?: string;
  violationDescription?: string;
};

export function PrintPreview({ citationId }: { citationId: number | null }) {
  const { data } = useSWR<CitationPreview>(citationId ? `/api/citations/${citationId}` : null, fetcher);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = async () => {
    if (!citationId || isDownloading) return;

    setIsDownloading(true);

    try {
      const res = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: citationId }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `citation-${citationId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!citationId) {
    return (
      <div className="surface-card p-4 text-sm text-slate-500">
        Select a citation from the table to preview details and download a print-ready PDF.
      </div>
    );
  }

  if (!data) {
    return <div className="surface-card p-4 text-sm text-slate-500">Loading citation preview...</div>;
  }

  return (
    <div className="surface-card p-4 md:p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-900 md:text-lg">Ticket Preview</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Citation #</dt>
          <dd className="font-medium text-slate-900">{data.citationNumber}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Issued</dt>
          <dd className="text-right text-slate-900">{new Date(data.issuedAt).toLocaleString()}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Status</dt>
          <dd className="capitalize text-slate-900">{data.status}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Vehicle</dt>
          <dd className="text-slate-900">{data.vehiclePlate ?? "—"}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Officer</dt>
          <dd className="text-right text-slate-900">{data.officerName ?? "—"}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Violation</dt>
          <dd className="max-w-[18ch] text-right text-slate-900">{data.violationDescription ?? "—"}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Location</dt>
          <dd className="max-w-[18ch] text-right text-slate-900">{data.location}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 pt-1">
          <dt className="text-slate-500">Amount Due</dt>
          <dd className="text-lg font-semibold text-slate-900">${data.amountDue?.toFixed(2)}</dd>
        </div>
      </dl>

      <button
        onClick={handlePrint}
        disabled={isDownloading}
        className="subtle-ring mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDownloading ? "Preparing PDF..." : "Download PDF"}
      </button>
    </div>
  );
}
