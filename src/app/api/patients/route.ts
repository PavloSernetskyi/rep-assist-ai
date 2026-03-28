import { getAllPatients } from "@/lib/queries/patients";
import { NextResponse } from "next/server";

/**
 * GET /api/patients
 * Frontend: `const r = await fetch("/api/patients"); const list = await r.json();`
 */
export async function GET() {
  try {
    const patients = await getAllPatients();
    return NextResponse.json(patients);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
