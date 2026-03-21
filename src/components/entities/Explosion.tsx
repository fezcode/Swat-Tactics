import { useGameStore } from '../../game/store';
import * as THREE from 'three';

const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
const ringGeo = new THREE.RingGeometry(0, 1, 32);

export function ExplosionEffects() {
  const explosions = useGameStore(s => s.explosions);

  return (
    <group>
      {explosions.map(e => {
        const s = e.radius * (1 - e.life);
        return (
          <group key={e.id} position={[e.pos.x, 0.1, e.pos.z]}>
            <mesh scale={[s, s, s]} geometry={sphereGeo}>
              <meshBasicMaterial color="#ffaa00" transparent opacity={e.life * 0.5} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[e.radius, e.radius, 1]} geometry={ringGeo}>
              <meshBasicMaterial color="#ff4400" transparent opacity={e.life} />
            </mesh>
            <pointLight color="#ffaa00" intensity={e.life * 20} distance={e.radius * 2} />
          </group>
        );
      })}
    </group>
  );
}
