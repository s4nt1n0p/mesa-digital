"use client";

import dynamic from "next/dynamic";
import type { Dish } from "@/lib/types";

// El visor 3D se carga solo en el cliente y solo en las fichas que lo usan,
// para no cargar Three.js en el resto del menú.
const BurgerExploded = dynamic(() => import("./BurgerExploded"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface" />
  ),
});

export function Dish3D({ model }: { model: NonNullable<Dish["model3d"]> }) {
  if (model === "burger-explode") return <BurgerExploded />;
  // Modelos .glb reales: se integran con <model-viewer> en la etapa 2.
  return null;
}
