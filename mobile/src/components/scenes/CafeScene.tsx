import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import Tutor from "./Tutor";

function Cup({ position, color = "#f5f5f4" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.12, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0.085, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.025, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  );
}

function PendantLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1.2, 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh castShadow>
        <coneGeometry args={[0.18, 0.22, 16, 1, true]} />
        <meshStandardMaterial color="#1e293b" side={2} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#fff7d6"
          emissive="#ffd87a"
          emissiveIntensity={1.4}
          roughness={0.2}
        />
      </mesh>
      <pointLight position={[0, -0.1, 0]} color="#ffcc88" intensity={1.2} distance={4} decay={2} castShadow />
    </group>
  );
}

function EspressoMachine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.45]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[-0.18, 0.25, 0.23]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.18, 0.25, 0.23]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.18, 0.18, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.18, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* small status light */}
      <mesh position={[0.25, 0.45, 0.226]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Steam({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + ((t * 0.3) % 0.6);
    const a = 1 - ((t * 0.3) % 0.6) / 0.6;
    (ref.current.material as any).opacity = a * 0.35;
    ref.current.scale.setScalar(0.3 + ((t * 0.3) % 0.6) * 0.7);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
    </mesh>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.36, 16]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.9} />
      </mesh>
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.12, 0.55 + Math.sin(i) * 0.1, Math.sin(a) * 0.12]}
            rotation={[Math.cos(a) * 0.4, a, Math.sin(a) * 0.4]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.5, 8]} />
            <meshStandardMaterial color={i % 2 ? "#15803d" : "#16a34a"} roughness={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

function ShelfWithCups({ y, count = 6 }: { y: number; count?: number }) {
  const cups = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: -1.2 + i * (2.4 / Math.max(1, count - 1)),
        color: ["#f5f5f4", "#fef3c7", "#fde68a", "#bfdbfe", "#fed7aa", "#fecaca"][i % 6],
      })),
    [count]
  );
  return (
    <group position={[0, y, -1.95]}>
      <mesh castShadow>
        <boxGeometry args={[2.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.8} />
      </mesh>
      {cups.map((c, i) => (
        <Cup key={i} position={[c.x, 0.1, 0]} color={c.color} />
      ))}
    </group>
  );
}

export default function CafeScene() {
  return (
    <group>
      <ambientLight intensity={0.5} color="#fff1d6" />
      <hemisphereLight args={["#fff1d6", "#3a2417", 0.4]} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={0.9}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* warm window light from camera-right */}
      <pointLight position={[3.5, 2, 1.5]} color="#ffd9a3" intensity={1.1} distance={8} decay={2} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#3d2817" roughness={0.85} />
      </mesh>
      {/* floor plank lines */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -3 + i * 0.85]}>
          <planeGeometry args={[14, 0.02]} />
          <meshStandardMaterial color="#231405" />
        </mesh>
      ))}

      {/* back wall */}
      <mesh position={[0, 2.2, -2.2]} receiveShadow>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#7a5a3c" roughness={0.95} />
      </mesh>
      {/* wall trim */}
      <mesh position={[0, 0.3, -2.18]}>
        <boxGeometry args={[14, 0.15, 0.04]} />
        <meshStandardMaterial color="#3a2417" />
      </mesh>

      {/* shelves with cups */}
      <ShelfWithCups y={2.7} />
      <ShelfWithCups y={3.3} count={5} />

      {/* counter */}
      <mesh position={[0, 0.55, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.1, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* counter top */}
      <mesh position={[0, 1.13, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[3.7, 0.06, 0.9]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.5} />
      </mesh>
      {/* counter wood front trim */}
      <mesh position={[0, 0.55, 0.99]}>
        <boxGeometry args={[3.6, 1.05, 0.02]} />
        <meshStandardMaterial color="#3a2417" />
      </mesh>

      {/* espresso machine + steam */}
      <EspressoMachine position={[0.95, 1.16, 0.4]} />
      <Steam position={[0.77, 1.45, 0.55]} />
      <Steam position={[1.13, 1.5, 0.55]} />

      {/* cups on counter */}
      <Cup position={[-0.35, 1.22, 0.7]} color="#fef3c7" />
      <Cup position={[-0.6, 1.22, 0.5]} color="#fed7aa" />

      {/* small chalkboard menu */}
      <group position={[-1.5, 2, -2.15]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.8, 0.04]} />
          <meshStandardMaterial color="#1a2e1f" roughness={0.95} />
        </mesh>
        {[0.22, 0.05, -0.12].map((y, i) => (
          <mesh key={i} position={[-0.35 + (i % 2) * 0.15, y, 0.025]}>
            <boxGeometry args={[0.4, 0.02, 0.005]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        ))}
        {/* frame */}
        <mesh>
          <boxGeometry args={[1.18, 0.88, 0.03]} />
          <meshStandardMaterial color="#5b3a1f" />
        </mesh>
      </group>

      {/* pendant lights */}
      <PendantLight position={[-1.2, 3.4, 0.5]} />
      <PendantLight position={[1.2, 3.4, 0.5]} />

      {/* plant in corner */}
      <Plant position={[2.4, 0, 0.2]} />

      {/* tutor behind counter */}
      <Tutor position={[0, 1.1, 0]} skin="#e8b89c" shirt="#0f172a" hair="#3a2417" apron="#7a4a2c" speaking />
    </group>
  );
}
