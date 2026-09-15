"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePanel } from "@/store/PanelStore";

const NAV = [
  { href: "/panel", label: "Resumen", icon: "◧" },
  { href: "/panel/pedidos", label: "Pedidos", icon: "☰" },
  { href: "/panel/cocina", label: "Cocina", icon: "♨" },
  { href: "/panel/mesas", label: "Mesas", icon: "▦" },
  { href: "/panel/carta", label: "Carta", icon: "✎" },
  { href: "/panel/configuracion", label: "Ajustes", icon: "⚙" },
];

// Sonido corto de aviso generado con Web Audio (sin archivos).
function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch {}
}

export function PanelShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { menu, unseen, orders, tables, demo, toggleDemo, simulateOrder } = usePanel();
  const lastCount = useRef(unseen.length);

  // Aviso sonoro y en el título cuando entra un pedido nuevo.
  useEffect(() => {
    if (unseen.length > lastCount.current) beep();
    lastCount.current = unseen.length;
    document.title = unseen.length
      ? `(${unseen.length}) Pedidos nuevos · ${menu.restaurant.name}`
      : `Panel · ${menu.restaurant.name}`;
  }, [unseen.length, menu.restaurant.name]);

  const active = orders.filter((o) => o.status !== "entregado").length;
  const alerts = tables.filter((t) => t.waiterCalled || t.billRequested).length;

  const badge = (href: string) => {
    if (href === "/panel/pedidos" && unseen.length) return unseen.length;
    if (href === "/panel/cocina" && active) return active;
    if (href === "/panel/mesas" && alerts) return alerts;
    return 0;
  };

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Barra lateral (tablet/desktop) */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="border-b border-line px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Mesa Digital
          </p>
          <p className="mt-0.5 font-display text-xl leading-tight text-cream">
            {menu.restaurant.name}
          </p>
        </div>
        <nav className="flex-1 p-2">
          {NAV.map((n) => {
            const on = path === n.href;
            const b = badge(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  on ? "bg-surface-2 text-cream" : "text-muted hover:text-cream"
                }`}
              >
                <span className="w-5 text-center text-base">{n.icon}</span>
                <span className="flex-1">{n.label}</span>
                {b > 0 && (
                  <span
                    className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-bold ${
                      n.href === "/panel/pedidos" ? "bg-accent text-ink" : "bg-line text-cream"
                    }`}
                  >
                    {b}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <DemoControls demo={demo} toggleDemo={toggleDemo} simulateOrder={simulateOrder} />
        </div>
      </aside>

      {/* Cabecera (celular) */}
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Panel
          </p>
          <p className="font-display text-lg leading-tight text-cream">
            {menu.restaurant.name}
          </p>
        </div>
        <DemoControls demo={demo} toggleDemo={toggleDemo} simulateOrder={simulateOrder} compact />
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Pestañas inferiores (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface/95 backdrop-blur md:hidden">
        {NAV.map((n) => {
          const on = path === n.href;
          const b = badge(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                on ? "text-accent" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{n.icon}</span>
              {n.label}
              {b > 0 && (
                <span className="absolute right-2 top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-bold text-ink">
                  {b}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function DemoControls({
  demo,
  toggleDemo,
  simulateOrder,
  compact = false,
}: {
  demo: boolean;
  toggleDemo: () => void;
  simulateOrder: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-col items-stretch"}`}>
      <button
        type="button"
        onClick={toggleDemo}
        aria-pressed={demo}
        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
          demo ? "border-sage/50 text-sage" : "border-line text-muted"
        }`}
      >
        <span className={`size-2 rounded-full ${demo ? "bg-sage animate-pulse" : "bg-line"}`} />
        {compact ? "Demo" : demo ? "Simulando pedidos" : "Simulación pausada"}
      </button>
      <button
        type="button"
        onClick={simulateOrder}
        className="rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold text-cream active:bg-line"
      >
        {compact ? "+ Pedido" : "+ Pedido de prueba"}
      </button>
    </div>
  );
}
