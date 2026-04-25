"use client";

import { fetcher } from "@/lib/utils";
import useSWR from "swr";

type StatsResponse = {
  totalCitations: number;
  totalUnpaid: number;
  totalCollected: number;
  officerCount: number;
  violationCount: number;
};

export function StatCards() {
  const { data, isLoading } = useSWR<StatsResponse>("/api/stats", fetcher, {
    refreshInterval: 30_000,
  });

  const totalCollected = toFiniteNumber(data?.totalCollected);

  const stats = [
    {
      label: "Total Citations",
      value: data?.totalCitations ?? 0,
      tone: "bg-blue-50 text-blue-700",
      emoji: "🧾",
    },
    {
      label: "Unpaid Citations",
      value: data?.totalUnpaid ?? 0,
      tone: "bg-amber-50 text-amber-700",
      emoji: "⏳",
    },
    {
      label: "Total Collected",
      value: `$${(data?.totalCollected ?? 0).toFixed(2)}`,
      tone: "bg-emerald-50 text-emerald-700",
      emoji: "💳",
    },
    {
      label: "Active Violations",
      value: data?.violationCount ?? 0,
      tone: "bg-violet-50 text-violet-700",
      emoji: "🚫",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="surface-card p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <span className={`rounded-lg px-2 py-1 text-sm ${stat.tone}`}>{stat.emoji}</span>
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            {isLoading ? "…" : stat.value}
          </p>
        </article>
      ))}
    </section>
  );
}
