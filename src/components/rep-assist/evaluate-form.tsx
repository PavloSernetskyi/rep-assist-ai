import { SoftNotice } from "@/components/ui/soft-notice";
import { cn } from "@/lib/utils";

type EvaluateFormProps = {
  medicationName: string;
  onMedicationChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
  error: string | null;
  patientSelected: boolean;
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function EvaluateForm({
  medicationName,
  onMedicationChange,
  onSubmit,
  disabled,
  loading,
  error,
  patientSelected,
}: EvaluateFormProps) {
  const blocked = !patientSelected || disabled;
  const canRun = patientSelected && !disabled && !loading;

  return (
    <section className="mt-5 flex flex-col gap-4 border-t border-slate-200/90 pt-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Evaluate medication</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          POST <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">/api/evaluate</code>{" "}
          with <span className="font-medium text-slate-700">CardioX</span> for demo rules (case-insensitive).
        </p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (canRun) onSubmit();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Medication name</span>
          <input
            type="text"
            name="medicationName"
            value={medicationName}
            onChange={(e) => onMedicationChange(e.target.value)}
            disabled={blocked || loading}
            placeholder='e.g. "CardioX"'
            autoComplete="off"
            className={cn(
              "rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors",
              "placeholder:text-slate-400",
              "focus:border-teal-400/90 focus:ring-2 focus:ring-teal-100/90",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            )}
          />
        </label>

        {error && <SoftNotice>{error}</SoftNotice>}

        <button
          type="submit"
          disabled={!canRun}
          aria-busy={loading}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors",
            "bg-teal-700 hover:bg-teal-800",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
            "disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100"
          )}
        >
          {loading && <Spinner className="h-4 w-4 text-white/90" />}
          {loading ? "Evaluating…" : "Run evaluation"}
        </button>
      </form>
    </section>
  );
}
