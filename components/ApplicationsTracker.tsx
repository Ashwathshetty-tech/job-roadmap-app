"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  interview_completed_at: string | null;
  follow_up_sent_at: string | null;
};

const statusStyle: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  applied: { label: "Applied", color: "#9AA4AC", bg: "transparent" },
  interviewing: {
    label: "Interviewing",
    color: "#4FA8A0",
    bg: "rgba(79,168,160,0.12)",
  },
  waiting: { label: "Waiting", color: "#D4933D", bg: "rgba(212,147,61,0.12)" },
  offer: { label: "Offer", color: "#7FBF8F", bg: "rgba(127,191,143,0.12)" },
  rejected: {
    label: "Rejected",
    color: "#C97066",
    bg: "rgba(201,112,102,0.1)",
  },
  ghosted: { label: "Ghosted", color: "#9AA4AC", bg: "transparent" },
};

const DEFAULT_EXPECTED_DAYS = 10;

function daysSince(dateStr: string): number {
  const past = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - past.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function followUpTemplate(company: string, role: string): string {
  return `Subject: Following up — ${role} interview

Hi [Interviewer name],

Thanks again for taking the time to speak with me about the ${role} position at ${company}. I really enjoyed our conversation and learning more about the team.

I wanted to check in on the status of the role and see if there's any additional information I can provide. Looking forward to hearing from you.

Best,
[Your name]`;
}

export default function ApplicationsTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [openTemplateFor, setOpenTemplateFor] = useState<string | null>(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);

    const { data } = await supabase
      .from("applications")
      .select(
        "id, company, role, status, interview_completed_at, follow_up_sent_at",
      )
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (data) setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addApplication = async () => {
    if (!company.trim() || !role.trim()) return;

    const { error } = await supabase.from("applications").insert({
      user_id: userId,
      company: company.trim(),
      role: role.trim(),
      status: "applied",
    });

    if (!error) {
      setCompany("");
      setRole("");
      setShowForm(false);
      load();
    } else {
      console.error(error);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    const updates: Record<string, any> = { status: newStatus };

    // Stamp the timestamp when an application enters Waiting
    if (newStatus === "waiting") {
      updates.interview_completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", appId);

    if (!error) {
      load();
    } else {
      console.error(error);
    }
  };

  const markFollowUpSent = async (appId: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ follow_up_sent_at: new Date().toISOString() })
      .eq("id", appId);

    if (!error) {
      setOpenTemplateFor(null);
      load();
    } else {
      console.error(error);
    }
  };

  const updateInterviewDate = async (appId: string, dateStr: string) => {
    if (!dateStr) return;
    const { error } = await supabase
      .from("applications")
      .update({ interview_completed_at: new Date(dateStr).toISOString() })
      .eq("id", appId);

    if (!error) {
      load();
    } else {
      console.error(error);
    }
  };

  if (loading)
    return <p className="text-textDim text-sm">Loading applications...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-textDim">Applications in flight</div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-accent"
        >
          <Plus size={13} /> Add application
        </button>
      </div>

      {showForm && (
        <div className="flex gap-2 mb-4">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company"
            className="flex-1 bg-surface2 border border-border rounded px-3 py-2 text-text text-sm outline-none"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
            className="flex-1 bg-surface2 border border-border rounded px-3 py-2 text-text text-sm outline-none"
          />
          <button
            onClick={addApplication}
            className="bg-accent text-bg text-sm font-semibold rounded px-4 py-2"
          >
            Add
          </button>
        </div>
      )}

      {apps.length === 0 && (
        <p className="text-textDim text-sm py-4">
          No applications logged yet — add your first one above.
        </p>
      )}

      {apps.map((app) => {
        const s = statusStyle[app.status] ?? statusStyle.applied;
        return (
          <div key={app.id}>
            <div className="flex items-center justify-between py-3.5 border-b border-border">
              <div>
                <div className="text-sm text-text">{app.company}</div>
                <div className="text-xs text-textDim mt-0.5">{app.role}</div>
              </div>
              <div className="flex items-center gap-3.5">
                {app.status === "waiting" && app.interview_completed_at && (
                  <span className="font-mono text-[11px] text-textDim flex items-center gap-1.5">
                    Day {daysSince(app.interview_completed_at)} of ~
                    {DEFAULT_EXPECTED_DAYS}
                    <input
                      type="date"
                      value={app.interview_completed_at.slice(0, 10)}
                      onChange={(e) =>
                        updateInterviewDate(app.id, e.target.value)
                      }
                      className="bg-transparent text-textDim text-[10px] border border-border rounded px-1 py-0.5 outline-none"
                      title="Edit interview date"
                    />
                  </span>
                )}
                {app.status === "waiting" &&
                  app.interview_completed_at &&
                  daysSince(app.interview_completed_at) >= 7 &&
                  !app.follow_up_sent_at && (
                    <button
                      onClick={() =>
                        setOpenTemplateFor(
                          openTemplateFor === app.id ? null : app.id,
                        )
                      }
                      className="text-xs border rounded px-2.5 py-1"
                      style={{ borderColor: "#D4933D", color: "#D4933D" }}
                    >
                      Follow up
                    </button>
                  )}
                {app.follow_up_sent_at && (
                  <span className="text-[11px] text-textDim">Followed up</span>
                )}
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  style={{
                    color: s.color,
                    background: s.bg,
                    borderColor: `${s.color}55`,
                  }}
                  className="text-xs rounded px-2.5 py-1 border cursor-pointer outline-none"
                >
                  {Object.entries(statusStyle).map(([key, val]) => (
                    <option key={key} value={key} style={{ color: "#000" }}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {openTemplateFor === app.id && (
              <div className="bg-surface2 border border-border rounded p-4 mb-3 mt-1">
                <textarea
                  defaultValue={followUpTemplate(app.company, app.role)}
                  className="w-full bg-transparent text-text text-sm outline-none resize-none"
                  rows={9}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => markFollowUpSent(app.id)}
                    className="bg-accent text-bg text-xs font-semibold rounded px-3 py-1.5"
                  >
                    Mark as sent
                  </button>
                  <button
                    onClick={() => setOpenTemplateFor(null)}
                    className="text-xs text-textDim px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
