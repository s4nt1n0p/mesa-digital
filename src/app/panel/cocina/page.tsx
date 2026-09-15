"use client";

import { usePanel } from "@/store/PanelStore";
import { type Order } from "@/lib/orders";
import { Elapsed, Empty, PageTitle, useNow } from "@/components/panel/ui";

// Vista de cocina: solo lo que hay que preparar, en letra grande, tres columnas
// (recibido → preparando → listo). Un toque mueve la comanda a la siguiente.

function Ticket({ order, now }: { order: Order; now: number }) {
  const { advance } = usePanel();
  const label =
    order.status === "recibido" ? "Empezar" : order.status === "preparando" ? "Listo" : "Entregado";
  return (
    <button
      type="button"
      onClick={() => advance(order.id)}
      className={`w-full rounded-xl border-l-4 bg-surface p-4 text-left transition-transform active:scale-[0.98] ${
        order.status === "recibido"
          ? "border-accent"
          : order.status === "preparando"
            ? "border-cream/60"
            : "border-sage"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl text-cream">Mesa {order.table}</span>
        <Elapsed since={order.createdAt} now={now} warnAfter={12} />
      </div>
      <ul className="mt-2 space-y-1.5">
        {order.items.map((it, i) => (
          <li key={i} className="flex gap-3 text-[17px] leading-snug">
            <span className="w-7 shrink-0 font-bold tabular-nums text-accent">{it.qty}</span>
            <div>
              <p className="text-cream">{it.name}</p>
              {it.note && <p className="text-sm font-semibold text-accent">→ {it.note}</p>}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
        Tocar: {label}
      </p>
    </button>
  );
}

export default function CocinaPage() {
  const { orders } = usePanel();
  const now = useNow(15000);
  const cols: { key: Order["status"]; title: string }[] = [
    { key: "recibido", title: "Por hacer" },
    { key: "preparando", title: "En la plancha" },
    { key: "listo", title: "Para salir" },
  ];
  const active = orders.filter((o) => o.status !== "entregado");

  return (
    <div>
      <PageTitle title="Cocina" subtitle={`${active.length} comandas activas`} />
      {active.length === 0 ? (
        <Empty title="Cocina al día" hint="No hay comandas pendientes." />
      ) : (
        <div className="grid gap-4 px-4 pb-6 md:grid-cols-3 md:px-6">
          {cols.map((c) => {
            const list = active
              .filter((o) => o.status === c.key)
              .sort((a, b) => a.createdAt - b.createdAt);
            return (
              <section key={c.key}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{c.title}</h2>
                  <span className="text-xs tabular-nums text-muted">{list.length}</span>
                </div>
                <div className="space-y-2">
                  {list.map((o) => (
                    <Ticket key={o.id} order={o} now={now} />
                  ))}
                  {list.length === 0 && (
                    <div className="rounded-xl border border-dashed border-line p-6 text-center text-xs text-muted">
                      Nada acá
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
