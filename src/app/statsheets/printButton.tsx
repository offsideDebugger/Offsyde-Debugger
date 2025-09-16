"use client";

import React from "react";

export default function ExportButton() {
  return (
    <button
      type="button"
      onClick={() => typeof window !== 'undefined' && window.print()}
      className="px-4 py-2 text-sm font-medium text-neutral-100 bg-black rounded-lg border-neutral-700 border hover:bg-neutral-900 active:scale-[0.99]"
      aria-label="Export statsheet as PDF"
    >
      Export PDF
    </button>
  );
}
