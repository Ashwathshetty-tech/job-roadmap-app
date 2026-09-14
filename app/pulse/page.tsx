import Link from "next/link";

export const metadata = {
  title: "Tech Job Market Pulse — Live Hiring Data | Forward",
  description:
    "Live, weekly-updated job posting counts across backend, frontend, DevOps, QA, and full-stack engineering roles.",
};

export const revalidate = 3600;

const ROLES = [
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Data Engineer",
];

type RoleStat = {
  role: string;
  totalOpenPostings: number;
  postedThisWeek: number;
};

async function fetchRoleStat(role: string): Promise<RoleStat> {
  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role)}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const jobs = data.jobs || [];
    const postedThisWeek = jobs.filter(
      (job: any) => new Date(job.publication_date).getTime() > oneWeekAgo
    ).length;
    return { role, totalOpenPostings: jobs.length, postedThisWeek };
  } catch {
    return { role, totalOpenPostings: 0, postedThisWeek: 0 };
  }
}

export default async function MarketPulsePage() {
  const stats = await Promise.all(ROLES.map(fetchRoleStat));
  const totalThisWeek = stats.reduce((sum, s) => sum + s.postedThisWeek, 0);
  const asOf = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-border">
        <Link href="/" className="font-serif text-xl font-semibold text-text tracking-tight">
          Forward
        </Link>
        <Link href="/" className="text-sm text-accentStrong hover:text-text">
          Build my roadmap
        </Link>
      </div>

      {/* Hero readout — the one bold, glowing element on the page */}
      <div className="relative border-t-2 mb-14" style={{ borderTopColor: "#E8A339" }}>
        <div
          className="pt-8 pb-2"
          style={{
            boxShadow: "0 -12px 40px -12px rgba(232,163,57,0.25)",
          }}
        >
          <div className="font-mono text-xs text-textDim mb-3 flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#E8A339" }}
            />
            LIVE READOUT · updated {asOf}
          </div>
          <div className="font-mono text-6xl sm:text-7xl" style={{ color: "#E8A339" }}>
            {totalThisWeek}
          </div>
          <div className="text-text text-base sm:text-lg mt-2 max-w-md">
            engineering roles posted this week, across the six functions below.
          </div>
        </div>
      </div>

      <div className="max-w-2xl mb-12">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text mb-3 leading-snug">
          This is a real signal, not a guess — the same data your roadmap is built on.
        </h1>
        <p className="text-textDim text-sm sm:text-base">
          If you're searching right now, use this as a compass, not a scoreboard. Slow
          weeks happen. What matters is the trend, not any single number.
        </p>
      </div>

      {/* Readout panels: sharp corners, mono data, amber top edge — the "instrument" treatment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px mb-16 bg-border">
        {stats.map((s) => (
          <div key={s.role} className="bg-bg p-6">
            <div className="text-sm text-text mb-4">{s.role}</div>
            <div className="font-mono text-3xl mb-1" style={{ color: "#E8A339" }}>
              {s.postedThisWeek}
            </div>
            <div className="font-mono text-[11px] text-textDim mb-4">this week</div>
            <div className="font-mono text-[11px] text-textDim pt-3 border-t border-border">
              {s.totalOpenPostings} open total
            </div>
          </div>
        ))}
      </div>

      {/* Quiet content panel — soft, no glow, deliberately calm next to the readouts above */}
      <div className="bg-surface border border-border rounded-md p-7 max-w-xl">
        <div className="font-serif text-xl text-text mb-2">
          Turn this into a plan built for you
        </div>
        <p className="text-sm text-textDim mb-5">
          Forward reads data like this alongside your actual experience and builds a
          week-by-week roadmap — not generic advice. Free to try.
        </p>
        <Link
          href="/"
          className="inline-block bg-accent text-bg text-sm font-semibold rounded px-5 py-2.5"
        >
          Build my roadmap
        </Link>
      </div>

      <p className="font-mono text-[11px] text-textDim mt-10">
        Source: Remotive public listings. Remote postings only — a directional signal,
        not a complete market count.
      </p>
    </div>
  );
}
