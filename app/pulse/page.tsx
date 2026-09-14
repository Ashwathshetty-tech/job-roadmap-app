import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Tech Job Market Pulse — Live Hiring Data | Forward",
  description:
    "Live, weekly-updated job posting counts across backend, frontend, DevOps, QA, and full-stack engineering roles.",
};

// Revalidate this page's data at most once per hour so we're not hammering the
// upstream API on every visit, while still staying reasonably current.
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

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
        <Link href="/" className="font-serif text-xl font-semibold text-text tracking-tight">
          Forward
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accentStrong"
        >
          Get your own roadmap <ArrowRight size={14} />
        </Link>
      </div>

      <div className="max-w-3xl mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-text mb-3">
          Tech Job Market Pulse
        </h1>
        <p className="text-textDim text-sm sm:text-base max-w-xl">
          Live remote job posting counts across common engineering roles, updated hourly.
          If you're job-searching right now, this is a real snapshot of what's actually
          hiring — not guesswork.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.role} className="bg-surface border border-border rounded-md p-5">
            <div className="text-sm text-textDim mb-3">{s.role}</div>
            <div className="text-3xl font-serif text-text mb-1">{s.postedThisWeek}</div>
            <div className="text-xs text-textDim mb-4">posted this week</div>
            <div className="text-xs text-textDim border-t border-border pt-3">
              <span className="text-accent font-mono">{s.totalOpenPostings}</span> total open roles (remote)
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface2 border border-border rounded-md p-6 max-w-xl">
        <div className="font-serif text-lg text-text mb-2">
          Want a plan built around this data?
        </div>
        <p className="text-sm text-textDim mb-4">
          Forward turns numbers like these into a personalized, week-by-week roadmap based
          on your actual experience and stack — free to try.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-accent text-bg text-sm font-semibold rounded px-4 py-2"
        >
          Build my roadmap <ArrowRight size={14} />
        </Link>
      </div>

      <p className="text-xs text-textDim mt-8">
        Data sourced from Remotive's public remote job listings. Figures reflect remote
        postings only and are a directional signal, not a complete market count.
      </p>
    </div>
  );
}
