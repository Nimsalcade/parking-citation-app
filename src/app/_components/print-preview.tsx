"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
export function PrintPreview({ citationId }: { citationId: number | null }) {
  const { data } = useSWR(citationId ? `/api/citations/${citationId}` : null, fetcher);

  const handlePrint = async () => {
    if (!citationId) return;
    const res = await fetch("/api/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: citationId }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `citation-${citationId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!citationId) {
    return <div className="text-gray-500">Select a citation to preview.</div>;
  }

  if (!data) {
    return <div>Loading preview...</div>;
  }

  return (
    <div className="bg-white border rounded p-4 space-y-2">
      <h2 className="text-lg font-semibold">Ticket Preview</h2>
      <p>
        <strong>Citation #:</strong> {data.citationNumber}
      </p>
      <p>
        <strong>Issued At:</strong> {data.issuedAt}
      </p>
      <p>
        <strong>Status:</strong> {data.status}
      </p>
      <p>
        <strong>Location:</strong> {data.location}
      </p>
      <p>
        <strong>Amount Due:</strong> ${data.amountDue?.toFixed(2)}
      </p>
      <button
        onClick={handlePrint}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download PDF
      </button>
    </div>
  );
}
