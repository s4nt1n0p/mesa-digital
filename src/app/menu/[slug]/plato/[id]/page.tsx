import Link from "next/link";
import { notFound } from "next/navigation";
import { getDish, getMenu, formatPrice } from "@/lib/menu";
import { DietBadges } from "@/components/menu/DietBadges";
import { DishMedia } from "@/components/menu/DishMedia";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

type Props = {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ mesa?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, id } = await params;
  const dish = getDish(slug, id);
  return { title: dish ? dish.name : "Mesa Digital" };
}

export default async function DishPage({ params, searchParams }: Props) {
  const { slug, id } = await params;
  const { mesa } = await searchParams;
  const menu = getMenu(slug);
  const dish = getDish(slug, id);
  if (!menu || !dish) notFound();

  const { restaurant } = menu;
  const category = menu.categories.find((c) => c.id === dish.categoryId);
  const backHref = `/menu/${slug}${mesa ? `?mesa=${mesa}` : ""}`;
  const wait = dish.waitMinutes ?? restaurant.defaultWaitMinutes;

  return (
    <article
      className="mx-auto w-full max-w-lg pb-28"
      style={{ ["--accent" as string]: restaurant.accent }}
    >
      <OfflineBanner />

      <div className="relative">
        <DishMedia dish={dish} />
        <Link
          href={backHref}
          aria-label="Volver a la carta"
          className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-ink/60 text-cream backdrop-blur"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {mesa && (
          <div className="absolute right-4 top-4 rounded-full border border-line bg-ink/60 px-3 py-1.5 text-xs text-muted backdrop-blur">
            Mesa <span className="font-semibold text-cream">{mesa}</span>
          </div>
        )}
      </div>

      <div className="relative px-5 pt-5">
        {category && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            {category.name}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl leading-tight text-cream [text-wrap:balance]">
          {dish.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-2xl font-bold text-accent">
            {formatPrice(dish.price)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {wait} min aprox.
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-cream/85">
          {dish.description}
        </p>
        <div className="mt-4">
          <DietBadges tags={dish.tags} size="md" />
        </div>
      </div>

      {/* Barra de acción. En la etapa 3 este botón agrega al carrito. */}
      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink via-ink/95 to-transparent px-5 pb-5 pt-8">
        <div className="mx-auto max-w-lg">
          {dish.available ? (
            <button
              type="button"
              className="flex h-13 w-full items-center justify-between rounded-2xl bg-accent px-5 text-ink transition-transform active:scale-[0.98]"
            >
              <span className="font-semibold">Agregar al pedido</span>
              <span className="font-semibold">{formatPrice(dish.price)}</span>
            </button>
          ) : (
            <div className="flex h-13 w-full items-center justify-center rounded-2xl bg-surface-2 text-muted">
              Agotado por hoy
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
