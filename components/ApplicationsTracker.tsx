"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
};

const statusStyle: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "#9AA4AC", bg: "transparent" },
  interviewing: { label: "Interviewing", color: "#4FA8A0", bg: "rgba(79,168,160,0.12)" },
  waiting: { label: "Waiting", color: "#D4933D", bg: "rgba(212,147,61,0.12)" },
  offer: { label: "Offer", color: "#7FBF8F", bg: "rgba(127,191,143,0.12)" },
  rejected: { label: "Rejected", color: "#C97066", bg: "rgba(201,112,102,0.1)" },
  ghosted: { label: "Ghosted", color: "#9AA4AC", bg: "transparent" },
};

export default function ApplicationsTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);

    const { data } = await supabase
      .from("applications")
      .select("id, company, role, status")
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

  if (loading) return <p className="text-textDim text-sm">Loading applications...</p>;

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
          <div
            key={app.id}
            className="flex items-center justify-between py-3.5 border-b border-border"
          >
            <div>
              <div className="text-sm text-text">{app.company}</div>
              <div className="text-xs text-textDim mt-0.5">{app.role}</div>
            </div>
            <span
              style={{ color: s.color, background: s.bg, borderColor: `${s.color}33` }}
              className="text-xs rounded px-2.5 py-1 border"
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}