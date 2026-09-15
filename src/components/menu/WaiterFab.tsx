"use client";

import { useEffect, useState } from "react";

// Botón flotante para llamar al mozo o pedir la cuenta. Por ahora solo muestra
// la confirmación; en la etapa 4 envía la notificación al panel del local.
export function WaiterFab({ table }: { table: string | null }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const send = (what: "mozo" | "cuenta") => {
    setOpen(false);
    setToast(
      what === "mozo"
        ? `Avisamos al mozo${table ? ` · mesa ${table}` : ""}`
        : `Pedimos la cuenta${table ? ` · mesa ${table}` : ""}`,
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Llamar al mozo o pedir la cuenta"
        className="fixed bottom-5 right-5 z-20 flex size-14 items-center justify-center rounded-full bg-accent text-ink shadow-[0_8px_30px_rgba(224,164,88,0.35)] transition-transform active:scale-95"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 20a1 1 0 0 1-1-1v-1h14v1a1 1 0 0 1-1 1H6Z" fill="currentColor" />
          <path d="M12 6a7 7 0 0 0-7 7v3h14v-3a7 7 0 0 0-7-7Z" fill="currentColor" opacity="0.9" />
          <circle cx="12" cy="4.5" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-ink/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Atención en la mesa"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl border-t border-line bg-surface px-5 pb-8 pt-3"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {table ? `Mesa ${table}` : "Tu mesa"}
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => send("mozo")}
                className="flex h-14 items-center justify-between rounded-2xl bg-surface-2 px-4 text-left text-[15px] font-semibold text-cream active:bg-line"
              >
                Llamar al mozo
                <span className="text-muted">→</span>
              </button>
              <button
                type="button"
                onClick={() => send("cuenta")}
                className="flex h-14 items-center justify-between rounded-2xl bg-surface-2 px-4 text-left text-[15px] font-semibold text-cream active:bg-line"
              >
                Pedir la cuenta
                <span className="text-muted">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {toast && (
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-cream shadow-lg">
            <span className="text-sage">✓</span>
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
