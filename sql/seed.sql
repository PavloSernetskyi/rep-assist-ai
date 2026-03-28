-- Demo seed: CardioX + 3 patients (Sarah / Michael / Linda)
-- Re-run safe: truncates demo tables then inserts.

BEGIN;

TRUNCATE TABLE test_results, medication_history, disease_history, patients CASCADE;

DELETE FROM coverage_rules WHERE medication_name = 'CardioX';

INSERT INTO patients (id, full_name, age, gender, insurance_type) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Sarah Chen', 58, 'F', 'Commercial PPO'),
  ('11111111-1111-1111-1111-111111111102', 'Michael Torres', 62, 'M', 'HMO'),
  ('11111111-1111-1111-1111-111111111103', 'Linda Brooks', 55, 'F', 'Medicare Advantage');

INSERT INTO disease_history (patient_id, icd10_code, diagnosis_name, status, notes) VALUES
  ('11111111-1111-1111-1111-111111111101', 'I10', 'Essential (primary) hypertension', 'active', 'Well controlled on ACE'),
  ('11111111-1111-1111-1111-111111111101', 'E11.9', 'Type 2 diabetes mellitus without complications', 'active', 'A1C above goal last visit'),
  ('11111111-1111-1111-1111-111111111102', 'I10', 'Essential (primary) hypertension', 'active', NULL),
  ('11111111-1111-1111-1111-111111111103', 'Z00.00', 'Encounter for general adult medical examination without abnormal findings', 'active', 'Annual wellness; no cardio-metabolic dx documented');

INSERT INTO medication_history (patient_id, medication_name, medication_type, status, reason_stopped, notes) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Metformin', 'oral hypoglycemic', 'current', NULL, '500 mg BID'),
  ('11111111-1111-1111-1111-111111111101', 'Lisinopril', 'ACE inhibitor', 'current', NULL, '10 mg daily'),
  ('11111111-1111-1111-1111-111111111101', 'StatinA', 'statin', 'failed', 'myalgia', 'Discontinued after 6 weeks'),
  ('11111111-1111-1111-1111-111111111102', 'Losartan', 'ARB', 'current', NULL, '50 mg daily'),
  ('11111111-1111-1111-1111-111111111103', 'Vitamin D', 'supplement', 'current', NULL, NULL);

INSERT INTO test_results (patient_id, test_type, test_name, result_value, interpretation, test_date) VALUES
  ('11111111-1111-1111-1111-111111111101', 'bloodwork', 'LDL-C', '142 mg/dL', 'Elevated LDL-C; above goal for ASCVD risk', '2026-01-15'),
  ('11111111-1111-1111-1111-111111111101', 'bloodwork', 'HbA1c', '7.6%', 'Above recommended target for T2DM', '2026-01-15'),
  ('11111111-1111-1111-1111-111111111102', 'bloodwork', 'LDL-C', '118 mg/dL', 'Mild LDL elevation', '2026-02-01'),
  ('11111111-1111-1111-1111-111111111103', 'bloodwork', 'Lipid panel', 'See report', 'Within normal limits', '2026-01-20'),
  ('11111111-1111-1111-1111-111111111103', 'ct', 'Coronary CTA', 'No stenosis', 'Low burden; incidental finding', '2025-11-10');

INSERT INTO coverage_rules (medication_name, insurance_type, prior_auth_required, estimated_monthly_cost, voucher_available, notes) VALUES
  ('CardioX', 'Commercial PPO', true, '$25–$50 after voucher', true, 'PA common for specialty tier; copay card often applies'),
  ('CardioX', 'HMO', true, '$80–$120 estimated', false, 'PA likely; limited voucher eligibility on this plan type'),
  ('CardioX', 'Medicare Advantage', true, '$150+ estimated', false, 'PA may be difficult; affordability support limited for demo');

COMMIT;
