import { useGameStore } from '../../game/store';
import * as THREE from 'three';

const bloodGeo = new THREE.CircleGeometry(0.3, 16);
const bloodMat = new THREE.MeshBasicMaterial({ color: "#7f1d1d", transparent: true, opacity: 0.6, depthWrite: false });

const particleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

export function ParticleSystem() {
  const particles = useGameStore(s => s.particles);
  const bloodDecals = useGameStore(s => s.bloodDecals);

  return (
    <>
      {bloodDecals.map(b => (
        <mesh key={b.id} position={[b.pos.x, 0.01, b.pos.z]} rotation={[-Math.PI / 2, 0, b.rot]} scale={[b.scale, b.scale, 1]} geometry={bloodGeo} material={bloodMat} />
      ))}
      {particles.map(p => (
        <mesh key={p.id} position={p.pos} geometry={particleGeo}>
          <meshBasicMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}
    </>
  );
}
