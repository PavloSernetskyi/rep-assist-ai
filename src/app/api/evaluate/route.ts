import { enhanceEvaluationWithLlm } from "@/lib/llm/generateSummary";
import {
  getCoverageRule,
  getFullPatientProfile,
} from "@/lib/queries/patients";
import { evaluateByMedication, isSupportedMedicationForRules } from "@/lib/rules/eligibility";
import { NextResponse } from "next/server";

type EvaluateBody = {
  patientId?: string;
  medicationName?: string;
};

/**
 * POST /api/evaluate
 * Body: { "patientId": "<uuid>", "medicationName": "CardioX" }
 *
 * Frontend: `fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, medicationName: "CardioX" }) })`
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: EvaluateBody;
  try {
    body = (await request.json()) as EvaluateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patientId = typeof body.patientId === "string" ? body.patientId.trim() : "";
  const medicationName =
    typeof body.medicationName === "string" ? body.medicationName.trim() : "";

  if (!patientId || !medicationName) {
    return NextResponse.json(
      { error: "patientId and medicationName are required" },
      { status: 400 }
    );
  }

  if (!isSupportedMedicationForRules(medicationName)) {
    return NextResponse.json(
      {
        error:
          "Unsupported medication for demo rules. Use CardioX (case-insensitive).",
      },
      { status: 400 }
    );
  }

  try {
    const profile = await getFullPatientProfile(patientId);
    if (!profile) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const coverage = await getCoverageRule(
      medicationName,
      profile.patient.insuranceType
    );

    const base = evaluateByMedication(
      medicationName,
      profile,
      coverage,
      patientId
    );

    const llmDelta = await enhanceEvaluationWithLlm({
      profile,
      ruleOutput: base,
    });

    const merged = {
      ...base,
      ...(llmDelta.summary ? { summary: llmDelta.summary } : {}),
      ...(llmDelta.talkingPoints ? { talkingPoints: llmDelta.talkingPoints } : {}),
    };

    return NextResponse.json(merged);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.startsWith("Unsupported medication")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
