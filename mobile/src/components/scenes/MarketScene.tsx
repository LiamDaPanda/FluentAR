import React, { useMemo } from "react";
import Tutor from "./Tutor";

function FruitCrate({
  position,
  fruitColor,
  count = 9,
  fruitRadius = 0.07,
}: {
  position: [number, number, number];
  fruitColor: string;
  count?: number;
  fruitRadius?: number;
}) {
  const fruits = useMemo(() => {
    const out: { x: number; y: number; z: number; r: number }[] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      out.push({
        x: -0.18 + col * 0.18,
        y: 0.12 + (row > 0 ? row * 0.05 : 0) + Math.random() * 0.01,
        z: -0.15 + row * 0.15,
        r: fruitRadius * (0.9 + Math.random() * 0.2),
      });
    }
    return out;
  }, [count, fruitRadius]);
  return (
    <group position={position}>
      {/* crate */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.16, 0.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.95} />
      </mesh>
      {/* slats */}
      {[-0.05, 0.05].map((y, i) => (
        <mesh key={i} position={[0, 0.08 + y * 1.6, 0.26]}>
          <boxGeometry args={[0.62, 0.025, 0.02]} />
          <meshStandardMaterial color="#451a03" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[-0.31, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.18, 0.5]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[0.31, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.18, 0.5]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* fruit */}
      {fruits.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]} castShadow>
          <sphereGeometry args={[f.r, 16, 16]} />
          <meshStandardMaterial color={fruitColor} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Awning() {
  const stripes = 10;
  return (
    <group position={[0, 2.7, 0.5]}>
      {/* horizontal beam */}
      <mesh position={[0, 0.05, -0.4]} castShadow>
        <boxGeometry args={[4.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* posts */}
      <mesh position={[-2, -1.0, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 12]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[2, -1.0, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 12]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* awning fabric — striped */}
      {Array.from({ length: stripes }).map((_, i) => (
        <mesh
          key={i}
          position={[-1.85 + i * 0.41, 0.15, 0.1]}
          rotation={[-Math.PI / 7, 0, 0]}
          castShadow
        >
          <planeGeometry args={[0.4, 1.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#dc2626" : "#fef9c3"} side={2} roughness={0.85} />
        </mesh>
      ))}
      {/* awning trim — scallops */}
      {Array.from({ length: stripes }).map((_, i) => (
        <mesh key={`s${i}`} position={[-1.85 + i * 0.41, -0.43, 0.66]}>
          <coneGeometry args={[0.18, 0.18, 12, 1]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#dc2626" : "#fef9c3"} />
        </mesh>
      ))}
    </group>
  );
}

function HangingChiles({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.6, 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 1.3) * 0.04,
            0.05 - i * 0.07,
            Math.sin(i * 1.3) * 0.04,
          ]}
          rotation={[Math.PI, Math.cos(i) * 0.3, Math.sin(i) * 0.5]}
          castShadow
        >
          <coneGeometry args={[0.025, 0.12, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Bread({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, Math.random() * 0.5, 0]} castShadow>
      <capsuleGeometry args={[0.07, 0.14, 6, 12]} />
      <meshStandardMaterial color="#d6a36a" roughness={0.95} />
    </mesh>
  );
}

function Sign() {
  return (
    <group position={[0, 2.05, -1.95]}>
      <mesh castShadow>
        <boxGeometry args={[2, 0.5, 0.05]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, -0.026]}>
        <boxGeometry args={[2.05, 0.55, 0.04]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      {/* faux text — three colored bars */}
      <mesh position={[-0.65, 0, 0.03]}>
        <boxGeometry args={[0.3, 0.18, 0.005]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      <mesh position={[-0.25, 0, 0.03]}>
        <boxGeometry args={[0.3, 0.18, 0.005]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      <mesh position={[0.15, 0, 0.03]}>
        <boxGeometry args={[0.3, 0.18, 0.005]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      <mesh position={[0.55, 0, 0.03]}>
        <boxGeometry args={[0.3, 0.18, 0.005]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
    </group>
  );
}

export default function MarketScene() {
  return (
    <group>
      <ambientLight intensity={0.7} color="#fff8e0" />
      <hemisphereLight args={["#bae6fd", "#a16207", 0.5]} />
      <directionalLight
        position={[3, 6, 2]}
        intensity={1.3}
        color="#fff5d9"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 2, 1]} color="#fff1d6" intensity={0.4} distance={6} decay={2} />

      {/* cobblestone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>
      {/* stone joints */}
      {[...Array(10)].map((_, i) => (
        <mesh key={`r${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -4 + i * 0.9]}>
          <planeGeometry args={[14, 0.025]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
      ))}
      {[...Array(10)].map((_, i) => (
        <mesh
          key={`c${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-4 + i * 0.9, 0.001, ((i % 2) - 0.5) * 0.45]}
        >
          <planeGeometry args={[0.025, 14]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
      ))}

      {/* back wall — terracotta */}
      <mesh position={[0, 2.2, -2.2]} receiveShadow>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#b85c38" roughness={0.95} />
      </mesh>
      {/* mortar lines suggesting brick */}
      {[0.4, 1.2, 2.0, 2.8, 3.6].map((y, i) => (
        <mesh key={i} position={[0, y, -2.18]}>
          <boxGeometry args={[14, 0.04, 0.02]} />
          <meshStandardMaterial color="#7c2d12" />
        </mesh>
      ))}

      {/* awning */}
      <Awning />

      {/* counter / stall table */}
      <mesh position={[0, 0.5, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.0, 1.0]} />
        <meshStandardMaterial color="#7c4a2c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.02, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[3.7, 0.04, 1.05]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.85} />
      </mesh>
      {/* counter front planks */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 1.0]}>
          <boxGeometry args={[0.5, 0.95, 0.03]} />
          <meshStandardMaterial color={i % 2 ? "#7c4a2c" : "#5b3a1f"} />
        </mesh>
      ))}

      {/* fruit crates on counter */}
      <FruitCrate position={[-1.2, 1.04, 0.5]} fruitColor="#dc2626" />
      <FruitCrate position={[-0.4, 1.04, 0.5]} fruitColor="#f59e0b" />
      <FruitCrate position={[0.4, 1.04, 0.5]} fruitColor="#fde047" />
      <FruitCrate position={[1.2, 1.04, 0.5]} fruitColor="#7c2d12" fruitRadius={0.06} />

      {/* bread basket on counter */}
      <group position={[1.55, 1.07, 0.65]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.1, 16]} />
          <meshStandardMaterial color="#92400e" roughness={0.95} />
        </mesh>
        <Bread position={[0, 0.1, 0.05]} />
        <Bread position={[0.05, 0.1, -0.05]} />
        <Bread position={[-0.05, 0.13, 0]} />
      </group>

      {/* hanging chiles */}
      <HangingChiles position={[-1.6, 2.4, -0.3]} />
      <HangingChiles position={[1.6, 2.4, -0.3]} />

      {/* sign */}
      <Sign />

      {/* potted plants on the floor flanking */}
      <group position={[-2.7, 0, 0.6]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.36, 16]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.95} />
        </mesh>
        {[...Array(6)].map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.14, 0.6, Math.sin(a) * 0.14]}
              rotation={[Math.cos(a) * 0.5, a, Math.sin(a) * 0.5]}
              castShadow
            >
              <coneGeometry args={[0.07, 0.55, 8]} />
              <meshStandardMaterial color={i % 2 ? "#15803d" : "#16a34a"} roughness={0.9} />
            </mesh>
          );
        })}
      </group>
      <group position={[2.7, 0, 0.6]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.36, 16]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.95} />
        </mesh>
        {[...Array(6)].map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.14, 0.6, Math.sin(a) * 0.14]}
              rotation={[Math.cos(a) * 0.5, a, Math.sin(a) * 0.5]}
              castShadow
            >
              <coneGeometry args={[0.07, 0.55, 8]} />
              <meshStandardMaterial color={i % 2 ? "#15803d" : "#16a34a"} roughness={0.9} />
            </mesh>
          );
        })}
      </group>

      {/* shopkeeper tutor behind counter */}
      <Tutor
        position={[0, 1.05, 0]}
        skin="#d4a373"
        shirt="#fef3c7"
        hair="#3a2417"
        apron="#15803d"
        speaking
      />
    </group>
  );
}
