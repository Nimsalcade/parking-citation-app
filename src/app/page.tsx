import { Suspense } from "react";
import { LayoutShell } from "./_components/layout-shell";
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Parking Citation Management</h1>
          <p className="text-blue-200">
            Issue, manage, and print parking violation citations efficiently.
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <LayoutShell />
        </Suspense>
      </main>
    </div>
  );
}
