"use client";
import { useEffect, useState } from "react";
import { Circle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Week = {
  week_number: number;
  focus_summary: string;
  skill_actions: string[];
  application_target: number;
  networking_actions: string[];
  interview_prep_actions: string[];
};

export default function RoadmapView() {
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      const { data: roadmapData, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("weeks")
        .eq("user_id", uid)
        .single();

      if (!roadmapError && roadmapData) setWeeks(roadmapData.weeks as Week[]);

      // Load existing checked state
      const { data: logData } = await supabase
        .from("action_log")
        .select("week_number, section, item_index, done")
        .eq("user_id", uid);

      if (logData) {
        const initial: Record<string, boolean> = {};
        logData.forEach((row) => {
          initial[`${row.week_number}-${row.section}-${row.item_index}`] = row.done;
        });
        setChecked(initial);
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-textDim text-sm">Loading your roadmap...</p>;
  if (!weeks) return <p className="text-textDim text-sm">No roadmap yet — complete the Intake form and generate one.</p>;

  const week = weeks.find((w) => w.week_number === selected) || weeks[0];
  const itemKey = (section: string, index: number) => `${week.week_number}-${section}-${index}`;

  const toggle = async (section: string, index: number) => {
    const key = itemKey(section, index);
    const newValue = !checked[key];

    // Update UI immediately (optimistic update)
    setChecked((prev) => ({ ...prev, [key]: newValue }));

    // Persist to Supabase
    const { error } = await supabase.from("action_log").upsert(
      {
        user_id: userId,
        week_number: week.week_number,
        section,
        item_index: index,
        done: newValue,
      },
      { onConflict: "user_id,week_number,section,item_index" }
    );

    if (error) {
      console.error("Failed to save action:", error);
      // Revert on failure
      setChecked((prev) => ({ ...prev, [key]: !newValue }));
    }
  };

  const sections = [
    { title: "Skill actions", key: "skill", items: week.skill_actions },
    { title: "Networking", key: "networking", items: week.networking_actions },
    { title: "Interview prep", key: "interview", items: week.interview_prep_actions },
  ].filter((s) => s.items?.length);

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const doneItems = sections.reduce(
    (sum, s) => sum + s.items.filter((_, i) => checked[itemKey(s.key, i)]).length,
    0
  );

  return (
    <div className="grid grid-cols-[200px_1fr] gap-10">
      <div>
        <div className="text-xs text-textDim mb-3 tracking-wide">Your plan</div>
        {weeks.map((w) => (
          <div
            key={w.week_number}
            onClick={() => setSelected(w.week_number)}
            className={`py-3 pl-3.5 mb-1 cursor-pointer border-l-2 ${
              w.week_number === selected ? "border-accent" : "border-border"
            }`}
          >
            <div className={`font-mono text-[11px] ${w.week_number === selected ? "text-accent" : "text-textDim"}`}>
              WEEK {w.week_number}
            </div>
            <div className={`text-sm mt-0.5 ${w.week_number === selected ? "text-text" : "text-textDim"}`}>
              {w.focus_summary.split(" ").slice(0, 4).join(" ")}...
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-2xl text-text mb-1.5">{week.focus_summary}</h2>
        <div className="text-sm text-textDim mb-1">
          Target: {week.application_target} applications this week
        </div>
        <div className="text-xs text-accent mb-7">
          {doneItems} of {totalItems} actions done this week
        </div>

        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="text-xs text-textDim mb-2.5">{section.title}</div>
            {section.items.map((item, i) => {
              const key = itemKey(section.key, i);
              const isChecked = !!checked[key];
              return (
                <div
                  key={i}
                  onClick={() => toggle(section.key, i)}
                  className="flex items-center gap-2.5 py-2 border-b border-border cursor-pointer group"
                >
                  {isChecked ? (
                    <CheckCircle2 size={15} className="text-accent" />
                  ) : (
                    <Circle size={15} className="text-textDim group-hover:text-text" />
                  )}
                  <span className={`text-sm ${isChecked ? "text-textDim line-through" : "text-text"}`}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}