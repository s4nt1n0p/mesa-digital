import type { DietTag, Dish, Menu } from "@/lib/types";
import { fuegoLento } from "@/data/fuego-lento";

// Único punto de acceso a los datos del menú. En la etapa 2 estas funciones
// pasan a consultar Supabase sin que las pantallas cambien.

const menus: Record<string, Menu> = {
  [fuegoLento.restaurant.slug]: fuegoLento,
};

export function getMenu(slug: string): Menu | null {
  return menus[slug] ?? null;
}

export function getDish(slug: string, dishId: string): Dish | null {
  return getMenu(slug)?.dishes.find((d) => d.id === dishId) ?? null;
}

export const DIET_TAGS: Record<DietTag, { label: string; short: string }> = {
  vegano: { label: "Vegano", short: "VG" },
  vegetariano: { label: "Vegetariano", short: "V" },
  "sin-gluten": { label: "Sin gluten", short: "SG" },
  "sin-lactosa": { label: "Sin lactosa", short: "SL" },
  picante: { label: "Picante", short: "🌶" },
  mani: { label: "Contiene maní", short: "🥜" },
};

// Filtros que el comensal puede activar. "picante" y "mani" son avisos, no
// preferencias, así que no se filtran por ellos.
export const FILTERABLE_TAGS: DietTag[] = [
  "vegetariano",
  "vegano",
  "sin-gluten",
  "sin-lactosa",
];

export function formatPrice(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}
