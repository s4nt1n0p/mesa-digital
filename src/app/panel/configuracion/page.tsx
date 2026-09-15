"use client";

import { useState } from "react";
import { usePanel } from "@/store/PanelStore";
import { PageTitle } from "@/components/panel/ui";

// Configuración del local. Por ahora muestra los datos del restaurante de demo
// y genera los links de QR por mesa; guardar cambios llega con Supabase.

function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-muted">
      {label}
      <input
        defaultValue={value}
        readOnly
        className="mt-1 h-11 w-full rounded-lg border border-line bg-surface-2 px-3 text-[15px] text-cream/80 outline-none"
      />
      {hint && <span className="mt-1 block text-[11px] font-normal text-muted">{hint}</span>}
    </label>
  );
}

export default function ConfiguracionPage() {
  const { menu, tables } = usePanel();
  const r = menu.restaurant;
  const [copied, setCopied] = useState<number | null>(null);
  const base = typeof window !== "undefined" ? window.location.origin : "";

  const copy = async (n: number) => {
    try {
      await navigator.clipboard.writeText(`${base}/menu/${r.slug}?mesa=${n}`);
      setCopied(n);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <div>
      <PageTitle title="Ajustes" subtitle="Datos del local, mesas y códigos QR" />

      <div className="grid gap-4 px-4 pb-6 md:grid-cols-2 md:px-6">
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-cream">El local</h2>
          <p className="mt-1 text-xs text-muted">
            La edición se habilita al conectar la base de datos. Por ahora, solo lectura.
          </p>
          <div className="mt-4 space-y-3">
            <Field label="Nombre" value={r.name} />
            <Field label="Subtítulo" value={r.tagline} hint="Aparece bajo el nombre en la carta." />
            <Field label="Color de acento" value={r.accent} hint="Botones, precios y detalles de la carta." />
            <Field
              label="Tiempo de espera por defecto"
              value={`${r.defaultWaitMinutes} min`}
              hint="Se puede ajustar durante el servicio; cada plato puede tener el suyo."
            />
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-muted">Vista previa del acento</span>
              <span className="size-6 rounded-full border border-line" style={{ background: r.accent }} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-cream">Mesas y QR</h2>
          <p className="mt-1 text-xs text-muted">
            Cada mesa tiene su link. Imprimí el QR de cada uno y pegalo en la mesa.
          </p>
          <ul className="mt-4 divide-y divide-line">
            {tables.map((t) => (
              <li key={t.number} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-16 font-semibold text-cream">Mesa {t.number}</span>
                <code className="min-w-0 flex-1 truncate text-xs text-muted">
                  /menu/{r.slug}?mesa={t.number}
                </code>
                <button
                  type="button"
                  onClick={() => copy(t.number)}
                  className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-cream"
                >
                  {copied === t.number ? "Copiado ✓" : "Copiar link"}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted">
            Pronto: descargar los QR listos para imprimir, con el logo del local.
          </p>
        </section>
      </div>
    </div>
  );
}
