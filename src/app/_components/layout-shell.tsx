"use client";

import { useState } from "react";
import { CitationForm } from "./form";
import { CitationsTable } from "./table";
import { PrintPreview } from "./print-preview";
import { StatCards } from "./stat-cards";
import { mutate } from "swr";

export function LayoutShell() {
  const [selectedCitationId, setSelectedCitationId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = async () => {
    setRefreshKey((prev) => prev + 1);
    await mutate("/api/citations");
  };

  return (
    <div className="space-y-6">
      <StatCards key={`stats-${refreshKey}`} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CitationsTable onSelect={setSelectedCitationId} key={`table-${refreshKey}`} />
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Issue New Citation</h2>
            <CitationForm onCreated={handleCreated} />
          </div>
          <PrintPreview citationId={selectedCitationId} />
        </div>
      </div>
    </div>
  );
}
