"use client";
import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  onGenerationStart: () => void;
  onGenerationProgress: (chars: number) => void;
  onGenerationComplete: () => void;
  onGenerationError: (message: string) => void;
};

export default function IntakeForm({
  onGenerationStart,
  onGenerationProgress,
  onGenerationComplete,
  onGenerationError,
}: Props) {
  const [role, setRole] = useState("");
  const [years, setYears] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState("");
  const [location, setLocation] = useState("");
  const [runway, setRunway] = useState("");
  const [exitReason, setExitReason] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!role.trim() || !years || stack.length === 0) {
      setError("Please fill in your role, years of experience, and at least one tech stack tag.");
      return;
    }

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { error: saveError } = await supabase.from("users").upsert({
      id: userId,
      role,
      years_experience: years ? parseInt(years) : null,
      tech_stack: stack,
      location,
      runway_weeks: runway ? parseInt(runway) : null,
      exit_reason: exitReason,
    });

    setSaving(false);

    if (saveError) {
      console.error(saveError);
      setError("Could not save your info. Try again.");
      return;
    }

    // Hand off to the Roadmap tab immediately — generation continues in the
    // background while the user is already looking at the live readout there.
    onGenerationStart();

    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Something went wrong." }));
        onGenerationError(json.error || "Couldn't generate your roadmap. Try again.");
        return;
      }

      if (!res.body) {
        onGenerationError("Couldn't generate your roadmap. Try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let totalChars = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        totalChars += chunk.length;
        onGenerationProgress(totalChars);
      }

      if (buffer.includes("[[DONE]]")) {
        onGenerationComplete();
      } else if (buffer.includes("[[ERROR:")) {
        onGenerationError("Generated, but couldn't save your roadmap. Try again.");
      } else {
        onGenerationError("Something interrupted your roadmap generation. Try again.");
      }
    } catch (err) {
      console.error(err);
      onGenerationError("Couldn't generate your roadmap. Check your connection and try again.");
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && stackInput.trim()) {
      setStack([...stack, stackInput.trim()]);
      setStackInput("");
    }
  };

  const inputClass =
    "w-full bg-surface2 border border-border rounded px-3 py-2.5 text-text text-sm outline-none placeholder:text-textDim/60";

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl font-medium text-text mb-2">
        Let's build your roadmap
      </h1>
      <p className="text-textDim text-sm mb-8 max-w-md">
        Five minutes of real detail gets you a plan that's actually built for
        your situation.
      </p>

      <div className="mb-6">
        <label className="block text-sm text-textDim mb-2">
          Current or most recent role
        </label>
        <input
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Backend Engineer"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-textDim mb-2">
          Years of experience
        </label>
        <input
          className={inputClass}
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="e.g. 6"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-textDim mb-2">Tech stack</label>
        <div className={`${inputClass} flex flex-wrap gap-2 min-h-[20px]`}>
          {stack.map((tag, i) => (
            <span
              key={i}
              className="font-mono text-xs text-accentStrong bg-accent/10 border border-accent rounded px-2 py-0.5 flex items-center gap-1.5"
            >
              {tag}
              <X
                size={11}
                className="cursor-pointer"
                onClick={() => setStack(stack.filter((_, idx) => idx !== i))}
              />
            </span>
          ))}
          <input
            value={stackInput}
            onChange={(e) => setStackInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="type and press enter"
            className="bg-transparent border-none outline-none text-text text-sm flex-1 min-w-[120px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-textDim mb-2">
            Location / remote preference
          </label>
          <input
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, US"
          />
        </div>
        <div>
          <label className="block text-sm text-textDim mb-2">
            Runway (weeks)
          </label>
          <input
            className={inputClass}
            type="number"
            value={runway}
            onChange={(e) => setRunway(e.target.value)}
            placeholder="e.g. 12"
          />
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm text-textDim mb-2">
          What brought you here
        </label>
        <div className="flex gap-2">
          {["Laid off", "Resigned", "Burned out"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setExitReason(opt)}
              className={`flex-1 rounded px-0 py-2.5 text-sm border ${
                exitReason === opt
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-text bg-surface2"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="bg-accent text-bg font-semibold text-sm rounded px-5 py-3 flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Generate my roadmap"} <ArrowRight size={15} />
      </button>

      {error && <p className="text-danger text-sm mt-3">{error}</p>}
    </div>
  );
}
