import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { Position } from '../../types';
import { useGameStore } from '../../game/store';

export function Wall({ pos }: { pos: Position }) {
  const theme = useGameStore(s => s.theme);

  const colors = {
    industrial: "#6d769a",
    garden: "#1b5e20" // Hedge green
  }[theme];

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
        <meshStandardMaterial color={colors} roughness={theme === 'garden' ? 1.0 : 0.5} metalness={theme === 'garden' ? 0 : 0.2} />
      </mesh>
    </RigidBody>
  );
}
