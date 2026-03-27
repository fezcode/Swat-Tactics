import { useGameStore } from '../../game/store';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const bloodGeo = new THREE.CircleGeometry(0.3, 16);
const bloodMat = new THREE.MeshBasicMaterial({ color: "#7f1d1d", transparent: true, opacity: 0.6, depthWrite: false });

const particleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

// Cache materials by color to avoid creating new ones every frame
const materialCache = new Map<string, THREE.MeshBasicMaterial>();
function getParticleMaterial(color: string): THREE.MeshBasicMaterial {
  let mat = materialCache.get(color);
  if (!mat) {
    mat = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false });
    materialCache.set(color, mat);
  }
  return mat;
}

export function ParticleSystem() {
  const particles = useGameStore(s => s.particles);
  const bloodDecals = useGameStore(s => s.bloodDecals);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  // Update opacity via mesh.material directly instead of recreating materials
  useFrame(() => {
    for (const p of particles) {
      const mesh = meshRefs.current.get(p.id);
      if (mesh) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = p.life;
      }
    }
  });

  return (
    <>
      {bloodDecals.map(b => (
        <mesh key={b.id} position={[b.pos.x, 0.01, b.pos.z]} rotation={[-Math.PI / 2, 0, b.rot]} scale={[b.scale, b.scale, 1]} geometry={bloodGeo} material={bloodMat} />
      ))}
      {particles.map(p => (
        <mesh
          key={p.id}
          ref={(el) => {
            if (el) meshRefs.current.set(p.id, el);
            else meshRefs.current.delete(p.id);
          }}
          position={p.pos}
          geometry={particleGeo}
          material={getParticleMaterial(p.color)}
        />
      ))}
    </>
  );
}
