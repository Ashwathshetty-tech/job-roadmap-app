import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, role, yearsExperience, techStack, location, runwayWeeks, exitReason } = body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: userId,
      role,
      years_experience: yearsExperience,
      tech_stack: techStack,
      location,
      runway_weeks: runwayWeeks,
      exit_reason: exitReason,
    })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}