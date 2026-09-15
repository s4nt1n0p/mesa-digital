import Image from "next/image";
import Link from "next/link";
import type { Dish } from "@/lib/types";
import { formatPrice } from "@/lib/menu";
import { DietBadges } from "./DietBadges";

type Props = {
  dish: Dish;
  href: string;
  variant?: "card" | "featured";
};

function Badge3D({ className = "" }: { className?: string }) {
  return (
    <span
      className={`rounded-full bg-ink/70 px-2 py-1 text-[10px] font-semibold tracking-wider text-accent backdrop-blur ${className}`}
    >
      3D
    </span>
  );
}

export function DishCard({ dish, href, variant = "card" }: Props) {
  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="group relative block w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-surface transition-transform duration-200 active:scale-[0.97]"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="256px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          {dish.model3d && <Badge3D className="absolute right-3 top-3" />}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-display text-lg leading-tight text-cream">
              {dish.name}
            </h3>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-accent">
                {formatPrice(dish.price)}
              </span>
              <DietBadges tags={dish.tags} />
            </div>
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
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="(max-width: 512px) 50vw, 240px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
        {dish.model3d && <Badge3D className="absolute left-2.5 top-2.5" />}
        {!dish.available && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted backdrop-blur">
            Agotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 pt-2.5">
        <h3 className="font-display text-[16px] leading-snug text-cream">
          {dish.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {dish.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-sm font-semibold text-cream">
            {formatPrice(dish.price)}
          </span>
          <DietBadges tags={dish.tags} />
        </div>
      </div>
    </Link>
  );
}
