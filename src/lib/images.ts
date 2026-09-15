// Miniaturas: para listas del panel pedimos la imagen chica directo a la
// fuente (Unsplash acepta ?w=) y salteamos el optimizador, que agrega una
// petición al servidor por cada foto.
export function thumb(url: string, w = 120): string {
  try {
    const u = new URL(url);
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", String(w));
      u.searchParams.set("q", "60");
      return u.toString();
    }
  } catch {}
  return url;
}
