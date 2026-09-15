import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
        Mesa Digital
      </p>
      <h1 className="mt-3 max-w-sm font-display text-4xl leading-tight text-cream">
        Tu carta, en el celular de cada mesa.
      </h1>
      <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">
        Sin app para descargar, sin hardware, sin comisión por pedido. El cliente
        escanea el QR y pide.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/menu/fuego-lento?mesa=5"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink"
        >
          Ver la carta · mesa 5
        </Link>
        <Link
          href="/panel"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-cream"
        >
          Panel del local
        </Link>
      </div>
    </main>
  );
}
