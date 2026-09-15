"use client";

import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense } from "react";

// Visor genérico para modelos .glb reales (escaneados o modelados).
// Centra y escala el modelo automáticamente, con zoom y rotación táctil.

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function GlbViewer({ url }: { url: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 3], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 5, 3]} intensity={1.4} color="#ffe4c2" />
          <Bounds fit clip observe margin={1.15}>
            <Center>
              <Model url={url} />
            </Center>
          </Bounds>
          <ContactShadows position={[0, -0.6, 0]} opacity={0.5} scale={5} blur={2.5} far={2} />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          zoomSpeed={0.8}
          minDistance={1.2}
          maxDistance={6}
          autoRotate
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-1 text-[10px] font-semibold tracking-wider text-accent backdrop-blur">
        3D · girá y hacé zoom
      </span>
    </div>
  );
}
