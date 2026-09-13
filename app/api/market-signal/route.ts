import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "backend engineer";

  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}`
    );
    const data = await res.json();

    // Only count postings from the last 7 days
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentJobs = (data.jobs || []).filter(
      (job: any) => new Date(job.publication_date).getTime() > oneWeekAgo
    );

    return NextResponse.json({
      search,
      totalOpenPostings: data.jobs?.length || 0,
      postedThisWeek: recentJobs.length,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch market signal" }, { status: 500 });
  }
}