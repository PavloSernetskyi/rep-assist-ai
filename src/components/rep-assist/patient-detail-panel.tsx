import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { PatientProfileResponse } from "@/lib/types";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="border-t border-slate-100" role="presentation" />;
}

export function PatientDetailPanelSkeleton() {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading patient record">
      <p className="text-xs font-medium text-slate-400">Loading patient record…</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-[55%] max-w-xs" />
        <Skeleton className="mt-4 h-4 w-[35%] max-w-[200px]" />
        <Divider />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Single summary card: demographics plus diagnoses, medications, and labs.
 * Data comes from GET /api/patients/:id (PatientProfileResponse).
 */
export function PatientDetailPanel({ profile }: { profile: PatientProfileResponse }) {
  const { patient, diseaseHistory, medicationHistory, testResults } = profile;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="border-b border-slate-100/90 bg-gradient-to-b from-slate-50/50 to-white px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-teal-800/90">
          Patient summary
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
          {patient.fullName}
        </h2>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500">Insurance</dt>
            <dd className="mt-0.5 text-slate-800">{patient.insuranceType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Age</dt>
            <dd className="mt-0.5 text-slate-800">{patient.age != null ? `${patient.age}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Gender</dt>
            <dd className="mt-0.5 text-slate-800">{patient.gender ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-0 px-6 py-5">
        <section className="space-y-3">
          <SectionTitle>Diagnoses</SectionTitle>
          {diseaseHistory.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-500">No diagnoses on file.</p>
          ) : (
            <ul className="space-y-2.5">
              {diseaseHistory.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-col gap-0.5 rounded-lg border border-slate-100/90 bg-slate-50/40 px-3 py-2.5 text-sm leading-snug"
                >
                  <span className="font-medium text-slate-900">{d.diagnosisName}</span>
                  <span className="text-xs text-slate-500">
                    {d.icd10Code}
                    {d.status ? ` · ${d.status}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="my-6">
          <Divider />
        </div>

        <section className="space-y-3">
          <SectionTitle>Medications</SectionTitle>
          {medicationHistory.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-500">No medications on file.</p>
          ) : (
            <ul className="space-y-2.5">
              {medicationHistory.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-slate-100/90 bg-slate-50/40 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-900">{m.medicationName}</span>
                  <span className="text-xs capitalize text-slate-600">{m.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="my-6">
          <Divider />
        </div>

        <section className="space-y-3">
          <SectionTitle>Tests &amp; labs</SectionTitle>
          {testResults.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-500">No test results on file.</p>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/90 text-xs font-medium text-slate-500">
                    <th className="pb-2.5 pl-1 pr-3 font-medium">Test</th>
                    <th className="pb-2.5 pr-3 font-medium">Result</th>
                    <th className="pb-2.5 pl-1 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {testResults.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 pl-1 pr-3 align-top text-slate-900">{t.testName}</td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className="text-slate-800">{t.resultValue ?? "—"}</span>
                        {t.interpretation ? (
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                            {t.interpretation}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pl-1 align-top text-xs tabular-nums text-slate-500">
                        {t.testDate ? t.testDate.slice(0, 10) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
