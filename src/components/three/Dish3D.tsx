"use client";

import dynamic from "next/dynamic";
import type { Dish } from "@/lib/types";

// Los visores 3D se cargan solo en el cliente y solo en las fichas que los usan,
// para no cargar Three.js en el resto del menú.
const loading = () => (
  <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface" />
);

const BurgerExploded = dynamic(() => import("./BurgerExploded"), {
  ssr: false,
  loading,
});

const GlbViewer = dynamic(() => import("./GlbViewer"), { ssr: false, loading });

export function Dish3D({ model }: { model: NonNullable<Dish["model3d"]> }) {
  if (model === "burger-explode") return <BurgerExploded />;
  return <GlbViewer url={model.glb} />;
}
