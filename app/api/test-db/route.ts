import { supabase } from "@/superbase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connected: true, data });
}