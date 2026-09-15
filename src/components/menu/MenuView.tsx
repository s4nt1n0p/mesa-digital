"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DietTag, Menu } from "@/lib/types";
import { DIET_TAGS, FILTERABLE_TAGS } from "@/lib/menu";
import { DishCard } from "./DishCard";

type Props = {
  menu: Menu;
  /** Número de mesa que viene en el QR. Se propaga a todos los links. */
  table: string | null;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function MenuView({ menu, table }: Props) {
  const { restaurant, categories, dishes } = menu;
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<DietTag[]>([]);
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const dishHref = (id: string) =>
    `/menu/${restaurant.slug}/plato/${id}${table ? `?mesa=${table}` : ""}`;

  const isSearching = query.trim().length > 0 || activeTags.length > 0;

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return dishes.filter((d) => {
      if (activeTags.some((t) => !d.tags.includes(t))) return false;
      if (!q) return true;
      return normalize(d.name + " " + d.description).includes(q);
    });
  }, [dishes, query, activeTags]);

  const featured = dishes.filter((d) => d.featured && d.available);

  // Marca la categoría activa según la sección visible al hacer scroll.
  useEffect(() => {
    if (isSearching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveCat(hit.target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -70% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isSearching, categories]);

  // Mantiene el chip activo a la vista dentro del carrusel de categorías.
  useEffect(() => {
    chipRefs.current[activeCat ?? ""]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeCat]);

  const jumpTo = (id: string) => {
    setActiveCat(id);
    const el = sectionRefs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 108;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const toggleTag = (t: DietTag) =>
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <div
      className="mx-auto w-full max-w-lg pb-24"
      style={{ ["--accent" as string]: restaurant.accent }}
    >
      {/* Cabecera del restaurante */}
      <header className="relative h-56 overflow-hidden">
        <Image
          src={restaurant.coverImage}
          alt=""
          fill
          priority
          sizes="512px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {restaurant.tagline}
            </p>
            <h1 className="font-display text-4xl leading-none text-cream">
              {restaurant.name}
            </h1>
          </div>
          {table && (
            <div className="rounded-full border border-line bg-ink/60 px-3 py-1.5 text-xs text-muted backdrop-blur">
              Mesa <span className="font-semibold text-cream">{table}</span>
            </div>
          )}
        </div>
      </header>

      {/* Buscador + filtros + categorías, fijos al hacer scroll */}
      <div className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur-md">
        <div className="px-5 pt-3">
          <label className="flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 text-cream">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-muted">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar un plato…"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="text-muted"
              >
                ✕
              </button>
            )}
          </label>
        </div>

        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-5 pb-3">
          {FILTERABLE_TAGS.map((t) => {
            const on = activeTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                aria-pressed={on}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  on
                    ? "border-accent bg-accent text-ink"
                    : "border-line bg-transparent text-muted"
                }`}
              >
                {DIET_TAGS[t].label}
              </button>
            );
          })}
        </div>

        {!isSearching && (
          <nav className="no-scrollbar flex gap-5 overflow-x-auto border-t border-line px-5">
            {categories.map((c) => {
              const on = c.id === activeCat;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    chipRefs.current[c.id] = el;
                  }}
                  type="button"
                  onClick={() => jumpTo(c.id)}
                  className={`relative shrink-0 whitespace-nowrap py-3 text-sm font-semibold transition-colors ${
                    on ? "text-cream" : "text-muted"
                  }`}
                >
                  {c.name}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent transition-opacity ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {isSearching ? (
        <section className="px-5">
          <p className="pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {visible.length === 0
              ? "Sin resultados"
              : `${visible.length} ${visible.length === 1 ? "plato" : "platos"}`}
          </p>
          <ul className="divide-y divide-line">
            {visible.map((d) => (
              <li key={d.id}>
                <DishCard dish={d} href={dishHref(d.id)} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="pt-6">
              <h2 className="px-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Los más pedidos
              </h2>
              <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-5">
                {featured.map((d) => (
                  <DishCard
                    key={d.id}
                    dish={d}
                    href={dishHref(d.id)}
                    variant="featured"
                  />
                ))}
              </div>
            </section>
          )}

          {categories.map((c) => {
            const items = dishes.filter((d) => d.categoryId === c.id);
            if (items.length === 0) return null;
            return (
              <section
                key={c.id}
                id={`cat-${c.id}`}
                ref={(el) => {
                  sectionRefs.current[c.id] = el;
                }}
                className="px-5 pt-8"
              >
                <h2 className="font-display text-2xl text-cream">{c.name}</h2>
                <ul className="mt-1 divide-y divide-line">
                  {items.map((d) => (
                    <li key={d.id}>
                      <DishCard dish={d} href={dishHref(d.id)} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
