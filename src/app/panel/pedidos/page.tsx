"use client";

import { useEffect, useState } from "react";
import { usePanel } from "@/store/PanelStore";
import { formatPrice } from "@/lib/menu";
import { ORDER_FLOW, STATUS_LABEL, nextStatus, orderTotal, type Order } from "@/lib/orders";
import { Elapsed, Empty, PageTitle, StatusPill, useNow } from "@/components/panel/ui";

function OrderCard({ order, now }: { order: Order; now: number }) {
  const { advance, setStatus, unseen } = usePanel();
  const isNew = unseen.includes(order.id);
  const next = nextStatus(order.status);
  return (
    <div
      className={`rounded-xl border bg-surface transition-colors ${
        isNew ? "border-accent/60 shadow-[0_0_0_3px_rgba(224,164,88,0.12)]" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <StatusPill status={order.status} />
        <Elapsed since={order.createdAt} now={now} />
      </div>
      <ul className="px-4 py-3">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 py-1 text-sm">
            <span className="w-6 shrink-0 font-bold tabular-nums text-cream">{it.qty}×</span>
            <div className="min-w-0 flex-1">
              <p className="text-cream">{it.name}</p>
              {it.note && <p className="text-xs italic text-accent">“{it.note}”</p>}
            </div>
            <span className="tabular-nums text-muted">{formatPrice(it.qty * it.unitPrice)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
        <select
          value={order.status}
          onChange={(e) => setStatus(order.id, e.target.value as Order["status"])}
          aria-label="Estado del pedido"
          className="h-9 rounded-lg border border-line bg-surface-2 px-2 text-xs text-cream"
        >
          {ORDER_FLOW.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        {next ? (
          <button
            type="button"
            onClick={() => advance(order.id)}
            className="ml-auto h-9 rounded-lg bg-accent px-4 text-xs font-semibold text-ink active:scale-[0.98]"
          >
            → {STATUS_LABEL[next]}
          </button>
        ) : (
          <span className="ml-auto text-xs text-muted">Entregado</span>
        )}
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const { orders, tables, closeTable, markSeen } = usePanel();
  const now = useNow(15000);
  const [confirm, setConfirm] = useState<number | null>(null);

  useEffect(() => {
    markSeen();
  }, [orders.length, markSeen]);

  // Agrupa por mesa, con las mesas que tienen algo nuevo primero.
  const byTable = new Map<number, Order[]>();
  orders.forEach((o) => byTable.set(o.table, [...(byTable.get(o.table) ?? []), o]));
  const groups = [...byTable.entries()].sort((a, b) => {
    const rank = (os: Order[]) => Math.min(...os.map((o) => ORDER_FLOW.indexOf(o.status)));
    return rank(a[1]) - rank(b[1]) || a[0] - b[0];
  });

  const confirming = confirm !== null ? byTable.get(confirm) ?? [] : [];
  const confirmTotal = confirming.reduce((s, o) => s + orderTotal(o), 0);

  return (
    <div>
      <PageTitle
        title="Pedidos"
        subtitle={`${orders.length} abiertos en ${groups.length} ${groups.length === 1 ? "mesa" : "mesas"}`}
      />

      {groups.length === 0 ? (
        <Empty title="Sin pedidos abiertos" hint="Cuando un cliente pida desde su mesa, aparece acá con sonido." />
      ) : (
        <div className="grid gap-4 px-4 pb-6 md:grid-cols-2 md:px-6 xl:grid-cols-3">
          {groups.map(([table, list]) => {
            const t = tables.find((x) => x.number === table);
            const total = list.reduce((s, o) => s + orderTotal(o), 0);
            const allDelivered = list.every((o) => o.status === "entregado");
            return (
              <section key={table} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl text-cream">Mesa {table}</h2>
                    {t?.billRequested && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                        Pide cuenta
                      </span>
                    )}
                    {t?.waiterCalled && (
                      <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                        Llama
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-cream">{formatPrice(total)}</span>
                </div>
                {list.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} />
                ))}
                <button
                  type="button"
                  onClick={() => setConfirm(table)}
                  className={`h-10 rounded-xl border text-sm font-semibold ${
                    allDelivered
                      ? "border-accent bg-accent text-ink"
                      : "border-line text-muted"
                  }`}
                >
                  Cerrar mesa · {formatPrice(total)}
                </button>
              </section>
            );
          })}
        </div>
      )}

      {confirm !== null && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-ink/70 backdrop-blur-sm md:items-center"
          onClick={() => setConfirm(null)}
        >
          <div
            role="dialog"
            aria-label={`Cerrar mesa ${confirm}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-2xl border border-line bg-surface p-5 md:rounded-2xl"
          >
            <h3 className="font-display text-2xl text-cream">Cerrar mesa {confirm}</h3>
            <p className="mt-1 text-sm text-muted">
              {confirming.length} {confirming.length === 1 ? "pedido" : "pedidos"} · cobrar en efectivo o posnet
            </p>
            <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto text-sm">
              {confirming.flatMap((o) => o.items).map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-cream">{it.qty}× {it.name}</span>
                  <span className="tabular-nums text-muted">{formatPrice(it.qty * it.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-semibold text-muted">Total</span>
              <span className="font-display text-3xl text-cream">{formatPrice(confirmTotal)}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="h-11 rounded-xl border border-line text-sm font-semibold text-cream"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  closeTable(confirm);
                  setConfirm(null);
                }}
                className="h-11 rounded-xl bg-accent text-sm font-semibold text-ink"
              >
                Cobrado, cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
