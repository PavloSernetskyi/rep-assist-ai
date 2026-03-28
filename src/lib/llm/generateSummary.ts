import type { EvaluationResponse, PatientProfileResponse } from "@/lib/types";

/**
 * Future: InsForge model gateway / OpenAI / Gemini
 *
 * Pass `PatientProfileResponse` + rule output JSON and ask the model to:
 * - tighten the rep-facing summary (no new clinical facts)
 * - rewrite talking points for tone
 * - add a short doctor-facing paragraph
 *
 * Contract: model must NOT invent diagnoses, labs, or coverage facts—only rephrase
 * what the structured payload already states.
 */
export async function enhanceEvaluationWithLlm(_input: {
  profile: PatientProfileResponse;
  ruleOutput: EvaluationResponse;
}): Promise<Partial<Pick<EvaluationResponse, "summary" | "talkingPoints">>> {
  void _input;
  // Intentionally returns nothing until API keys + gateway wiring exist.
  return {};
}
