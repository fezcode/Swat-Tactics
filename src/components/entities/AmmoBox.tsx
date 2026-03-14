import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { AmmoBoxState } from '../../types';
import { useGameStore } from '../../game/store';

export function AmmoBox({ state }: { state: AmmoBoxState }) {
  const collectAmmo = useGameStore(s => s.collectAmmo);

  return (
    <RigidBody 
      type="fixed" 
      position={[state.pos.x, 0.3, state.pos.z]}
      sensor
      onIntersectionEnter={({ other }) => {
        const userData = other.rigidBodyObject?.userData as any;
        if (userData?.type === 'player') {
          collectAmmo(state.id);
        }
      }}
      name={`ammo_${state.id}`}
      userData={{ type: 'ammo_box', id: state.id }}
    >
      <CuboidCollider args={[0.4, 0.3, 0.4]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Ammo icon / line on top */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <pointLight color="#fbbf24" intensity={5} distance={2} />
    </RigidBody>
  );
}
