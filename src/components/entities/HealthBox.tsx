import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { HealthBoxState } from '../../types';
import { useGameStore } from '../../game/store';
import { useRef } from 'react';

export function HealthBox({ state }: { state: HealthBoxState }) {
  const collectHealth = useGameStore(s => s.collectHealth);
  const collected = useRef(false);

  return (
    <RigidBody 
      type="fixed" 
      position={[state.pos.x, 0.3, state.pos.z]}
      sensor
      onIntersectionEnter={({ other }) => {
        if (collected.current) return;
        const userData = other.rigidBodyObject?.userData as any;
        if (userData?.type === 'player') {
          collected.current = true;
          collectHealth(state.id);
        }
      }}
      name={`health_${state.id}`}
      userData={{ type: 'health_box', id: state.id }}
    >
      <CuboidCollider args={[0.4, 0.3, 0.4]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* White cross on top */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <pointLight color="#22c55e" intensity={5} distance={2} />
    </RigidBody>
  );
}
