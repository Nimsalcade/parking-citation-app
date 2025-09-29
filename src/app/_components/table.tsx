"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { useMemo } from "react";

type CitationRow = {
  id: number;
  citationNumber: string;
  issuedAt: string;
  location: string;
  amountDue: number;
  status: "issued" | "paid" | "void";
};

export function CitationsTable({ onSelect }: { onSelect: (id: number) => void }) {
  const { data, mutate } = useSWR<CitationRow[]>("/api/citations", fetcher, {
    refreshInterval: 10_000,
  });

  const rows = useMemo(() => data ?? [], [data]);

  const handleStatusChange = async (id: number, status: "issued" | "paid" | "void") => {
    await fetch(`/api/citations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    mutate();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Citation #</th>
            <th className="px-4 py-2">Issued At</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((citation) => (
            <tr key={citation.id} className="border-t">
              <td className="px-4 py-2">{citation.citationNumber}</td>
              <td className="px-4 py-2">{citation.issuedAt}</td>
              <td className="px-4 py-2">{citation.location}</td>
              <td className="px-4 py-2">${citation.amountDue.toFixed(2)}</td>
              <td className="px-4 py-2">
                <select
                  value={citation.status}
                  onChange={(e) =>
                    handleStatusChange(citation.id, e.target.value as "issued" | "paid" | "void")
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="issued">Issued</option>
                  <option value="paid">Paid</option>
                  <option value="void">Void</option>
                </select>
              </td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onSelect(citation.id)}
                  className="text-blue-600 hover:underline"
                >
                  Print Ticket
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
