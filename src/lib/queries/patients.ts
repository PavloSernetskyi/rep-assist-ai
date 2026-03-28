import { query } from "@/lib/db";
import type {
  CoverageRule,
  DiseaseHistory,
  MedicationHistory,
  Patient,
  PatientProfileResponse,
  TestResult,
} from "@/lib/types";

interface PatientRow {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  insurance_type: string;
  created_at: Date;
}

interface DiseaseRow {
  id: string;
  patient_id: string;
  icd10_code: string;
  diagnosis_name: string;
  status: string | null;
  notes: string | null;
  created_at: Date;
}

interface MedRow {
  id: string;
  patient_id: string;
  medication_name: string;
  medication_type: string | null;
  status: string;
  reason_stopped: string | null;
  notes: string | null;
  created_at: Date;
}

interface TestRow {
  id: string;
  patient_id: string;
  test_type: string;
  test_name: string;
  result_value: string | null;
  interpretation: string | null;
  test_date: Date | null;
  created_at: Date;
}

interface CoverageRow {
  id: string;
  medication_name: string;
  insurance_type: string;
  prior_auth_required: boolean;
  estimated_monthly_cost: string;
  voucher_available: boolean;
  notes: string | null;
  created_at: Date;
}

function iso(d: Date): string {
  return d.toISOString();
}

function dateOnly(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function mapPatient(r: PatientRow): Patient {
  return {
    id: r.id,
    fullName: r.full_name,
    age: r.age,
    gender: r.gender,
    insuranceType: r.insurance_type,
    createdAt: iso(r.created_at),
  };
}

function mapDisease(r: DiseaseRow): DiseaseHistory {
  return {
    id: r.id,
    patientId: r.patient_id,
    icd10Code: r.icd10_code,
    diagnosisName: r.diagnosis_name,
    status: r.status,
    notes: r.notes,
    createdAt: iso(r.created_at),
  };
}

function mapMed(r: MedRow): MedicationHistory {
  return {
    id: r.id,
    patientId: r.patient_id,
    medicationName: r.medication_name,
    medicationType: r.medication_type,
    status: r.status,
    reasonStopped: r.reason_stopped,
    notes: r.notes,
    createdAt: iso(r.created_at),
  };
}

function mapTest(r: TestRow): TestResult {
  return {
    id: r.id,
    patientId: r.patient_id,
    testType: r.test_type,
    testName: r.test_name,
    resultValue: r.result_value,
    interpretation: r.interpretation,
    testDate: dateOnly(r.test_date),
    createdAt: iso(r.created_at),
  };
}

export function mapCoverageRule(r: CoverageRow): CoverageRule {
  return {
    id: r.id,
    medicationName: r.medication_name,
    insuranceType: r.insurance_type,
    priorAuthRequired: r.prior_auth_required,
    estimatedMonthlyCost: r.estimated_monthly_cost,
    voucherAvailable: r.voucher_available,
    notes: r.notes,
    createdAt: iso(r.created_at),
  };
}

export async function getAllPatients(): Promise<Patient[]> {
  const rows = await query<PatientRow>(
    `SELECT id, full_name, age, gender, insurance_type, created_at
     FROM patients
     ORDER BY full_name ASC`
  );
  return rows.map(mapPatient);
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const rows = await query<PatientRow>(
    `SELECT id, full_name, age, gender, insurance_type, created_at
     FROM patients
     WHERE id = $1`,
    [id]
  );
  return rows[0] ? mapPatient(rows[0]) : null;
}

export async function getPatientDiseaseHistory(
  patientId: string
): Promise<DiseaseHistory[]> {
  const rows = await query<DiseaseRow>(
    `SELECT id, patient_id, icd10_code, diagnosis_name, status, notes, created_at
     FROM disease_history
     WHERE patient_id = $1
     ORDER BY icd10_code ASC`,
    [patientId]
  );
  return rows.map(mapDisease);
}

export async function getPatientMedicationHistory(
  patientId: string
): Promise<MedicationHistory[]> {
  const rows = await query<MedRow>(
    `SELECT id, patient_id, medication_name, medication_type, status, reason_stopped, notes, created_at
     FROM medication_history
     WHERE patient_id = $1
     ORDER BY medication_name ASC`,
    [patientId]
  );
  return rows.map(mapMed);
}

export async function getPatientTestResults(
  patientId: string
): Promise<TestResult[]> {
  const rows = await query<TestRow>(
    `SELECT id, patient_id, test_type, test_name, result_value, interpretation, test_date, created_at
     FROM test_results
     WHERE patient_id = $1
     ORDER BY test_date DESC NULLS LAST, test_name ASC`,
    [patientId]
  );
  return rows.map(mapTest);
}

export async function getFullPatientProfile(
  patientId: string
): Promise<PatientProfileResponse | null> {
  const patient = await getPatientById(patientId);
  if (!patient) return null;
  const [diseaseHistory, medicationHistory, testResults] = await Promise.all([
    getPatientDiseaseHistory(patientId),
    getPatientMedicationHistory(patientId),
    getPatientTestResults(patientId),
  ]);
  return { patient, diseaseHistory, medicationHistory, testResults };
}

export async function getCoverageRule(
  medicationName: string,
  insuranceType: string
): Promise<CoverageRule | null> {
  const rows = await query<CoverageRow>(
    `SELECT id, medication_name, insurance_type, prior_auth_required, estimated_monthly_cost, voucher_available, notes, created_at
     FROM coverage_rules
     WHERE lower(medication_name) = lower($1) AND insurance_type = $2`,
    [medicationName, insuranceType]
  );
  return rows[0] ? mapCoverageRule(rows[0]) : null;
}
