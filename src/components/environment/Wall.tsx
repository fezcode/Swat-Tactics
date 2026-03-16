import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { Position } from '../../types';
import { useGameStore } from '../../game/store';

export function Wall({ pos }: { pos: Position }) {
  const theme = useGameStore(s => s.theme);

  const colors = {
    industrial: "#6d769a",
    garden: "#1b5e20", // Hedge green
    skyscraper: "#4a5568", // Steel blue grey
    desert: "#d4a373", // Sandstone
    space_station: "#334155", // Dark slate
    beach: "#92400e", // Dark wood/rock brown
    cemetery: "#52525b" // Weathered stone grey
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
        <meshStandardMaterial 
          color={colors} 
          roughness={theme === 'garden' ? 1.0 : (theme === 'desert' ? 0.9 : (theme === 'space_station' ? 0.2 : 0.3))} 
          metalness={theme === 'skyscraper' ? 0.6 : (theme === 'industrial' ? 0.2 : (theme === 'space_station' ? 0.8 : 0))} 
        />
      </mesh>
    </RigidBody>
  );
}
