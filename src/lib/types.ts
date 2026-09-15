// Modelo de datos del menú. Hoy se alimenta de src/data (demo local);
// en la etapa 2 estas mismas formas salen de Supabase.

export type DietTag =
  | "vegano"
  | "vegetariano"
  | "sin-gluten"
  | "sin-lactosa"
  | "picante"
  | "mani";

export type Restaurant = {
  slug: string;
  name: string;
  tagline: string;
  coverImage: string;
  /** Color de acento del local (hex). Cada restaurante configura el suyo. */
  accent: string;
  /** Tiempo estimado de espera por defecto, en minutos. */
  defaultWaitMinutes: number;
};

export type Category = {
  id: string;
  name: string;
  order: number;
};

export type Dish = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  /** Precio en pesos argentinos, entero. */
  price: number;
  image: string;
  tags: DietTag[];
  /** Minutos estimados; si falta se usa el del restaurante. */
  waitMinutes?: number;
  available: boolean;
  /** Los más pedidos aparecen en la sección de recomendados. */
  featured?: boolean;
  /** Modelo 3D. "burger-explode" es el modelo procedural de demo; después, un .glb. */
  model3d?: "burger-explode" | { glb: string };
};

export type Menu = {
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
};
