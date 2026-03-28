import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';
import { positionCache } from '../../game/positionCache';
import type { ProjectileState } from '../../types';

const HIT_RADIUS = 0.45;
const HIT_RADIUS_SQ = HIT_RADIUS * HIT_RADIUS;

const _v = new THREE.Vector3();

function ProjectileItem({ p }: { p: ProjectileState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const alive = useRef(true);
  // Track position locally to avoid store reads every frame
  const pos = useRef({ x: p.pos.x, z: p.pos.z });
  const theme = useGameStore(s => s.theme);

  useFrame((_, delta) => {
    if (!alive.current || !meshRef.current) return;

    // Clamp delta to avoid huge jumps on tab-switch
    const dt = Math.min(delta, 0.05);

    // Move
    pos.current.x += p.velocity.x * dt;
    pos.current.z += p.velocity.z * dt;

    // Update mesh position
    meshRef.current.position.set(pos.current.x, 0.5, pos.current.z);

    // Bounds check — remove if out of arena (generous margin)
    const arenaSize = useGameStore.getState().survivalState?.arenaSize || 60;
    if (
      pos.current.x < -5 || pos.current.x > arenaSize + 5 ||
      pos.current.z < -5 || pos.current.z > arenaSize + 5
    ) {
      alive.current = false;
      useGameStore.getState().removeProjectile(p.id);
      return;
    }

    // Life expiry is handled by the store tick — just check
    if (p.life <= 0) {
      alive.current = false;
      return;
    }

    // Hit detection
    const px = pos.current.x;
    const pz = pos.current.z;

    if (p.isEnemy) {
      // Enemy bullet → check player
      const playerPos = positionCache.get('player');
      if (playerPos) {
        const dx = px - playerPos.x;
        const dz = pz - playerPos.z;
        if (dx * dx + dz * dz < HIT_RADIUS_SQ) {
          alive.current = false;
          useGameStore.getState().damageEntity('player', p.damage, { x: px, z: pz });
          useGameStore.getState().removeProjectile(p.id);
          return;
        }
      }
    } else {
      // Player bullet → check enemies
      const allPositions = positionCache.getAll();
      for (const [id, ePos] of allPositions) {
        if (id === 'player') continue;

        // Pierce: skip already-hit enemies
        if (p.pierce && p.hitIds?.includes(id)) continue;

        const dx = px - ePos.x;
        const dz = pz - ePos.z;
        if (dx * dx + dz * dz < HIT_RADIUS_SQ) {
          useGameStore.getState().damageEntity(id, p.damage, { x: px, z: pz });

          if (p.pierce) {
            if (!p.hitIds) p.hitIds = [];
            p.hitIds.push(id);
            // Continue — don't remove piercing bullet
          } else {
            alive.current = false;
            useGameStore.getState().removeProjectile(p.id);
            return;
          }
        }
      }
    }
  });

  const playerBulletColor = theme === 'beach' ? '#000000' : '#ffffff';

  return (
    <mesh ref={meshRef} position={[p.pos.x, 0.5, p.pos.z]}>
      <sphereGeometry args={[0.1, 6, 6]} />
      <meshBasicMaterial color={p.isEnemy ? '#ff4444' : (p.color || playerBulletColor)} />
    </mesh>
  );
}

export function Projectiles() {
  const projectiles = useGameStore(s => s.projectiles);

  return (
    <group>
      {projectiles.map(p => (
        <ProjectileItem key={p.id} p={p} />
      ))}
    </group>
  );
}
