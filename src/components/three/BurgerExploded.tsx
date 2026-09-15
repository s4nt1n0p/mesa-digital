"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Hamburguesa procedural por capas. Cada ingrediente es una pieza separada, lo
// que permite la vista explotada. Sirve de demo hasta tener un .glb modelado.

type LayerProps = { explode: number; index: number; restY: number };

const GAP = 0.42; // separación entre capas en la vista explotada

function useLayerY(ref: React.RefObject<THREE.Group | null>, p: LayerProps) {
  useFrame(() => {
    if (!ref.current) return;
    const target = p.restY + p.index * GAP * p.explode;
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      target,
      0.12,
    );
  });
}

function latheFromProfile(points: [number, number][]) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    48,
  );
}

const BUN = "#d99a4e";
const BUN_DARK = "#b97a35";

function BottomBun(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  const geo = useMemo(
    () =>
      latheFromProfile([
        [0, 0],
        [0.9, 0],
        [1.0, 0.06],
        [1.02, 0.2],
        [0.96, 0.32],
        [0.7, 0.38],
        [0, 0.4],
      ]),
    [],
  );
  return (
    <group ref={ref} position-y={p.restY}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={BUN_DARK} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Patty(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  return (
    <group ref={ref} position-y={p.restY}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 0.94, 0.3, 40]} />
        <meshStandardMaterial color="#4b2a1b" roughness={0.95} />
      </mesh>
      {/* borde irregular, como carne a la plancha */}
      <mesh position-y={0.02} rotation-y={0.4}>
        <torusGeometry args={[0.95, 0.09, 10, 40]} />
        <meshStandardMaterial color="#3a1f13" roughness={1} />
      </mesh>
    </group>
  );
}

function Cheese(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  return (
    <group ref={ref} position-y={p.restY} rotation-y={Math.PI / 4}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.06, 1.75]} />
        <meshStandardMaterial color="#f2b532" roughness={0.5} />
      </mesh>
      {/* puntas caídas del queso */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 1.15,
            -0.08,
            Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 1.15,
          ]}
          rotation={[0, -((i * Math.PI) / 2 + Math.PI / 4), 0]}
        >
          <boxGeometry args={[0.28, 0.06, 0.22]} />
          <meshStandardMaterial color="#f2b532" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Bacon(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  return (
    <group ref={ref} position-y={p.restY}>
      {[-0.3, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation-y={i ? 0.25 : -0.2} castShadow>
          <boxGeometry args={[1.7, 0.05, 0.38]} />
          <meshStandardMaterial color="#9a3b2a" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Tomato(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  return (
    <group ref={ref} position-y={p.restY}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.88, 0.88, 0.1, 40]} />
        <meshStandardMaterial color="#cf3a2c" roughness={0.45} />
      </mesh>
      <mesh position-y={0.051}>
        <ringGeometry args={[0.55, 0.8, 40]} />
        <meshStandardMaterial color="#e8604f" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Onion(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  return (
    <group ref={ref} position-y={p.restY}>
      {[
        [0.2, 0.1, 0.55],
        [-0.35, -0.2, 0.42],
        [0.1, -0.45, 0.3],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0, z]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[r, 0.04, 8, 32]} />
          <meshStandardMaterial color="#efe6f5" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Lettuce(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  const geo = useMemo(() => {
    // disco ondulado: desplazamos el borde para que parezca hoja
    const g = new THREE.CylinderGeometry(1.12, 1.05, 0.08, 48, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r > 0.9) {
        const a = Math.atan2(z, x);
        pos.setY(i, pos.getY(i) + Math.sin(a * 7) * 0.07);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group ref={ref} position-y={p.restY}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#6faa4b" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

function TopBun(p: LayerProps) {
  const ref = useRef<THREE.Group>(null);
  useLayerY(ref, p);
  const geo = useMemo(
    () =>
      latheFromProfile([
        [0, 0],
        [1.0, 0],
        [1.04, 0.1],
        [1.0, 0.3],
        [0.86, 0.5],
        [0.6, 0.66],
        [0.3, 0.74],
        [0, 0.76],
      ]),
    [],
  );
  const seeds = useMemo(() => {
    const out: [number, number, number, number][] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 34; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 0.85;
      // altura aproximada del domo en ese radio
      const y = 0.76 - 0.55 * (r / 1) ** 2 - 0.1 * (r / 1) ** 4;
      out.push([Math.cos(a) * r, y, Math.sin(a) * r, rnd() * Math.PI]);
    }
    return out;
  }, []);
  return (
    <group ref={ref} position-y={p.restY}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={BUN} roughness={0.8} />
      </mesh>
      {seeds.map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.3, rot, 0]} scale={[1, 0.5, 0.6]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#f5e6c4" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Burger({ explode }: { explode: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25;
  });
  // Capas de abajo hacia arriba con su altura en reposo.
  const layers = [
    { C: BottomBun, restY: 0 },
    { C: Patty, restY: 0.53 },
    { C: Cheese, restY: 0.72 },
    { C: Bacon, restY: 0.78 },
    { C: Tomato, restY: 0.87 },
    { C: Onion, restY: 0.96 },
    { C: Lettuce, restY: 1.04 },
    { C: TopBun, restY: 1.1 },
  ];
  return (
    <group ref={group} position-y={-0.9}>
      {layers.map(({ C, restY }, i) => (
        <C key={i} index={i} restY={restY} explode={explode} />
      ))}
    </group>
  );
}

export default function BurgerExploded() {
  const [exploded, setExploded] = useState(false);
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 5.2], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#ffe4c2"
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#e0a458" />
        <pointLight position={[0, -1, 3]} intensity={0.4} />
        <Burger explode={exploded ? 1 : 0} />
        <ContactShadows
          position={[0, -0.95, 0]}
          opacity={0.6}
          scale={6}
          blur={2.4}
          far={3}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>

      <button
        type="button"
        onClick={() => setExploded((v) => !v)}
        aria-pressed={exploded}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-ink/80 px-4 py-2 text-xs font-semibold text-cream backdrop-blur transition-colors active:bg-surface-2"
      >
        {exploded ? "Armar" : "Ver por dentro"}
      </button>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-2 py-1 text-[10px] font-semibold tracking-wider text-accent backdrop-blur">
        3D · girá con el dedo
      </span>
    </div>
  );
}
