import type {
  CoverageRule,
  EligibilityLabel,
  EvaluationResponse,
  PatientProfileResponse,
  PriorAuthLikelihood,
} from "@/lib/types";

function normalizeMedName(name: string): string {
  return name.trim();
}

/** True if ICD-10 suggests hypertension or type 2 diabetes (demo heuristic). */
function hasRelevantDiagnosis(profile: PatientProfileResponse): boolean {
  return profile.diseaseHistory.some((d) => {
    const c = d.icd10Code.toUpperCase();
    return c.startsWith("I10") || c.startsWith("E11");
  });
}

/** Strong lipid / ASCVD risk signal from labs (not “within normal”). */
function hasStrongLipidSignal(profile: PatientProfileResponse): boolean {
  return profile.testResults.some((t) => {
    if (t.testType.toLowerCase() !== "bloodwork") return false;
    const text = `${t.testName} ${t.interpretation ?? ""} ${t.resultValue ?? ""}`.toLowerCase();
    if (text.includes("within normal") || text.includes("normal limits")) return false;
    if (text.includes("mild") && !text.includes("above goal")) return false;
    return (
      text.includes("ldl") &&
      (text.includes("elevated") ||
        text.includes("above goal") ||
        text.includes("high") ||
        text.includes("severely"))
    );
  });
}

function hasFailedPriorTherapy(profile: PatientProfileResponse): boolean {
  return profile.medicationHistory.some(
    (m) => m.status.toLowerCase() === "failed"
  );
}

function eligibilityLabel(profile: PatientProfileResponse): EligibilityLabel {
  const dx = hasRelevantDiagnosis(profile);
  const strong = hasStrongLipidSignal(profile);
  const failed = hasFailedPriorTherapy(profile);
  if (!dx) return "Poor fit";
  if (strong || failed) return "Likely eligible";
  return "Maybe eligible";
}

function computePriorAuthLikelihood(
  insuranceType: string,
  rule: CoverageRule | null
): PriorAuthLikelihood {
  if (!rule?.priorAuthRequired) return "Low";
  const t = insuranceType.toLowerCase();
  if (t.includes("ppo") || t.includes("commercial")) return "High";
  if (t.includes("hmo")) return "Moderate";
  if (t.includes("medicare")) return "Low";
  return "Moderate";
}

function buildSummary(
  eligibility: EligibilityLabel,
  profile: PatientProfileResponse
): string {
  const dx = profile.diseaseHistory.map((d) => d.diagnosisName).join("; ");
  const labs = profile.testResults
    .filter((t) => t.testType.toLowerCase() === "bloodwork")
    .map((t) => `${t.testName}: ${t.interpretation ?? t.resultValue ?? "n/a"}`)
    .join("; ");
  const failed = profile.medicationHistory.filter(
    (m) => m.status.toLowerCase() === "failed"
  );
  const failedText = failed.length
    ? ` Prior therapy issues: ${failed.map((m) => `${m.medicationName} (${m.reasonStopped ?? "stopped"})`).join(", ")}.`
    : "";

  if (eligibility === "Likely eligible") {
    return `Demo rules: patient shows relevant cardio-metabolic history (${dx || "see chart"}). Key labs include ${labs || "limited bloodwork in feed"}.${failedText} Profile aligns with a strong CardioX conversation for the rep brief.`;
  }
  if (eligibility === "Maybe eligible") {
    return `Demo rules: patient has some relevant history (${dx || "see chart"}) but lacks a strong lipid escalation or prior failure signal in the structured feed (${labs || "limited bloodwork"}).${failedText} Useful as a “discuss with prescriber” scenario.`;
  }
  return `Demo rules: limited on-label cardio-metabolic diagnosis match in structured data (${dx || "none coded"}). Labs/meds suggest this is a weaker CardioX fit for the scripted demo unless chart updates.`;
}

function buildTalkingPoints(
  eligibility: EligibilityLabel,
  rule: CoverageRule | null,
  profile: PatientProfileResponse
): string[] {
  const pts: string[] = [];
  if (eligibility === "Likely eligible") {
    pts.push("Structured data suggests indicated population overlap—use as a starter, not a diagnosis.");
    if (hasFailedPriorTherapy(profile)) {
      pts.push("Documented prior intolerance/failure may support a switch narrative where clinically appropriate.");
    }
    pts.push("Highlight ASCVD risk discussion framing; keep to label and local protocol language.");
  } else if (eligibility === "Maybe eligible") {
    pts.push("Partial overlap with demo criteria—good script for ‘explore clinical rationale’ rather than pushing certainty.");
    pts.push("Ask whether LDL remains above goal on current therapy after lifestyle measures.");
  } else {
    pts.push("Weak match on demo ICD-10/lab feed—practice pivoting to general education or leave-behind.");
    pts.push("Avoid implying eligibility; position as hypothetical if the chart changes.");
  }
  if (rule?.priorAuthRequired) {
    pts.push("Plan mentions prior authorization early—commercial workflows often need documentation.");
  } else {
    pts.push("PA may still apply depending on payer; confirm with benefits for this patient.");
  }
  if (rule?.voucherAvailable) {
    pts.push("Copay/voucher programs may reduce OOP if eligible—verify on program rules.");
  } else {
    pts.push("Affordability support may be limited on this plan type in the demo dataset.");
  }
  return pts;
}

/**
 * Deterministic CardioX demo evaluation. Replace or extend per medication later.
 */
export function evaluateCardioX(
  profile: PatientProfileResponse,
  coverage: CoverageRule | null,
  patientId: string,
  medicationName: string
): EvaluationResponse {
  const eligibility = eligibilityLabel(profile);
  const priorAuthRequired = coverage?.priorAuthRequired ?? true;
  const priorAuthLikelihood = computePriorAuthLikelihood(
    profile.patient.insuranceType,
    coverage
  );

  return {
    eligibility,
    priorAuthRequired,
    priorAuthLikelihood,
    estimatedMonthlyCost:
      coverage?.estimatedMonthlyCost ?? "Unknown — add coverage_rules row",
    voucherAvailable: coverage?.voucherAvailable ?? false,
    summary: buildSummary(eligibility, profile),
    talkingPoints: buildTalkingPoints(eligibility, coverage, profile),
    meta: {
      patientId,
      medicationName,
      coverageRuleMatched: coverage !== null,
    },
  };
}

export function isSupportedMedicationForRules(medicationName: string): boolean {
  return normalizeMedName(medicationName).toLowerCase() === "cardiox";
}

export function evaluateByMedication(
  medicationName: string,
  profile: PatientProfileResponse,
  coverage: CoverageRule | null,
  patientId: string
): EvaluationResponse {
  const normalized = normalizeMedName(medicationName);
  if (normalized.toLowerCase() !== "cardiox") {
    throw new Error(`Unsupported medication for demo rules: ${medicationName}`);
  }
  return evaluateCardioX(profile, coverage, patientId, normalized);
}
