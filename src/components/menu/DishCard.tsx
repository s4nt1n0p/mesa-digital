import Link from "next/link";
import { ViewTransition } from "react";
import type { Dish } from "@/lib/types";
import { formatPrice } from "@/lib/menu";
import { SmartImage } from "@/components/ui/SmartImage";
import { DietBadges } from "./DietBadges";

type Props = {
  dish: Dish;
  href: string;
  variant?: "card" | "featured";
};

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${className}`}
    >
      {children}
    </span>
  );
}

const LABELS = {
  nuevo: { text: "Nuevo", cls: "bg-accent text-ink" },
  recomendado: { text: "Recomendado", cls: "bg-cream text-ink" },
};

function Overlays({ dish }: { dish: Dish }) {
  return (
    <>
      <div className="absolute left-2.5 top-2.5 flex gap-1.5">
        {dish.label && (
          <Pill className={LABELS[dish.label].cls}>{LABELS[dish.label].text}</Pill>
        )}
        {dish.model3d && <Pill className="bg-ink/70 text-accent">3D</Pill>}
      </div>
      {!dish.available && (
        <Pill className="absolute right-2.5 top-2.5 bg-ink/80 text-muted">
          Agotado
        </Pill>
      )}
    </>
  );
}

export function DishCard({ dish, href, variant = "card" }: Props) {
  const transitionName = `dish-${dish.id}`;

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="group relative block w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-surface transition-transform duration-200 active:scale-[0.97]"
      >
        <ViewTransition name={transitionName}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <SmartImage
              src={dish.image}
              alt={dish.name}
              fill
              sizes="256px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          </div>
        </ViewTransition>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <Overlays dish={dish} />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="line-clamp-2 font-display text-lg leading-tight text-cream">
            {dish.name}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-base font-bold text-accent">
              {formatPrice(dish.price)}
            </span>
            <DietBadges tags={dish.tags} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-line/60 bg-surface transition-[transform,border-color] duration-200 active:scale-[0.97] active:border-accent/40 ${
        dish.available ? "" : "opacity-45"
      }`}
    >
      <div className="relative">
        <ViewTransition name={transitionName}>
          <div className="relative aspect-[5/4] overflow-hidden">
            <SmartImage
              src={dish.image}
              alt={dish.name}
              fill
              sizes="(max-width: 512px) 50vw, 240px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          </div>
        </ViewTransition>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
        <Overlays dish={dish} />
      </div>
      <div className="flex flex-1 flex-col p-3 pt-2.5">
        <h3 className="line-clamp-2 font-display text-[16px] leading-snug text-cream [text-wrap:balance]">
          {dish.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {dish.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-[15px] font-bold text-accent">
            {formatPrice(dish.price)}
          </span>
          <DietBadges tags={dish.tags} />
        </div>
      </div>
    </Link>
  );
}
