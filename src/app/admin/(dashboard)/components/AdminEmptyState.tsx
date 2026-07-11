import type { LucideIcon } from "lucide-react";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: AdminEmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-[#001C55] ring-8 ring-blue-50/40 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-sm font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-lg bg-[#001C55] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#001236]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
