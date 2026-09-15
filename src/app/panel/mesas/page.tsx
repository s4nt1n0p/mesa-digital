"use client";

import { useState } from "react";
import { usePanel } from "@/store/PanelStore";
import { formatPrice } from "@/lib/menu";
import { orderTotal, type Table } from "@/lib/orders";
import { PageTitle, StatusPill, useNow } from "@/components/panel/ui";

const TONE: Record<Table["status"], string> = {
  libre: "border-line bg-surface text-muted",
  ocupada: "border-cream/30 bg-cream/10 text-cream",
  cuenta: "border-accent bg-accent/15 text-accent",
};

export default function MesasPage() {
  const { tables, orders, closeTable, openTable, flagTable, simulateOrder } = usePanel();
  const now = useNow();
  const [sel, setSel] = useState<number | null>(null);
  const table = tables.find((t) => t.number === sel) ?? null;
  const tableOrders = orders.filter((o) => o.table === sel);
  const total = tableOrders.reduce((s, o) => s + orderTotal(o), 0);

  const counts = {
    libre: tables.filter((t) => t.status === "libre").length,
    ocupada: tables.filter((t) => t.status === "ocupada").length,
    cuenta: tables.filter((t) => t.status === "cuenta").length,
  };

  return (
    <div>
      <PageTitle
        title="Mesas"
        subtitle={`${counts.ocupada} ocupadas · ${counts.cuenta} esperando cuenta · ${counts.libre} libres`}
      />

      <div className="grid gap-4 px-4 pb-6 md:grid-cols-[1fr_320px] md:px-6">
        {/* Mapa */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {tables.map((t) => (
            <button
              key={t.number}
              type="button"
              onClick={() => setSel(t.number)}
              aria-pressed={sel === t.number}
              className={`relative aspect-square rounded-2xl border-2 p-3 text-left transition-transform active:scale-[0.97] ${TONE[t.status]} ${
                sel === t.number ? "ring-2 ring-accent ring-offset-2 ring-offset-ink" : ""
              }`}
            >
              <span className="font-display text-3xl leading-none">{t.number}</span>
              <span className="absolute right-2.5 top-2.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                {t.seats}p
              </span>
              <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold capitalize">
                {t.status === "cuenta" ? "Cuenta" : t.status}
              </span>
              {(t.waiterCalled || t.billRequested) && (
                <span className="absolute bottom-2.5 right-2.5 size-2.5 animate-pulse rounded-full bg-accent" />
              )}
              {t.openedAt && t.status !== "libre" && (
                <span className="absolute right-2.5 top-8 text-[10px] tabular-nums opacity-70">
                  {Math.floor((now - t.openedAt) / 60000)}′
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Detalle */}
        <aside className="rounded-xl border border-line bg-surface p-4 md:sticky md:top-4 md:self-start">
          {!table ? (
            <p className="py-6 text-center text-sm text-muted">Tocá una mesa para ver el detalle.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-cream">Mesa {table.number}</h2>
                <span className="text-xs text-muted">{table.seats} lugares</span>
              </div>

              {table.status === "libre" ? (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted">Libre. Abrila cuando se sienten, o dejá que el primer pedido la abra sola.</p>
                  <button
                    type="button"
                    onClick={() => openTable(table.number)}
                    className="h-10 w-full rounded-lg border border-line text-sm font-semibold text-cream"
                  >
                    Abrir mesa
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {table.waiterCalled && (
                      <button
                        type="button"
                        onClick={() => flagTable(table.number, { waiterCalled: false })}
                        className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink"
                      >
                        Llama al mozo · atendido ✓
                      </button>
                    )}
                    {table.billRequested && (
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">
                        Pide la cuenta
                      </span>
                    )}
                  </div>

                  <ul className="mt-4 space-y-3">
                    {tableOrders.length === 0 && (
                      <li className="text-sm text-muted">Sin pedidos todavía.</li>
                    )}
                    {tableOrders.map((o) => (
                      <li key={o.id} className="rounded-lg bg-surface-2 p-3">
                        <div className="flex items-center justify-between">
                          <StatusPill status={o.status} />
                          <span className="text-xs tabular-nums text-muted">{formatPrice(orderTotal(o))}</span>
                        </div>
                        <ul className="mt-2 text-sm text-cream">
                          {o.items.map((it, i) => (
                            <li key={i}>{it.qty}× {it.name}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-sm text-muted">Total</span>
                    <span className="font-display text-2xl text-cream">{formatPrice(total)}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => flagTable(table.number, { billRequested: !table.billRequested })}
                      className="h-10 rounded-lg border border-line text-xs font-semibold text-cream"
                    >
                      {table.billRequested ? "Quitar 'cuenta'" : "Marcar 'cuenta'"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeTable(table.number);
                        setSel(null);
                      }}
                      className="h-10 rounded-lg bg-accent text-xs font-semibold text-ink"
                    >
                      Cerrar mesa
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={simulateOrder}
                className="mt-4 w-full text-center text-[11px] text-muted underline-offset-2 hover:underline"
              >
                Simular un pedido (demo)
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
