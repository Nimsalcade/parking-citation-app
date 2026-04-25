import { Suspense } from "react";
import { LayoutShell } from "./_components/layout-shell";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_30%,_#eef2ff_65%,_#f8fafc_100%)]">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 md:px-6 lg:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Civic Ops Suite</p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Parking Citation Command Center
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 md:text-base">
            Operate a full citation lifecycle workflow with fast issuance, status tracking, ticket
            exports, and real-time metrics for municipal enforcement teams.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-sm text-slate-600 shadow-sm">
              Loading dashboard modules...
            </div>
          }
        >
          <LayoutShell />
        </Suspense>
      </main>
    </div>
  );
}
