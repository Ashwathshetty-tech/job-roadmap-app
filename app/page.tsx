"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import IntakeForm from "@/components/IntakeForm";
import LoginForm from "@/components/LoginForm";
import RoadmapView from "@/components/RoadmapView";
import Resources from "@/components/Resource";
import Connect from "@/components/Connect";


export default function Home() {
  const [tab, setTab] = useState<"intake" | "roadmap" | "resources"| "connect">("intake");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
        {" "}
        <div className="font-serif text-xl font-semibold text-text tracking-tight">
          Forward
        </div>
        {user && (
          <div className="flex gap-1 bg-surface border border-border rounded-md p-1">
            {(["intake", "roadmap", "resources", "connect"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-sm rounded capitalize transition-colors ${
                  tab === t
                    ? "bg-surface2 text-text"
                    : "text-textDim hover:text-text"
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
      ) : tab === "roadmap" ? (
        <RoadmapView />
      ) : tab === "resources" ? (
        <Resources />
      ) : (
        <Connect />
      )}
    </div>
  );
}
