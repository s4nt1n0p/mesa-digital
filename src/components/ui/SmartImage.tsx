"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// Foto con skeleton: muestra un brillo animado hasta que la imagen carga y
// después la funde. En 4G evita los huecos vacíos mientras llegan las fotos.
export function SmartImage({ className = "", ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="skeleton absolute inset-0" aria-hidden="true" />
      )}
      <Image
        {...props}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
