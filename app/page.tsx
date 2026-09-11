"use client";
import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState<"intake" | "roadmap">("intake");

  return (
    <div className="min-h-screen px-14 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="font-serif text-lg font-semibold text-text">Forward</div>
        <div className="flex gap-1 bg-surface border border-border rounded-md p-1">
          {(["intake", "roadmap"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded capitalize ${
                tab === t ? "bg-surface2 text-text" : "text-textDim"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "intake" ? (
        <div className="text-textDim text-sm">Intake form goes here (Day 4)</div>
      ) : (
        <div className="text-textDim text-sm">Roadmap view goes here (Day 8)</div>
      )}
    </div>
  );
}