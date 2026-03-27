import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { XPOrbState } from '../../types';
import { useGameStore } from '../../game/store';

export function XPOrb({ state }: { state: XPOrbState }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.4 + Math.sin(clock.getElapsedTime() * 4 + state.spawnTime * 0.001) * 0.15;
      ref.current.rotation.y = clock.getElapsedTime() * 3;
      ref.current.rotation.x = clock.getElapsedTime() * 2;
    }
  });

  return (
    <group position={[state.pos.x, 0, state.pos.z]}>
      <mesh ref={ref}>
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={8}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

export function XPOrbs() {
  const xpOrbs = useGameStore(s => s.survivalState?.xpOrbs || []);
  return (
    <>
      {xpOrbs.map((orb: XPOrbState) => (
        <XPOrb key={orb.id} state={orb} />
      ))}
    </>
  );
}
