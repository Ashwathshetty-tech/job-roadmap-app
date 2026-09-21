import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(ip, "generate-roadmap", 5, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests from this network. Please try again later." },
      { status: 429 },
    );
  }

  const { userId } = await req.json();

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

  const currentCount = user.roadmap_generation_count || 0;
  if (currentCount >= 2) {
    return NextResponse.json(
      { error: "You've reached the limit of 2 roadmap regenerations." },
      { status: 429 },
    );
  }

  // I want to stop generating Roadmap temporarity and just show prompt contact details to connect with to generateb road map
  return NextResponse.json(
    { error: "Roadmap generation is temporarily unavailable. Please contact support to generate a new roadmap." },
    { status: 503 },
  );

//   const prompt = `You are a career strategist helping a laid-off IT professional plan their job search.

// User profile:
// - Role: ${user.role}
// - Years of experience: ${user.years_experience}
// - Tech stack: ${(user.tech_stack || []).join(", ")}
// - Target roles: ${(user.target_roles || []).join(", ") || "not specified"}
// - Location / remote preference: ${user.location}
// - Runway: ${user.runway_weeks} weeks before financial pressure increases
// - Reason for leaving: ${user.exit_reason}

// Generate a 4-week roadmap. For each week, include:
// 1. A one-sentence focus summary
// 2. 1-3 specific skill-building actions
// 3. A weekly application target (realistic given their experience level and runway)
// 4. 1-2 networking actions
// 5. Interview-prep actions (only from week 2 onward, escalating in specificity)

// Tone: direct, practical, encouraging without being saccharine.

// Respond with ONLY valid JSON, no other text. Do not wrap the JSON in markdown
// code blocks or backticks. Output raw JSON only, in this exact shape:
// {
//   "weeks": [
//     {
//       "week_number": 1,
//       "focus_summary": "...",
//       "skill_actions": ["...", "..."],
//       "application_target": 8,
//       "networking_actions": ["..."],
//       "interview_prep_actions": []
//     }
//   ]
// }`;

//   const encoder = new TextEncoder();
//   let fullText = "";

//   const stream = new ReadableStream({
//     async start(controller) {
//       try {
//         const anthropicStream = anthropic.messages.stream({
//           model: "claude-sonnet-4-6",
//           max_tokens: 2000,
//           messages: [{ role: "user", content: prompt }],
//         });

//         anthropicStream.on("text", (delta) => {
//           fullText += delta;
//           controller.enqueue(encoder.encode(delta));
//         });

//         anthropicStream.on("end", async () => {
//           try {
//             const cleaned = fullText
//               .replace(/^```json\s*/i, "")
//               .replace(/^```\s*/i, "")
//               .replace(/```\s*$/i, "")
//               .trim();

//             const roadmap = JSON.parse(cleaned);

//             const { error: saveError } = await supabase
//               .from("roadmaps")
//               .upsert(
//                 { user_id: userId, weeks: roadmap.weeks },
//                 { onConflict: "user_id" },
//               );

//             if (saveError) {
//               console.error("Failed to save roadmap:", saveError);
//               controller.enqueue(encoder.encode("\n[[ERROR:SAVE_FAILED]]"));
//             } else {
//               await supabase
//                 .from("users")
//                 .update({ roadmap_generation_count: currentCount + 1 })
//                 .eq("id", userId);
//               controller.enqueue(encoder.encode("\n[[DONE]]"));
//             }
//           } catch (parseErr) {
//             console.error(
//               "Failed to parse streamed roadmap:",
//               parseErr,
//               fullText,
//             );
//             controller.enqueue(encoder.encode("\n[[ERROR:PARSE_FAILED]]"));
//           }
//           controller.close();
//         });

//         anthropicStream.on("error", (err) => {
//           console.error("Anthropic stream error:", err);
//           controller.enqueue(encoder.encode("\n[[ERROR:STREAM_FAILED]]"));
//           controller.close();
//         });
//       } catch (err) {
//         console.error("Failed to start stream:", err);
//         controller.enqueue(encoder.encode("\n[[ERROR:STREAM_FAILED]]"));
//         controller.close();
//       }
//     },
//   });

//   return new Response(stream, {
//     headers: {
//       "Content-Type": "text/plain; charset=utf-8",
//       "Cache-Control": "no-cache",
//     },
//   });
}
