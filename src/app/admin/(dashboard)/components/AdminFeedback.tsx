"use client";

import { useCallback, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

export type AdminToastState = {
  message: string;
  type: "success" | "error";
  visible: boolean;
};

type ConfirmTone = "danger" | "primary";

type AdminConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void | Promise<void>;
};

const initialToast: AdminToastState = {
  message: "",
  type: "success",
  visible: false
};

export function useAdminFeedback() {
  const [toast, setToast] = useState<AdminToastState>(initialToast);
  const [confirmDialog, setConfirmDialog] = useState<AdminConfirmState | null>(null);
  const [confirming, setConfirming] = useState(false);

  const showToast = useCallback((message: string, type: AdminToastState["type"] = "success") => {
    setToast({ message, type, visible: true });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 3500);
  }, []);

  const requestConfirm = useCallback((options: AdminConfirmState) => {
    setConfirmDialog(options);
  }, []);

  const closeConfirm = useCallback(() => {
    if (!confirming) {
      setConfirmDialog(null);
    }
  }, [confirming]);

  const handleConfirm = useCallback(async () => {
    if (!confirmDialog) return;
    setConfirming(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setConfirming(false);
    }
  }, [confirmDialog]);

  return {
    toast,
    showToast,
    confirmDialog,
    requestConfirm,
    closeConfirm,
    handleConfirm,
    confirming
  };
}

export function AdminToast({ toast }: { toast: AdminToastState }) {
  if (!toast.visible) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            {isSuccess ? "Success" : "Attention"}
          </p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-100">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

type AdminConfirmDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel
}: AdminConfirmDialogProps) {
  if (!open) return null;

  const isDanger = tone === "danger";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              isDanger
                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                : "bg-blue-50 text-[#001C55] dark:bg-blue-500/10 dark:text-blue-300"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close confirmation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors disabled:opacity-70 ${
              isDanger ? "bg-rose-600 hover:bg-rose-700" : "bg-[#001C55] hover:bg-[#001236]"
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
