import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { PortalState } from '../../types';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function Portal({ state }: { state: PortalState }) {
  const usePortal = useGameStore(s => s.usePortal);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && !state.used) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 2;
      const s = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.1;
      meshRef.current.scale.set(s, s, s);
    }
  });

  if (state.used) return (
    <group position={[state.pos.x, 0.01, state.pos.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#1e3a8a" opacity={0.2} transparent />
      </mesh>
    </group>
  );

  return (
    <RigidBody 
      type="fixed" 
      position={[state.pos.x, 0.1, state.pos.z]} 
      sensor
      onIntersectionEnter={({ other }) => {
        const userData = other.rigidBodyObject?.userData as any;
        if (userData?.type === 'player') {
          // Trigger teleport on the other object (Player)
          const playerRb = other.rigidBodyObject;
          if (playerRb) {
            playerRb.setTranslation({ x: state.target.x, y: 0.5, z: state.target.z }, true);
            usePortal(state.id);
          }
        }
      }}
      userData={{ type: 'portal', id: state.id }}
    >
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.6} transparent />
      </mesh>
      {/* Portal Effect Layers */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#60a5fa" opacity={0.4} transparent />
      </mesh>
      <pointLight color="#3b82f6" intensity={10} distance={3} />
    </RigidBody>
  );
}
