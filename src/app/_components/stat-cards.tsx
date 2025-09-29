"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
export function StatCards() {
  const { data } = useSWR("/api/stats", fetcher, {
    refreshInterval: 30_000,
  });

  const stats = [
    {
      label: "Total Citations",
      value: data?.totalCitations ?? 0,
    },
    {
      label: "Unpaid Citations",
      value: data?.totalUnpaid ?? 0,
    },
    {
      label: "Total Collected",
      value: `$${(data?.totalCollected ?? 0).toFixed(2)}`,
    },
    {
      label: "Active Violations",
      value: data?.violationCount ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="text-2xl font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
