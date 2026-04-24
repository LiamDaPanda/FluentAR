import React from "react";
import Tutor from "./Tutor";

function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.05, 0.55]} />
        <meshStandardMaterial color="#c89b6c" roughness={0.6} />
      </mesh>
      {/* legs */}
      {[
        [-0.4, -0.22],
        [0.4, -0.22],
        [-0.4, 0.22],
        [0.4, 0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* chair */}
      <mesh position={[0, 0.28, 0.5]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color="#7c3a1d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.7]} castShadow>
        <boxGeometry args={[0.4, 0.45, 0.04]} />
        <meshStandardMaterial color="#7c3a1d" roughness={0.7} />
      </mesh>
      {[
        [-0.18, 0.5],
        [0.18, 0.5],
        [-0.18, 0.7],
        [0.18, 0.7],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.13, z]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.28, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Chalkboard() {
  return (
    <group position={[0, 2.1, -2.18]}>
      {/* frame */}
      <mesh castShadow>
        <boxGeometry args={[5.2, 2.4, 0.04]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.9} />
      </mesh>
      {/* board surface */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[4.8, 2.05]} />
        <meshStandardMaterial color="#1f3b2c" roughness={0.95} />
      </mesh>
      {/* chalk dust at bottom */}
      <mesh position={[0, -1.05, 0.04]}>
        <boxGeometry args={[5.0, 0.08, 0.06]} />
        <meshStandardMaterial color="#3a2417" />
      </mesh>
      {/* chalk pieces */}
      <mesh position={[-1.8, -1.04, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      <mesh position={[-1.55, -1.04, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.09, 8]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
      <mesh position={[1.8, -1.02, 0.08]} rotation={[0, 0, Math.PI / 2.2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      {/* chalk writing — faux letters */}
      {[
        { x: -1.7, y: 0.55, w: 0.15, h: 0.18 },
        { x: -1.5, y: 0.55, w: 0.15, h: 0.18 },
        { x: -1.3, y: 0.55, w: 0.15, h: 0.18 },
        { x: -1.1, y: 0.55, w: 0.15, h: 0.18 },
        { x: -0.9, y: 0.55, w: 0.15, h: 0.18 },
        { x: -0.7, y: 0.55, w: 0.15, h: 0.18 },
        { x: 0, y: 0.0, w: 1.5, h: 0.04 },
        { x: -0.8, y: -0.4, w: 0.15, h: 0.15 },
        { x: -0.6, y: -0.4, w: 0.15, h: 0.15 },
        { x: -0.4, y: -0.4, w: 0.15, h: 0.15 },
        { x: 0.4, y: -0.4, w: 0.15, h: 0.15 },
        { x: 0.6, y: -0.4, w: 0.15, h: 0.15 },
      ].map((g, i) => (
        <mesh key={i} position={[g.x, g.y, 0.035]}>
          <boxGeometry args={[g.w, g.h, 0.005]} />
          <meshStandardMaterial color={i === 6 ? "#fde68a" : "#fafafa"} />
        </mesh>
      ))}
    </group>
  );
}

function Bookshelf({ position }: { position: [number, number, number] }) {
  const shelves = 4;
  return (
    <group position={position}>
      <mesh position={[0, 1.0, -0.18]} castShadow>
        <boxGeometry args={[1.2, 2.0, 0.04]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.9} />
      </mesh>
      <mesh position={[-0.6, 1.0, 0]}>
        <boxGeometry args={[0.04, 2.0, 0.4]} />
        <meshStandardMaterial color="#5b3a1f" />
      </mesh>
      <mesh position={[0.6, 1.0, 0]}>
        <boxGeometry args={[0.04, 2.0, 0.4]} />
        <meshStandardMaterial color="#5b3a1f" />
      </mesh>
      {Array.from({ length: shelves }).map((_, i) => (
        <group key={i} position={[0, 0.25 + i * 0.5, 0.02]}>
          <mesh>
            <boxGeometry args={[1.16, 0.04, 0.4]} />
            <meshStandardMaterial color="#3a2417" />
          </mesh>
          {/* books */}
          {[...Array(7)].map((_, j) => {
            const colors = ["#7c2d12", "#15803d", "#1e3a8a", "#7e22ce", "#a16207", "#9f1239", "#0e7490"];
            const h = 0.32 + (j % 3) * 0.04;
            return (
              <mesh
                key={j}
                position={[-0.5 + j * 0.16, h / 2 + 0.025, 0]}
                castShadow
              >
                <boxGeometry args={[0.13, h, 0.22]} />
                <meshStandardMaterial color={colors[j % colors.length]} roughness={0.7} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

function Globe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.1, 12]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[0.13, 0.008, 8, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, 0.2]} castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.5} />
      </mesh>
      {/* fake continents */}
      <mesh position={[0.06, 0.18, 0.1]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      <mesh position={[-0.06, 0.13, 0.09]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
    </group>
  );
}

export default function ClassroomScene() {
  return (
    <group>
      <ambientLight intensity={0.7} color="#f8fafc" />
      <hemisphereLight args={["#dbeafe", "#475569", 0.5]} />
      <directionalLight
        position={[2, 5, 4]}
        intensity={0.9}
        color="#f8fafc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* fluorescent overhead */}
      <pointLight position={[0, 3.5, 0]} color="#f0f9ff" intensity={0.7} distance={10} decay={2} />
      <pointLight position={[-2, 3.5, 1]} color="#f0f9ff" intensity={0.6} distance={8} decay={2} />
      <pointLight position={[2, 3.5, 1]} color="#f0f9ff" intensity={0.6} distance={8} decay={2} />

      {/* floor — linoleum tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      {[...Array(7)].map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -3 + i * 1]}>
          <planeGeometry args={[14, 0.015]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
      {[...Array(7)].map((_, i) => (
        <mesh key={`v${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-3 + i * 1, 0.001, 0]}>
          <planeGeometry args={[0.015, 14]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}

      {/* back wall */}
      <mesh position={[0, 2.2, -2.2]} receiveShadow>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.95} />
      </mesh>
      {/* baseboard */}
      <mesh position={[0, 0.15, -2.18]}>
        <boxGeometry args={[14, 0.3, 0.05]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>

      {/* side walls hinted by darker columns */}
      <mesh position={[-3.5, 2.2, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, 4.4]} />
        <meshStandardMaterial color="#fde68a" roughness={0.9} />
      </mesh>
      <mesh position={[3.5, 2.2, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 4.4]} />
        <meshStandardMaterial color="#fde68a" roughness={0.9} />
      </mesh>

      {/* chalkboard */}
      <Chalkboard />

      {/* teacher's desk */}
      <mesh position={[0, 0.55, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.05, 0.7]} />
        <meshStandardMaterial color="#7c4a2c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.27, -1.0]} castShadow>
        <boxGeometry args={[1.4, 0.6, 0.6]} />
        <meshStandardMaterial color="#5b3a1f" roughness={0.7} />
      </mesh>
      {/* desk drawer line */}
      <mesh position={[0, 0.4, -0.71]}>
        <boxGeometry args={[1.36, 0.02, 0.01]} />
        <meshStandardMaterial color="#3a2417" />
      </mesh>
      <mesh position={[0, 0.32, -0.71]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* globe on desk */}
      <Globe position={[-0.6, 0.58, -1.0]} />
      {/* stack of books */}
      <group position={[0.55, 0.6, -1.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.05, 0.24]} />
          <meshStandardMaterial color="#7c2d12" />
        </mesh>
        <mesh position={[0.02, 0.05, 0]} castShadow>
          <boxGeometry args={[0.32, 0.05, 0.24]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[-0.01, 0.1, 0]} castShadow>
          <boxGeometry args={[0.32, 0.05, 0.24]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>

      {/* bookshelf on left */}
      <Bookshelf position={[-2.7, 0, -1.9]} />

      {/* student desks — front row */}
      <Desk position={[-1.5, 0, 1.4]} />
      <Desk position={[0, 0, 1.4]} />
      <Desk position={[1.5, 0, 1.4]} />

      {/* tutor in front of board */}
      <Tutor
        position={[0, 0, -0.2]}
        skin="#e8b89c"
        shirt="#7c3aed"
        hair="#3a2417"
        speaking
      />
    </group>
  );
}
