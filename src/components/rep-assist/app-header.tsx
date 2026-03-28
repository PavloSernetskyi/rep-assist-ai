export function AppHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
            RepAssist AI
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Coverage &amp; access brief
          </h1>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          Demo data only — not for clinical decisions. Eligibility and cost are
          illustrative.
        </p>
      </div>
    </header>
  );
}
