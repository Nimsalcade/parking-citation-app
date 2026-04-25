"use client";

import { useMemo, useState } from "react";
import { mutate } from "swr";
import { CitationForm } from "./form";
import { PrintPreview } from "./print-preview";
import { StatCards } from "./stat-cards";
import { CitationsTable } from "./table";

export function LayoutShell() {
  const [selectedCitationId, setSelectedCitationId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = async (newCitationId?: number) => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([mutate("/api/citations"), mutate("/api/stats")]);

    if (newCitationId) {
      setSelectedCitationId(newCitationId);
    }
  };

  const selectedLabel = useMemo(() => {
    if (!selectedCitationId) return "No citation selected";
    return `Selected citation: #${selectedCitationId}`;
  }, [selectedCitationId]);

  return (
    <div className="space-y-6">
      <StatCards key={`stats-${refreshKey}`} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="surface-card p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Citation Operations</h2>
                <p className="text-xs text-slate-500 md:text-sm">Search, triage, and update ticket states in real time.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {selectedLabel}
              </span>
            </div>
            <CitationsTable onSelect={setSelectedCitationId} key={`table-${refreshKey}`} />
          </div>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="surface-card p-4 md:p-5">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Issue New Citation</h2>
            <p className="mb-4 text-xs text-slate-500">Capture violation data with validated, production-ready form controls.</p>
            <CitationForm onCreated={handleCreated} />
          </div>

          <PrintPreview citationId={selectedCitationId} />
        </aside>
      </section>
    </div>
  );
}
