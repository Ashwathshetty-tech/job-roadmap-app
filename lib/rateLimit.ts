import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkRateLimit(
  ip: string,
  route: string,
  maxRequests: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("route", route)
    .gte("requested_at", windowStart);

  const currentCount = count || 0;

  if (currentCount >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  await supabase.from("rate_limit_log").insert({ ip_address: ip, route });

  return { allowed: true, remaining: maxRequests - currentCount - 1 };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}