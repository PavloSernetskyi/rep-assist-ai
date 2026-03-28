import { Skeleton } from "@/components/ui/skeleton";
import { SoftNotice } from "@/components/ui/soft-notice";
import type { Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

type PatientPickerProps = {
  patients: Patient[] | null;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function PatientPicker({
  patients,
  loading,
  error,
  selectedId,
  onSelect,
}: PatientPickerProps) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <label htmlFor="patient-select" className="text-sm font-semibold text-slate-900">
          Patient
        </label>
        <p id="patient-select-hint" className="mt-0.5 text-xs text-slate-500">
          Choose a record to load clinical context.
        </p>
      </div>

      {error && <SoftNotice>{error}</SoftNotice>}

      {loading && (
        <div
          className="rounded-xl border border-slate-200/60 bg-slate-50/30 p-3"
          aria-busy
          aria-label="Loading patients"
        >
          <Skeleton className="h-[42px] w-full rounded-lg" />
        </div>
      )}

      {!loading && patients && patients.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200/70 bg-slate-50/40 px-4 py-7 text-center text-sm leading-relaxed text-slate-500">
          No patients available. Seed the database, then refresh this page.
        </div>
      )}

      {!loading && patients && patients.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <select
            id="patient-select"
            aria-describedby="patient-select-hint"
            className={cn(
              "w-full cursor-pointer border-0 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors",
              "focus-visible:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={selectedId ?? ""}
            disabled={!!error}
            onChange={(e) => {
              const id = e.target.value;
              if (id) onSelect(id);
            }}
          >
            <option value="" disabled>
              Select a patient…
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
                {p.age != null ? ` · ${p.age}y` : ""} · {p.insuranceType}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
