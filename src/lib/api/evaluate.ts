import type { EvaluationResponse } from "@/lib/types";

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const e = (data as { error?: unknown }).error;
    if (typeof e === "string" && e.length > 0) return e;
  }
  return fallback;
}

export async function postEvaluate(
  patientId: string,
  medicationName: string
): Promise<EvaluationResponse> {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, medicationName }),
  });
  const data: unknown = await res.json();
  if (!res.ok) throw new Error(errorMessage(data, "Evaluation failed"));
  return data as EvaluationResponse;
}
