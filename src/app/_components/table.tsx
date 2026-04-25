"use client";

import { fetcher } from "@/lib/utils";
import { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";

type CitationStatus = "issued" | "paid" | "void";

type CitationRow = {
  id: number;
  citationNumber: string;
  issuedAt: string;
  location: string;
  amountDue: number | string | null;
  status: CitationStatus;
};

const PAGE_SIZE = 8;


function toFiniteNumber(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

export function CitationsTable({ onSelect }: { onSelect: (id: number) => void }) {
  const { data, mutate, isLoading } = useSWR<CitationRow[]>("/api/citations", fetcher, {
    refreshInterval: 10_000,
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CitationStatus>("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => data ?? [], [data]);

  const filteredRows = useMemo(() => {
    return rows
      .filter((citation) => {
        const matchesStatus = statusFilter === "all" ? true : citation.status === statusFilter;
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          normalizedQuery.length === 0 ||
          citation.citationNumber.toLowerCase().includes(normalizedQuery) ||
          citation.location.toLowerCase().includes(normalizedQuery);
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  }, [query, rows, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page, totalPages]);

  const handleStatusChange = async (id: number, status: CitationStatus) => {
    await fetch(`/api/citations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    await Promise.all([mutate(), globalMutate("/api/stats")]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by citation # or location"
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | CitationStatus);
              setPage(1);
            }}
            className="subtle-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="void">Void</option>
          </select>
        </div>

        <p className="text-sm text-slate-600">{filteredRows.length} citation(s) found</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Citation #</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Issued At</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                  Loading citations...
                </td>
              </tr>
            )}

            {!isLoading && paginatedRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No citations match the current filters.
                </td>
              </tr>
            )}

            {paginatedRows.map((citation) => (
              <tr key={citation.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{citation.citationNumber}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{new Date(citation.issuedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{citation.location}</td>
                <td className="px-4 py-3 text-sm text-slate-900">${toFiniteNumber(citation.amountDue).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <select
                    value={citation.status}
                    onChange={(e) => handleStatusChange(citation.id, e.target.value as CitationStatus)}
                    className="subtle-ring rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="issued">Issued</option>
                    <option value="paid">Paid</option>
                    <option value="void">Void</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onSelect(citation.id)}
                    className="subtle-ring rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Preview & Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Page {Math.min(page, totalPages)} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="subtle-ring rounded-lg border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="subtle-ring rounded-lg border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
