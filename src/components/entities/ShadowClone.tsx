import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';

export function ShadowClone() {
  const meshRef = useRef<THREE.Group>(null);
  const survivalState = useGameStore(s => s.survivalState);

  useFrame(({ clock }) => {
    if (!meshRef.current || !survivalState?.clonePos) return;
    meshRef.current.position.x = survivalState.clonePos.x;
    meshRef.current.position.z = survivalState.clonePos.z;
    meshRef.current.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.05;
    meshRef.current.rotation.y = survivalState.cloneRotation;
  });

  if (!survivalState?.activePerks.includes('shadow_clone') || !survivalState.clonePos) return null;

  return (
    <group ref={meshRef} position={[survivalState.clonePos.x, 0.5, survivalState.clonePos.z]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.25, 0.35, 4, 16]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.6} emissive="#6366f1" emissiveIntensity={2} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#818cf8" transparent opacity={0.6} emissive="#818cf8" emissiveIntensity={3} roughness={0.2} />
      </mesh>
      <group position={[0.15, 0.1, -0.35]}>
        <mesh>
          <boxGeometry args={[0.08, 0.08, 0.5]} />
          <meshStandardMaterial color="#4338ca" transparent opacity={0.5} emissive="#4338ca" emissiveIntensity={2} />
        </mesh>
      </group>
      <pointLight color="#6366f1" intensity={5} distance={4} />
    </group>
  );
}
