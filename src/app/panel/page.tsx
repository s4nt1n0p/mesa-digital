"use client";

import Link from "next/link";
import { usePanel } from "@/store/PanelStore";
import { formatPrice } from "@/lib/menu";
import { orderTotal } from "@/lib/orders";
import { Elapsed, PageTitle, useNow } from "@/components/panel/ui";

function Stat({
  label,
  value,
  hint,
  tone = "",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">{label}</p>
      <p className={`mt-1.5 font-display text-3xl leading-none text-cream ${tone}`}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function ResumenPage() {
  const { orders, closed, tables, menu } = usePanel();
  const now = useNow();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayClosed = closed.filter((c) => c.closedAt >= startOfDay.getTime());

  const revenue = todayClosed.reduce((s, c) => s + c.total, 0);
  const inProgress = orders.reduce((s, o) => s + orderTotal(o), 0);
  const ordersToday = todayClosed.reduce((s, c) => s + c.orders.length, 0) + orders.length;
  const ticket = todayClosed.length ? revenue / todayClosed.length : 0;

  const occupied = tables.filter((t) => t.status !== "libre");
  const stale = orders.filter((o) => o.status === "recibido" && now - o.createdAt > 10 * 60000);
  const soldOut = menu.dishes.filter((d) => !d.available);
  const flagged = tables.filter((t) => t.waiterCalled || t.billRequested);

  // Ranking simple del día a partir de lo cerrado y lo abierto.
  const counts = new Map<string, number>();
  [...todayClosed.flatMap((c) => c.orders), ...orders].forEach((o) =>
    o.items.forEach((i) => counts.set(i.name, (counts.get(i.name) ?? 0) + i.qty)),
  );
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <PageTitle
        title="Hoy"
        subtitle={new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
      />

      <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-4 md:px-6">
        <Stat label="Cobrado" value={formatPrice(revenue)} hint={`${todayClosed.length} mesas cerradas`} />
        <Stat label="En curso" value={formatPrice(inProgress)} hint={`${orders.length} pedidos abiertos`} />
        <Stat label="Pedidos" value={String(ordersToday)} hint="en el día" />
        <Stat label="Ticket promedio" value={ticket ? formatPrice(Math.round(ticket)) : "—"} hint="por mesa" />
      </div>

      <div className="mt-5 grid gap-3 px-4 md:grid-cols-2 md:px-6">
        {/* Alertas */}
        <section className="rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-cream">Atención</h2>
            <span className="text-xs text-muted">{stale.length + flagged.length + soldOut.length} avisos</span>
          </div>
          <ul className="divide-y divide-line">
            {stale.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-cream">
                  <span className="mr-2 inline-block size-2 rounded-full bg-chili" />
                  Mesa {o.table} sin atender
                </span>
                <Elapsed since={o.createdAt} now={now} warnAfter={10} />
              </li>
            ))}
            {flagged.map((t) => (
              <li key={t.number} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-cream">
                  <span className="mr-2 inline-block size-2 rounded-full bg-accent" />
                  Mesa {t.number} {t.billRequested ? "pide la cuenta" : "llama al mozo"}
                </span>
                <Link href="/panel/mesas" className="text-xs font-semibold text-accent">Ver</Link>
              </li>
            ))}
            {soldOut.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted">
                  <span className="mr-2 inline-block size-2 rounded-full bg-line" />
                  {d.name} agotado
                </span>
                <Link href="/panel/carta" className="text-xs font-semibold text-accent">Carta</Link>
              </li>
            ))}
            {stale.length + flagged.length + soldOut.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted">Todo en orden.</li>
            )}
          </ul>
        </section>

        {/* Mesas y ranking */}
        <div className="grid gap-3">
          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cream">Mesas activas</h2>
              <span className="text-xs text-muted">{occupied.length} de {tables.length}</span>
            </div>
            <div className="mt-2 flex gap-3 text-[11px] text-muted">
              <span><span className="mr-1 inline-block size-2 rounded-full bg-sage" />Ocupada</span>
              <span><span className="mr-1 inline-block size-2 rounded-full bg-chili" />Libre</span>
              <span><span className="mr-1 inline-block size-2 rounded-full bg-accent" />Pide cuenta</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tables.map((t) => (
                <span
                  key={t.number}
                  title={`Mesa ${t.number}`}
                  className={`flex size-8 items-center justify-center rounded-md text-xs font-semibold ${
                    t.status === "libre"
                      ? "bg-chili/20 text-chili"
                      : t.status === "cuenta"
                        ? "bg-accent text-ink"
                        : "bg-sage/25 text-sage"
                  }`}
                >
                  {t.number}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-cream">Más pedidos hoy</h2>
            {top.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Todavía no hay pedidos.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {top.map(([name, qty], i) => (
                  <li key={name} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-right text-xs text-muted">{i + 1}</span>
                    <span className="flex-1 truncate text-cream">{name}</span>
                    <span className="tabular-nums text-muted">×{qty}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
