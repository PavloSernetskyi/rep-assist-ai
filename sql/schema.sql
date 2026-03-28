-- rep-assist-ai MVP schema (Postgres / InsForge-compatible)
-- Run this in InsForge SQL editor or: psql $DATABASE_URL -f sql/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  insurance_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disease_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  icd10_code TEXT NOT NULL,
  diagnosis_name TEXT NOT NULL,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  medication_type TEXT,
  status TEXT NOT NULL,
  reason_stopped TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  result_value TEXT,
  interpretation TEXT,
  test_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coverage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  prior_auth_required BOOLEAN NOT NULL DEFAULT false,
  estimated_monthly_cost TEXT NOT NULL,
  voucher_available BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (medication_name, insurance_type)
);

CREATE INDEX IF NOT EXISTS idx_disease_history_patient ON disease_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_history_patient ON medication_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_test_results_patient ON test_results (patient_id);
CREATE INDEX IF NOT EXISTS idx_coverage_rules_lookup ON coverage_rules (medication_name, insurance_type);
