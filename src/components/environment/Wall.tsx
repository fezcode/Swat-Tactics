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
        <meshStandardMaterial color="#2a2d34" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}