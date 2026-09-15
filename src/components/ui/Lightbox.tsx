"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Foto a pantalla completa con pellizco para zoom, arrastre y doble toque.
// Implementado a mano con pointer events para no sumar dependencias.
export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ dist: number; scale: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const pts = () => [...pointers.current.values()];
  const center = () => {
    const p = pts();
    return {
      cx: p.reduce((s, q) => s + q.x, 0) / p.length,
      cy: p.reduce((s, q) => s + q.y, 0) / p.length,
    };
  };
  const dist = () => {
    const [a, b] = pts();
    return b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { cx, cy } = center();
    start.current = { dist: dist(), scale: t.scale, x: t.x, y: t.y, cx, cy };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !start.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = start.current;
    const { cx, cy } = center();
    let scale = s.scale;
    if (pointers.current.size >= 2 && s.dist > 0) {
      scale = Math.min(5, Math.max(1, (s.scale * dist()) / s.dist));
    }
    setT({ scale, x: s.x + (cx - s.cx), y: s.y + (cy - s.cy) });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      start.current = null;
      // doble toque: alterna entre 1x y 2.5x
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setT((p) => (p.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 }));
      }
      lastTap.current = now;
      // si quedó en 1x, vuelve al centro
      setT((p) => (p.scale <= 1 ? { scale: 1, x: 0, y: 0 } : p));
    } else {
      const { cx, cy } = center();
      start.current = { dist: dist(), scale: t.scale, x: t.x, y: t.y, cx, cy };
    }
  };

  return (
    <div
      role="dialog"
      aria-label={alt}
      className="fixed inset-0 z-40 bg-ink"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          transition: pointers.current.size ? "none" : "transform 0.2s ease-out",
        }}
      >
        <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" priority />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-surface/80 text-cream backdrop-blur"
      >
        ✕
      </button>
      <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-muted">
        Pellizcá para hacer zoom · doble toque para acercar
      </p>
    </div>
  );
}
