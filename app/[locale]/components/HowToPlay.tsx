"use client";

import { useState } from "react";

export default function HowToPlay({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10 mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-white/40 hover:text-white/60 text-sm transition-colors"
      >
        <span className="font-semibold">{title}</span>
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ›
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="px-4 pb-6 text-white/50 text-sm leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
