import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase";

export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("asignaturas").select("id,nombre").order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const nombre = String(body?.nombre || "").trim();
  if (!nombre) return NextResponse.json({ error: "nombre requerido" }, { status: 400 });
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("asignaturas").upsert({ nombre }, { onConflict: "nombre" }).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? null);
}