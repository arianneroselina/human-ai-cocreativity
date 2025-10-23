"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Submission Complete</h1>
            <p className="text-sm text-gray-500">Thank you for completing the task!</p>
          </div>
        </header>

        {/* Confirmation message */}
        <section className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-medium text-gray-800">Your submission was successful.</h2>
            <p className="text-sm text-gray-600 mt-2">You can now choose to go back and select another workflow or just exit.</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => router.push("/")}>Change workflow</Button>
            <Button variant="secondary" onClick={() => router.push("/")}>Exit</Button>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-gray-400">
          Prototype UI — no data is saved yet.
        </footer>
      </div>
    </main>
  );
}
