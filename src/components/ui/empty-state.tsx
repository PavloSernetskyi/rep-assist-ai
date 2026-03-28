import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

function DefaultIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  );
}

/**
 * Calm placeholder when there is nothing to show yet (e.g. no patient selected).
 */
export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/70 bg-gradient-to-b from-slate-50/50 to-white px-6 py-14 text-center sm:min-h-[320px] sm:px-10">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100/70 text-slate-400"
        aria-hidden
      >
        {icon ?? <DefaultIcon />}
      </div>
      <h2 className="text-sm font-medium tracking-tight text-slate-700">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
