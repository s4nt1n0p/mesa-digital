import Image from "next/image";
import Link from "next/link";
import type { Dish } from "@/lib/types";
import { formatPrice } from "@/lib/menu";
import { DietBadges } from "./DietBadges";

type Props = {
  dish: Dish;
  href: string;
  variant?: "row" | "featured";
};

export function DishCard({ dish, href, variant = "row" }: Props) {
  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="group relative block w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-surface"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="256px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          {dish.model3d && (
            <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-1 text-[10px] font-semibold tracking-wider text-accent backdrop-blur">
              3D
            </span>
          )}
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
      className={`group flex gap-4 py-4 ${dish.available ? "" : "opacity-45"}`}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        {dish.model3d && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-accent backdrop-blur">
            3D
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-[17px] leading-snug text-cream">
          {dish.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {dish.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-cream">
            {dish.available ? formatPrice(dish.price) : "Agotado"}
          </span>
          <DietBadges tags={dish.tags} />
        </div>
      </div>
    </Link>
  );
}
