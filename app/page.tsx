"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import IntakeForm from "@/components/IntakeForm";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const [tab, setTab] = useState<"intake" | "roadmap">("intake");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen px-14 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="font-serif text-lg font-semibold text-text">Forward</div>
        {user && (
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
        )}
      </div>

      {!user ? (
        <LoginForm />
      ) : tab === "intake" ? (
        <IntakeForm />
      ) : (
        <div className="text-textDim text-sm">Roadmap view goes here (Day 8)</div>
      )}
    </div>
  );
}