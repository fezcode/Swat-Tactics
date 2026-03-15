import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import type { PortalState, Position } from '../../types';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function PortalGate({ pos, target, used, onTeleport }: { pos: Position, target: Position, used: boolean, onTeleport: () => void }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current && !used) {
      // Rotate the ring
      ringRef.current.rotation.z = clock.getElapsedTime() * 2;
      // Float up and down
      ringRef.current.position.y = 0.2 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
      // Pulse scale slightly
      const s = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.05;
      ringRef.current.scale.set(s, s, s);
    }
  });

  if (used) return (
    <group position={[pos.x, 0.01, pos.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color="#1e3a8a" opacity={0.1} transparent />
      </mesh>
    </group>
  );

  return (
    <RigidBody 
      type="fixed" 
      position={[pos.x, 0.01, pos.z]} 
      sensor
      onIntersectionEnter={({ other }) => {
        const userData = other.rigidBodyObject?.userData as any;
        if (userData?.type === 'player') {
          const playerRb = other.rigidBody as unknown as RapierRigidBody;
          if (playerRb) {
            playerRb.setTranslation({ x: target.x, y: 0.5, z: target.z }, true);
            onTeleport();
          }
        }
      }}
    >
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      
      {/* Static Base Plane (Like Exit) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.4} transparent />
      </mesh>

      {/* Floating Animated Ring */}
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial color="#60a5fa" opacity={0.8} transparent />
      </mesh>

      <pointLight color="#3b82f6" intensity={15} distance={4} />
    </RigidBody>
  );
}

export function Portal({ state }: { state: PortalState }) {
  const usePortal = useGameStore(s => s.usePortal);

  return (
    <group>
      <PortalGate 
        pos={state.posA} 
        target={state.posB} 
        used={state.used} 
        onTeleport={usePortal} 
      />
      <PortalGate 
        pos={state.posB} 
        target={state.posA} 
        used={state.used} 
        onTeleport={usePortal} 
      />
    </group>
  );
}
