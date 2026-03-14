import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { Position } from '../../types';

export function Wall({ pos }: { pos: Position }) {
  return (
    <RigidBody 
      type="fixed" 
      position={[pos.x, 0.5, pos.z]} 
      userData={{ type: 'wall' }}
      friction={0}
      restitution={0}
    >
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        {/* Brighter Industrial Grey for visibility through CRT */}
        <meshStandardMaterial color="#6d769a" roughness={0.5} metalness={0.2} />
      </mesh>
    </RigidBody>
  );
}