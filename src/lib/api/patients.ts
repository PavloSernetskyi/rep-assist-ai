import type { Patient, PatientProfileResponse } from "@/lib/types";

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const e = (data as { error?: unknown }).error;
    if (typeof e === "string" && e.length > 0) return e;
  }
  return fallback;
}

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch("/api/patients");
  const data: unknown = await res.json();
  if (!res.ok) throw new Error(errorMessage(data, "Failed to load patients"));
  return data as Patient[];
}

export async function fetchPatientProfile(id: string): Promise<PatientProfileResponse> {
  const res = await fetch(`/api/patients/${encodeURIComponent(id)}`);
  const data: unknown = await res.json();
  if (!res.ok) throw new Error(errorMessage(data, "Failed to load patient"));
  return data as PatientProfileResponse;
}
