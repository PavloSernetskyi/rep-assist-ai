import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { EvaluationResponse, EligibilityLabel, PriorAuthLikelihood } from "@/lib/types";
import { cn } from "@/lib/utils";

function CardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardKicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </p>
  );
}

function eligibilitySurface(label: EligibilityLabel): string {
  switch (label) {
    case "Likely eligible":
      return "border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-white text-emerald-950";
    case "Maybe eligible":
      return "border-amber-200/90 bg-gradient-to-br from-amber-50/80 to-white text-amber-950";
    case "Poor fit":
      return "border-slate-200/90 bg-gradient-to-br from-slate-100/80 to-white text-slate-900";
    default:
      return "border-slate-200/90 bg-white text-slate-900";
  }
}

function likelihoodTone(x: PriorAuthLikelihood): string {
  switch (x) {
    case "High":
      return "bg-rose-100/90 text-rose-900 ring-1 ring-rose-200/80";
    case "Moderate":
      return "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/80";
    case "Low":
      return "bg-emerald-100/90 text-emerald-900 ring-1 ring-emerald-200/80";
    default:
      return "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80";
  }
}

/** Shown while POST /api/evaluate is in flight */
export function EvaluationBriefSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading evaluation">
      <div className="flex items-center gap-2.5 text-sm text-slate-500">
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200/80 border-t-slate-500/70"
          aria-hidden
        />
        <span className="font-medium text-slate-600">Preparing coverage brief…</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CardShell className="border-slate-200/60 bg-slate-50/20">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-[75%]" />
        </CardShell>
        <CardShell className="border-slate-200/60 bg-slate-50/20">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-6 w-[50%]" />
        </CardShell>
      </div>
      <CardShell className="border-slate-200/60 bg-slate-50/20">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-[80%]" />
      </CardShell>
    </div>
  );
}

export function EvaluationResultCards({ result }: { result: EvaluationResponse }) {
  const { eligibility, priorAuthRequired, priorAuthLikelihood, meta } = result;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-slate-900">Coverage brief</h2>
        <p className="text-xs text-slate-500">Rule-based evaluation for the selected patient and product.</p>
      </div>

      {/* 1. Eligibility */}
      <div className={cn("rounded-2xl border p-5 shadow-sm", eligibilitySurface(eligibility))}>
        <CardKicker>Eligibility</CardKicker>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{eligibility}</p>
        <p className="mt-2 text-xs leading-relaxed opacity-90">
          High-level fit for plan criteria and documented history.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 2. Prior auth */}
        <CardShell className="flex flex-col justify-between">
          <div>
            <CardKicker>Prior authorization</CardKicker>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {priorAuthRequired ? "PA required" : "PA not required"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Based on coverage rules for this medication and plan type.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Likelihood</span>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                likelihoodTone(priorAuthLikelihood)
              )}
            >
              {priorAuthLikelihood}
            </span>
          </div>
        </CardShell>

        {/* 3. Cost & voucher */}
        <CardShell>
          <CardKicker>Cost &amp; access</CardKicker>
          <p className="mt-3 text-lg font-semibold tabular-nums text-slate-900">
            {result.estimatedMonthlyCost}
          </p>
          <p className="mt-1 text-xs text-slate-500">Estimated patient responsibility (illustrative).</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Voucher / bridge</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                result.voucherAvailable
                  ? "bg-teal-100 text-teal-900 ring-1 ring-teal-200/80"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"
              )}
            >
              {result.voucherAvailable ? "Available" : "Not indicated"}
            </span>
          </div>
        </CardShell>
      </div>

      {/* 4. Summary */}
      <CardShell className="border-slate-200/90 bg-slate-50/30">
        <CardKicker>Summary</CardKicker>
        <p className="mt-3 text-sm leading-relaxed text-slate-800">{result.summary}</p>
      </CardShell>

      {/* 5. Talking points */}
      <CardShell>
        <CardKicker>Talking points</CardKicker>
        <ul className="mt-3 space-y-2.5">
          {result.talkingPoints.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-800">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </CardShell>

      {/* 6. Meta */}
      <CardShell className="border-dashed border-slate-200/90 bg-slate-50/40">
        <CardKicker>Request details</CardKicker>
        <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Patient ID</dt>
            <dd className="mt-0.5 font-mono text-[11px] text-slate-800">{meta.patientId}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Medication</dt>
            <dd className="mt-0.5 text-slate-800">{meta.medicationName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-slate-500">Coverage rule</dt>
            <dd className="mt-0.5 text-slate-800">
              {meta.coverageRuleMatched ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Matched to a plan-specific rule row
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  No dedicated rule — defaults applied
                </span>
              )}
            </dd>
          </div>
        </dl>
      </CardShell>
    </div>
  );
}
