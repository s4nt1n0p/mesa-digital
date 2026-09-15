"use client";

import { useEffect, useState } from "react";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders";

// Piezas chicas compartidas por las pantallas del panel.

export function PageTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 px-4 pb-3 pt-4 md:px-6 md:pt-6">
      <div>
        <h1 className="font-display text-2xl leading-tight text-cream md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export const STATUS_TONE: Record<OrderStatus, string> = {
  recibido: "bg-accent/15 text-accent border-accent/40",
  preparando: "bg-cream/10 text-cream border-cream/25",
  listo: "bg-sage/15 text-sage border-sage/40",
  entregado: "bg-line/50 text-muted border-line",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Reloj que se refresca cada 30 s para los "hace X min". */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function Elapsed({ since, now, warnAfter = 15 }: { since: number; now: number; warnAfter?: number }) {
  const m = Math.max(0, Math.floor((now - since) / 60000));
  const late = m >= warnAfter;
  return (
    <span className={`text-xs tabular-nums ${late ? "font-semibold text-chili" : "text-muted"}`}>
      {m === 0 ? "recién" : `${m} min`}
    </span>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <p className="font-display text-xl text-cream">{title}</p>
      {hint && <p className="mt-1.5 max-w-xs text-sm text-muted">{hint}</p>}
    </div>
  );
}
