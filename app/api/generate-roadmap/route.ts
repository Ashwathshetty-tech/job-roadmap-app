import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";


const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip, "generate-roadmap", 5, 60); // 5 requests per hour per IP

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests from this network. Please try again later." },
      { status: 429 }
    );
  }
  
  const { userId } = await req.json();

  // Fetch the user's intake data server-side (using anon key + their id is fine for a read here,
  // since we're not modifying data — just be sure RLS SELECT policy allows it, which we set up Day 6)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Could not load user intake data" },
      { status: 400 },
    );
  }

  // Enforce a max of 2 roadmap generations per user
  const currentCount = user.roadmap_generation_count || 0;
  if (currentCount >= 2) {
    return NextResponse.json(
      { error: "You've reached the limit of 2 roadmap regenerations." },
      { status: 429 },
    );
  }

  const prompt = `You are a career strategist helping a laid-off IT professional plan their job search.

User profile:
- Role: ${user.role}
- Years of experience: ${user.years_experience}
- Tech stack: ${(user.tech_stack || []).join(", ")}
- Target roles: ${(user.target_roles || []).join(", ") || "not specified"}
- Location / remote preference: ${user.location}
- Runway: ${user.runway_weeks} weeks before financial pressure increases
- Reason for leaving: ${user.exit_reason}

Generate a 4-week roadmap. For each week, include:
1. A one-sentence focus summary
2. 1-3 specific skill-building actions
3. A weekly application target (realistic given their experience level and runway)
4. 1-2 networking actions
5. Interview-prep actions (only from week 2 onward, escalating in specificity)

Tone: direct, practical, encouraging without being saccharine.

Respond with ONLY valid JSON, no other text, in this exact shape:
{
  "weeks": [
    {
      "week_number": 1,
      "focus_summary": "...",
      "skill_actions": ["...", "..."],
      "application_target": 8,
      "networking_actions": ["..."],
      "interview_prep_actions": []
    }
  ]
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { error: "No text response from model" },
      { status: 500 },
    );
  }

  try {
    // Strip markdown code fences if present
    const cleaned = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const roadmap = JSON.parse(cleaned);

    const { error: saveError } = await supabase
      .from("roadmaps")
      .upsert(
        { user_id: userId, weeks: roadmap.weeks },
        { onConflict: "user_id" },
      );

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    // Increment the generation count
    await supabase
      .from("users")
      .update({ roadmap_generation_count: currentCount + 1 })
      .eq("id", userId);

    return NextResponse.json({ roadmap });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse roadmap JSON", raw: textBlock.text },
      { status: 500 },
    );
  }
}
