"use client";

import { ViewTransition } from "react";
import { useRef, useState } from "react";
import type { Dish } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Lightbox } from "@/components/ui/Lightbox";
import { Dish3D } from "@/components/three/Dish3D";

// Cabecera de la ficha: foto (tocar para ampliar) y, si hay modelo, el visor 3D
// como segunda página. Se cambia deslizando o con las pestañas.
export function DishMedia({ dish }: { dish: Dish }) {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const has3d = Boolean(dish.model3d);

  const goTo = (i: number) => {
    setPage(i);
    scroller.current?.scrollTo({
      left: i * (scroller.current?.clientWidth ?? 0),
      behavior: "smooth",
    });
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Ampliar la foto"
          className="relative aspect-[4/3] w-full shrink-0 snap-start"
        >
          <ViewTransition name={`dish-${dish.id}`}>
            <div className="relative h-full w-full overflow-hidden">
              <SmartImage
                src={dish.image}
                alt={dish.name}
                fill
                priority
                sizes="512px"
                className="object-cover"
              />
            </div>
          </ViewTransition>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        </button>

        {has3d && dish.model3d && (
          <div className="relative aspect-[4/3] w-full shrink-0 snap-start bg-surface">
            <div className="absolute inset-0 [&>div]:h-full [&>div]:rounded-none [&>div]:aspect-auto">
              <Dish3D model={dish.model3d} />
            </div>
          </div>
        )}
      </div>

      {has3d && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-ink/70 p-1 backdrop-blur">
          {["Foto", "3D"].map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goTo(i)}
              aria-pressed={page === i}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                page === i ? "bg-cream text-ink" : "text-cream/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {zoom && <Lightbox src={dish.image} alt={dish.name} onClose={() => setZoom(false)} />}
    </div>
  );
}
