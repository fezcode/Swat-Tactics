import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/store';
import { positionCache, obstacleCache, type ObstacleAABB } from '../../game/positionCache';
import type { ProjectileState } from '../../types';

const HIT_RADIUS = 0.45;
const HIT_RADIUS_SQ = HIT_RADIUS * HIT_RADIUS;
const BARREL_HIT_RADIUS_SQ = 0.7 * 0.7;

// Line-segment vs AABB intersection (2D, xz plane).
// Tests if the segment from (x1,z1)→(x2,z2) intersects the box.
function segmentIntersectsAABB(
  x1: number, z1: number, x2: number, z2: number,
  box: ObstacleAABB
): boolean {
  // Expand box by bullet radius for a swept-sphere-like check
  const R = 0.1;
  const minX = box.minX - R, maxX = box.maxX + R;
  const minZ = box.minZ - R, maxZ = box.maxZ + R;

  let tMin = 0, tMax = 1;
  const dx = x2 - x1;
  const dz = z2 - z1;

  // X slab
  if (Math.abs(dx) < 1e-8) {
    if (x1 < minX || x1 > maxX) return false;
  } else {
    let t0 = (minX - x1) / dx;
    let t1 = (maxX - x1) / dx;
    if (t0 > t1) { const tmp = t0; t0 = t1; t1 = tmp; }
    tMin = Math.max(tMin, t0);
    tMax = Math.min(tMax, t1);
    if (tMin > tMax) return false;
  }

  // Z slab
  if (Math.abs(dz) < 1e-8) {
    if (z1 < minZ || z1 > maxZ) return false;
  } else {
    let t0 = (minZ - z1) / dz;
    let t1 = (maxZ - z1) / dz;
    if (t0 > t1) { const tmp = t0; t0 = t1; t1 = tmp; }
    tMin = Math.max(tMin, t0);
    tMax = Math.min(tMax, t1);
    if (tMin > tMax) return false;
  }

  return true;
}

// Check if a line segment from (x1,z1)→(x2,z2) passes within `radius` of point (cx,cz)
function segmentNearPoint(
  x1: number, z1: number, x2: number, z2: number,
  cx: number, cz: number, radiusSq: number
): boolean {
  // Closest point on segment to circle center
  const dx = x2 - x1, dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 1e-8) {
    // Segment is a point
    return (x1 - cx) * (x1 - cx) + (z1 - cz) * (z1 - cz) < radiusSq;
  }
  let t = ((cx - x1) * dx + (cz - z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx;
  const pz = z1 + t * dz;
  return (px - cx) * (px - cx) + (pz - cz) * (pz - cz) < radiusSq;
}

function ProjectileItem({ p }: { p: ProjectileState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const alive = useRef(true);
  const pos = useRef({ x: p.pos.x, z: p.pos.z });
  const theme = useGameStore(s => s.theme);

  useFrame((_, delta) => {
    if (!alive.current || !meshRef.current) return;

    const dt = Math.min(delta, 0.05);

    const oldX = pos.current.x;
    const oldZ = pos.current.z;

    // Move
    pos.current.x += p.velocity.x * dt;
    pos.current.z += p.velocity.z * dt;

    const newX = pos.current.x;
    const newZ = pos.current.z;

    meshRef.current.position.set(newX, 0.5, newZ);

    const state = useGameStore.getState();
    const arenaSize = state.survivalState?.arenaSize || 60;

    // Wall collision — arena boundaries
    if (newX < 0 || newX > arenaSize || newZ < 0 || newZ > arenaSize) {
      alive.current = false;
      state.removeProjectile(p.id);
      return;
    }

    // Life expiry
    if (p.life <= 0) {
      alive.current = false;
      return;
    }

    // --- Obstacle/wall collision using swept segment test ---
    const obstacles = obstacleCache.getAll();
    for (let i = 0; i < obstacles.length; i++) {
      if (segmentIntersectsAABB(oldX, oldZ, newX, newZ, obstacles[i])) {
        alive.current = false;
        state.removeProjectile(p.id);
        return;
      }
    }

    // --- Barrel collision (both player and enemy bullets) ---
    const barrels = state.barrels;
    for (let i = 0; i < barrels.length; i++) {
      const b = barrels[i];
      if (b.hp <= 0) continue;
      if (segmentNearPoint(oldX, oldZ, newX, newZ, b.pos.x, b.pos.z, BARREL_HIT_RADIUS_SQ)) {
        alive.current = false;
        state.damageEntity(b.id, p.damage, { x: newX, z: newZ });
        state.removeProjectile(p.id);
        return;
      }
    }

    if (p.isEnemy) {
      // Enemy bullet → check player
      const playerPos = positionCache.get('player');
      if (playerPos) {
        if (segmentNearPoint(oldX, oldZ, newX, newZ, playerPos.x, playerPos.z, HIT_RADIUS_SQ)) {
          alive.current = false;
          state.damageEntity('player', p.damage, { x: newX, z: newZ });
          state.removeProjectile(p.id);
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

        if (segmentNearPoint(oldX, oldZ, newX, newZ, ePos.x, ePos.z, HIT_RADIUS_SQ)) {
          state.damageEntity(id, p.damage, { x: newX, z: newZ });

          if (p.pierce) {
            if (!p.hitIds) p.hitIds = [];
            p.hitIds.push(id);
          } else {
            alive.current = false;
            state.removeProjectile(p.id);
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
