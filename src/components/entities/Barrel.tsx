import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { BarrelState } from '../../types';
import { useGameStore } from '../../game/store';

export function Barrel({ state }: { state: BarrelState }) {
  const damageEntity = useGameStore(s => s.damageEntity);
  if (state.hp <= 0) return null;

  return (
    <RigidBody 
      type="fixed" 
      position={[state.pos.x, 0.5, state.pos.z]}
      lockRotations
      friction={1}
      onIntersectionEnter={({ other }) => {
        const userData = other.rigidBodyObject?.userData as any;
        if (userData?.type === 'projectile') {
          damageEntity(state.id, 1, { x: state.pos.x, z: state.pos.z });
        }
      }}
      name={`barrel_${state.id}`}
      userData={{ type: 'barrel', id: state.id }}
      mass={5}
    >
      <CuboidCollider args={[0.4, 0.5, 0.4]} />
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.2} />
      </mesh>
    </RigidBody>
  );
}