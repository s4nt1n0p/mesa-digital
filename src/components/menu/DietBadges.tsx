import type { DietTag } from "@/lib/types";
import { DIET_TAGS } from "@/lib/menu";

const tone: Record<DietTag, string> = {
  vegano: "border-sage/40 text-sage",
  vegetariano: "border-sage/40 text-sage",
  "sin-gluten": "border-cream/25 text-cream/80",
  "sin-lactosa": "border-cream/25 text-cream/80",
  picante: "border-chili/50 text-chili",
  mani: "border-accent/50 text-accent",
};

export function DietBadges({
  tags,
  size = "sm",
}: {
  tags: DietTag[];
  size?: "sm" | "md";
}) {
  if (tags.length === 0) return null;
  const cls =
    size === "sm"
      ? "h-[22px] min-w-[22px] px-1.5 text-[11px]"
      : "h-7 px-2.5 text-xs gap-1.5";
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Indicadores">
      {tags.map((t) => (
        <li
          key={t}
          title={DIET_TAGS[t].label}
          aria-label={DIET_TAGS[t].label}
          className={`inline-flex items-center justify-center rounded-full border font-semibold tracking-wide ${cls} ${tone[t]}`}
        >
          {size === "sm" ? DIET_TAGS[t].short : DIET_TAGS[t].label}
        </li>
      ))}
    </ul>
  );
}
