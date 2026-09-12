"use client";
import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
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

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("roadmaps")
        .select("weeks")
        .eq("user_id", userData.user?.id)
        .single();

      if (!error && data) setWeeks(data.weeks as Week[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-textDim text-sm">Loading your roadmap...</p>;
  if (!weeks) return <p className="text-textDim text-sm">No roadmap yet — complete the Intake form and generate one.</p>;

  const week = weeks.find((w) => w.week_number === selected) || weeks[0];

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
        <div className="text-sm text-textDim mb-7">
          Target: {week.application_target} applications this week
        </div>

        {[
          { title: "Skill actions", items: week.skill_actions },
          { title: "Networking", items: week.networking_actions },
          { title: "Interview prep", items: week.interview_prep_actions },
        ]
          .filter((s) => s.items?.length)
          .map((section) => (
            <div key={section.title} className="mb-6">
              <div className="text-xs text-textDim mb-2.5">{section.title}</div>
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border">
                  <Circle size={15} className="text-textDim" />
                  <span className="text-sm text-text">{item}</span>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}