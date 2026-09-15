"use client";

import Image from "next/image";
import { useState } from "react";
import { usePanel } from "@/store/PanelStore";
import { DIET_TAGS, formatPrice } from "@/lib/menu";
import type { DietTag, Dish } from "@/lib/types";
import { PageTitle } from "@/components/panel/ui";

// Editor de carta: lo que el dueño usa seguido. Disponible/agotado con un
// toque, y edición de nombre, descripción, precio, etiquetas e indicadores.
// Subir fotos y modelos 3D llega con Supabase Storage (etapa 2).

const ALL_TAGS = Object.keys(DIET_TAGS) as DietTag[];

function DishEditor({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const { updateDish } = usePanel();
  const [draft, setDraft] = useState<Dish>(dish);
  const set = <K extends keyof Dish>(k: K, v: Dish[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleTag = (t: DietTag) =>
    set("tags", draft.tags.includes(t) ? draft.tags.filter((x) => x !== t) : [...draft.tags, t]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/70 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-label={`Editar ${dish.name}`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          updateDish(dish.id, draft);
          onClose();
        }}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 md:rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            <Image src={draft.image} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Editar plato</p>
            <p className="truncate font-display text-lg text-cream">{dish.name}</p>
          </div>
        </div>

        <label className="mt-5 block text-xs font-semibold text-muted">
          Nombre
          <input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="mt-1 h-11 w-full rounded-lg border border-line bg-surface-2 px-3 text-[15px] text-cream outline-none focus:border-accent"
          />
        </label>

        <label className="mt-3 block text-xs font-semibold text-muted">
          Descripción
          <textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[15px] leading-relaxed text-cream outline-none focus:border-accent"
          />
          <span className="mt-1 block text-[11px] font-normal text-muted">
            Pronto: generar una descripción con IA a partir del nombre.
          </span>
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-muted">
            Precio
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={draft.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className="mt-1 h-11 w-full rounded-lg border border-line bg-surface-2 px-3 text-[15px] tabular-nums text-cream outline-none focus:border-accent"
            />
          </label>
          <label className="block text-xs font-semibold text-muted">
            Tiempo (min)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.waitMinutes ?? ""}
              placeholder="por defecto"
              onChange={(e) => set("waitMinutes", e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 h-11 w-full rounded-lg border border-line bg-surface-2 px-3 text-[15px] tabular-nums text-cream outline-none focus:border-accent"
            />
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-muted">Indicadores</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_TAGS.map((t) => {
              const on = draft.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    on ? "border-accent bg-accent text-ink" : "border-line text-muted"
                  }`}
                >
                  {DIET_TAGS[t].label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-muted">Etiqueta en la tarjeta</legend>
          <div className="mt-2 flex gap-2">
            {([undefined, "nuevo", "recomendado"] as const).map((l) => (
              <button
                key={l ?? "none"}
                type="button"
                onClick={() => set("label", l)}
                aria-pressed={draft.label === l}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  draft.label === l ? "border-cream bg-cream text-ink" : "border-line text-muted"
                }`}
              >
                {l === undefined ? "Ninguna" : l === "nuevo" ? "Nuevo" : "Recomendado"}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-3 text-sm text-cream">
          Destacar en "Los más pedidos"
          <input
            type="checkbox"
            checked={Boolean(draft.featured)}
            onChange={(e) => set("featured", e.target.checked)}
            className="size-5 accent-[var(--accent)]"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line text-sm font-semibold text-cream">
            Cancelar
          </button>
          <button type="submit" className="h-11 rounded-xl bg-accent text-sm font-semibold text-ink">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CartaPage() {
  const { menu, updateDish } = usePanel();
  const [editing, setEditing] = useState<Dish | null>(null);
  const [q, setQ] = useState("");
  const soldOut = menu.dishes.filter((d) => !d.available).length;
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  return (
    <div>
      <PageTitle
        title="Carta"
        subtitle={`${menu.dishes.length} platos · ${soldOut} agotados`}
        right={
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
            aria-label="Buscar plato"
            className="h-10 w-36 rounded-lg border border-line bg-surface px-3 text-sm text-cream outline-none focus:border-accent md:w-56"
          />
        }
      />

      <div className="space-y-6 px-4 pb-6 md:px-6">
        {menu.categories.map((c) => {
          const items = menu.dishes.filter(
            (d) => d.categoryId === c.id && (!q || norm(d.name).includes(norm(q))),
          );
          if (items.length === 0) return null;
          return (
            <section key={c.id}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {c.name} <span className="ml-1 tabular-nums">{items.length}</span>
              </h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
                {items.map((d) => (
                  <li key={d.id} className={`flex items-center gap-3 px-3 py-2.5 ${d.available ? "" : "opacity-60"}`}>
                    <button
                      type="button"
                      onClick={() => setEditing(d)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        <Image src={d.image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-cream">{d.name}</p>
                        <p className="text-xs tabular-nums text-muted">
                          {formatPrice(d.price)}
                          {d.tags.length > 0 && ` · ${d.tags.map((t) => DIET_TAGS[t].short).join(" ")}`}
                          {d.model3d && " · 3D"}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={d.available}
                      aria-label={d.available ? "Marcar agotado" : "Marcar disponible"}
                      onClick={() => updateDish(d.id, { available: !d.available })}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                        d.available ? "bg-sage" : "bg-line"
                      }`}
                    >
                      <span
                        className={`absolute top-1 size-5 rounded-full bg-cream transition-transform ${
                          d.available ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {editing && <DishEditor dish={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
