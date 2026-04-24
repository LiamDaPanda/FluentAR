import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type Props = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  skin?: string;
  shirt?: string;
  hair?: string;
  apron?: string;
  speaking?: boolean;
};

export default function Tutor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  skin = "#e8b89c",
  shirt = "#2563eb",
  hair = "#3a2417",
  apron,
  speaking = false,
}: Props) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const mouth = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (root.current) {
      root.current.position.y = position[1] + Math.sin(t * 1.4) * 0.018;
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.6) * 0.18;
      head.current.rotation.x = Math.sin(t * 0.9) * 0.05;
    }
    if (leftArm.current) {
      leftArm.current.rotation.x = Math.sin(t * 1.1) * 0.08 - 0.05;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = Math.sin(t * 1.1 + 0.5) * 0.08 - 0.05;
    }
    if (mouth.current && speaking) {
      const open = (Math.sin(t * 12) + 1) * 0.5;
      mouth.current.scale.y = 0.5 + open * 0.9;
    } else if (mouth.current) {
      mouth.current.scale.y = 0.55;
    }
  });

  return (
    <group ref={root} position={position} rotation={rotation}>
      {/* legs */}
      <mesh position={[-0.13, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.7, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      <mesh position={[0.13, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.7, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* shoes */}
      <mesh position={[-0.13, 0.03, 0.05]} castShadow>
        <boxGeometry args={[0.18, 0.07, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      <mesh position={[0.13, 0.03, 0.05]} castShadow>
        <boxGeometry args={[0.18, 0.07, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.27, 0.38, 8, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>
      {apron ? (
        <mesh position={[0, 0.85, 0.21]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.04]} />
          <meshStandardMaterial color={apron} roughness={0.8} />
        </mesh>
      ) : null}
      {/* arms */}
      <group ref={leftArm} position={[-0.36, 1.15, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <capsuleGeometry args={[0.085, 0.38, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.36, 1.15, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <capsuleGeometry args={[0.085, 0.38, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>
      {/* neck */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 0.1, 12]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* head */}
      <group ref={head} position={[0, 1.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.1, -0.02]} scale={[1.05, 0.7, 1.05]} castShadow>
          <sphereGeometry args={[0.22, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.08, 0.02, 0.2]}>
          <sphereGeometry args={[0.027, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.02, 0.2]}>
          <sphereGeometry args={[0.027, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
        </mesh>
        {/* eye highlights */}
        <mesh position={[-0.075, 0.03, 0.222]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.085, 0.03, 0.222]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        {/* eyebrows */}
        <mesh position={[-0.08, 0.075, 0.205]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.05, 0.012, 0.01]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0.08, 0.075, 0.205]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.05, 0.012, 0.01]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        {/* mouth */}
        <mesh ref={mouth} position={[0, -0.08, 0.205]}>
          <boxGeometry args={[0.07, 0.018, 0.01]} />
          <meshStandardMaterial color="#7a2c2c" />
        </mesh>
        {/* cheeks */}
        <mesh position={[-0.13, -0.04, 0.18]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#f4a3a3" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.13, -0.04, 0.18]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#f4a3a3" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
