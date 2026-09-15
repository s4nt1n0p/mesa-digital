"use client";

import { useEffect, useState } from "react";

// Aviso cuando el celular pierde conexión. En un salón pasa seguido.
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-transform duration-300 ${
        offline ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="m-2 flex items-center gap-2 rounded-full bg-chili px-4 py-2 text-xs font-semibold text-cream shadow-lg">
        <span className="size-2 animate-pulse rounded-full bg-cream" />
        Sin conexión · la carta sigue visible, pero no se pueden enviar pedidos
      </div>
    </div>
  );
}
