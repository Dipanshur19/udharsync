import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Coin() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const speedRef = useRef(0.5);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * speedRef.current;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
  });

  const handlePointerDown = () => {
    speedRef.current = 3;
    setTimeout(() => {
      speedRef.current = 0.5;
    }, 1000);
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <cylinderGeometry args={[1, 1, 0.15, 64]} />
      <meshStandardMaterial
        color={hovered ? "#FFC107" : "#FFD700"}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 3, 3]} intensity={0.4} />
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#FF9933" />
      <Coin />
    </>
  );
}

export function RupeeCoin3D() {
  return (
    <div className="absolute inset-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
