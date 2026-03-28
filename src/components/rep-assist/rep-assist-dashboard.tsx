"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { postEvaluate } from "@/lib/api/evaluate";
import { fetchPatientProfile, fetchPatients } from "@/lib/api/patients";
import type { EvaluationResponse, Patient, PatientProfileResponse } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { SoftNotice } from "@/components/ui/soft-notice";

import { EvaluateForm } from "./evaluate-form";
import { EvaluationBriefSkeleton, EvaluationResultCards } from "./evaluation-result-cards";
import {
  PatientDetailPanel,
  PatientDetailPanelSkeleton,
} from "./patient-detail-panel";
import { PatientPicker } from "./patient-picker";

const DEFAULT_MED = "CardioX";

export function RepAssistDashboard() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [medicationName, setMedicationName] = useState(DEFAULT_MED);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const profileRequestSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchPatients()
      .then((list) => {
        if (!cancelled) setPatients(list);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setPatientsError(e instanceof Error ? e.message : "Failed to load patients");
      })
      .finally(() => {
        if (!cancelled) setPatientsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPatient = useCallback((id: string) => {
    const seq = ++profileRequestSeq.current;
    setSelectedId(id);
    setEvalError(null);
    setProfileLoading(true);
    setProfileError(null);

    fetchPatientProfile(id)
      .then((data) => {
        if (profileRequestSeq.current !== seq) return;
        setProfile(data);
      })
      .catch((e: unknown) => {
        if (profileRequestSeq.current !== seq) return;
        setProfileError(e instanceof Error ? e.message : "Failed to load patient");
        setProfile(null);
      })
      .finally(() => {
        if (profileRequestSeq.current !== seq) return;
        setProfileLoading(false);
      });
  }, []);

  const profileOutOfSync =
    !!selectedId && !!profile && profile.patient.id !== selectedId;
  const showProfileSkeleton = !!selectedId && (profileLoading || profileOutOfSync);

  const evaluationForPatient = useMemo(() => {
    if (!evaluation || !selectedId) return null;
    return evaluation.meta.patientId === selectedId ? evaluation : null;
  }, [evaluation, selectedId]);

  const handleEvaluate = useCallback(() => {
    if (!selectedId) return;
    const med = medicationName.trim();
    if (!med) {
      setEvalError("Enter a medication name.");
      return;
    }

    setEvalLoading(true);
    setEvalError(null);

    postEvaluate(selectedId, med)
      .then((data) => setEvaluation(data))
      .catch((e: unknown) =>
        setEvalError(e instanceof Error ? e.message : "Evaluation failed")
      )
      .finally(() => setEvalLoading(false));
  }, [selectedId, medicationName]);

  const profileReady =
    !!selectedId &&
    !!profile &&
    !profileLoading &&
    !profileError &&
    !profileOutOfSync;

  const profileBlocked = !!selectedId && (!!profileLoading || !!profileError);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(260px,320px)_1fr] lg:items-start lg:gap-8">
      <aside className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:min-h-[320px]">
        <PatientPicker
          patients={patients}
          loading={patientsLoading}
          error={patientsError}
          selectedId={selectedId}
          onSelect={handleSelectPatient}
        />
        <EvaluateForm
          medicationName={medicationName}
          onMedicationChange={setMedicationName}
          onSubmit={handleEvaluate}
          disabled={profileBlocked || !profileReady}
          loading={evalLoading}
          error={evalError}
          patientSelected={profileReady}
        />
      </aside>

      <main className="flex min-w-0 flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        {!selectedId && (
          <EmptyState
            title="Select a patient"
            description="Use the list on the left to load a demo record. Clinical context appears here when ready."
          />
        )}

        {selectedId && showProfileSkeleton && <PatientDetailPanelSkeleton />}

        {selectedId && !showProfileSkeleton && profileError && (
          <SoftNotice>{profileError}</SoftNotice>
        )}

        {selectedId && !showProfileSkeleton && !profileError && profile && (
          <>
            <PatientDetailPanel profile={profile} />
            {evaluationForPatient && !evalLoading && (
              <div className="border-t border-slate-200 pt-6">
                <EvaluationResultCards result={evaluationForPatient} />
              </div>
            )}
            {evalLoading && (
              <div className="border-t border-slate-200/90 pt-6">
                <EvaluationBriefSkeleton />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
