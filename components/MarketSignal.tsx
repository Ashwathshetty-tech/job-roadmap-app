"use client";
import { useEffect, useState } from "react";

export default function MarketSignal({ searchTerm }: { searchTerm: string }) {
  const [signal, setSignal] = useState<{ totalOpenPostings: number; postedThisWeek: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/market-signal?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        if (res.ok) setSignal(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [searchTerm]);

  if (loading) return null;
  if (!signal) return null;

  return (
    <div className="bg-surface2 border border-border rounded px-4 py-3 mb-6">
      <div className="text-xs text-textDim mb-1">Market signal — "{searchTerm}"</div>
      <div className="text-sm text-text">
        <span className="text-accent font-semibold">{signal.postedThisWeek}</span> roles posted
        this week ·{" "}
        <span className="text-textDim">{signal.totalOpenPostings} currently open (remote)</span>
      </div>
    </div>
  );
}