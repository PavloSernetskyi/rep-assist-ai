/** Shared types for API responses (camelCase for frontend). */

export interface Patient {
  id: string;
  fullName: string;
  age: number | null;
  gender: string | null;
  insuranceType: string;
  createdAt: string;
}

export interface DiseaseHistory {
  id: string;
  patientId: string;
  icd10Code: string;
  diagnosisName: string;
  status: string | null;
  notes: string | null;
  createdAt: string;
}

export interface MedicationHistory {
  id: string;
  patientId: string;
  medicationName: string;
  medicationType: string | null;
  status: "current" | "prior" | "failed" | string;
  reasonStopped: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TestResult {
  id: string;
  patientId: string;
  testType: string;
  testName: string;
  resultValue: string | null;
  interpretation: string | null;
  testDate: string | null;
  createdAt: string;
}

export interface CoverageRule {
  id: string;
  medicationName: string;
  insuranceType: string;
  priorAuthRequired: boolean;
  estimatedMonthlyCost: string;
  voucherAvailable: boolean;
  notes: string | null;
  createdAt: string;
}

export interface PatientProfileResponse {
  patient: Patient;
  diseaseHistory: DiseaseHistory[];
  medicationHistory: MedicationHistory[];
  testResults: TestResult[];
}

export type EligibilityLabel = "Likely eligible" | "Maybe eligible" | "Poor fit";

export type PriorAuthLikelihood = "High" | "Moderate" | "Low";

export interface EvaluationResponse {
  eligibility: EligibilityLabel;
  priorAuthRequired: boolean;
  priorAuthLikelihood: PriorAuthLikelihood;
  estimatedMonthlyCost: string;
  voucherAvailable: boolean;
  summary: string;
  talkingPoints: string[];
  /** Echo inputs + rule metadata for debugging / future LLM prompts */
  meta: {
    patientId: string;
    medicationName: string;
    coverageRuleMatched: boolean;
  };
}
