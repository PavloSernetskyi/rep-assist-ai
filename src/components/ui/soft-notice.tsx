import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SoftNoticeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Non-alarming notice for errors or hints — slate tones, no loud reds.
 */
export function SoftNotice({ children, className }: SoftNoticeProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3.5 py-3 text-sm leading-relaxed text-slate-600",
        className
      )}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200/50 text-[10px] font-semibold text-slate-500"
        aria-hidden
      >
        !
      </span>
      <div className="min-w-0 pt-0.5">{children}</div>
    </div>
  );
}
