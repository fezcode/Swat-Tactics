import { useMemo, useRef, useEffect } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { Wall } from './Wall';
import { HealthBox } from '../entities/HealthBox';
import { AmmoBox } from '../entities/AmmoBox';
import { Portal } from '../entities/Portal';
import { Turret } from '../entities/Turret';
import { Button } from '../entities/Button';
import { obstacleCache } from '../../game/positionCache';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Theme color configs
const THEME_COLORS: Record<string, { floor: string; floor2: string; accent: string; fogColor: string; groundColor: string }> = {
  industrial: { floor: '#2d334a', floor2: '#252a3d', accent: '#4fd1c5', fogColor: '#1a1f33', groundColor: '#1a1f33' },
  garden: { floor: '#5d4037', floor2: '#4e342e', accent: '#8bc34a', fogColor: '#1a2e1a', groundColor: '#2e1f14' },
  skyscraper: { floor: '#1a202c', floor2: '#151b26', accent: '#63b3ed', fogColor: '#0a0c14', groundColor: '#0a0c14' },
  desert: { floor: '#c2b280', floor2: '#b3a370', accent: '#e6ccb2', fogColor: '#3d3020', groundColor: '#8a7a5a' },
  space_station: { floor: '#0f172a', floor2: '#0c1322', accent: '#ec4899', fogColor: '#050510', groundColor: '#080818' },
  beach: { floor: '#fdf0ba', floor2: '#f0e0a0', accent: '#d97706', fogColor: '#2a1f10', groundColor: '#c8b880' },
  cemetery: { floor: '#27272a', floor2: '#1f1f22', accent: '#71717a', fogColor: '#111113', groundColor: '#1a1a1c' },
  airport: { floor: '#475569', floor2: '#3d4a5c', accent: '#eab308', fogColor: '#1e2838', groundColor: '#334155' },
  metro: { floor: '#1e293b', floor2: '#172033', accent: '#facc15', fogColor: '#0f1520', groundColor: '#141c28' },
};

// Checkerboard floor using instanced mesh — each instance gets rotation baked into its matrix
function CheckerboardFloor({ width, height, color1, color2 }: { width: number; height: number; color1: string; color2: string }) {
  const mesh1Ref = useRef<THREE.InstancedMesh>(null);
  const mesh2Ref = useRef<THREE.InstancedMesh>(null);

  const { count1, count2 } = useMemo(() => {
    let c1 = 0, c2 = 0;
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < height; z++) {
        if ((x + z) % 2 === 0) c1++; else c2++;
      }
    }
    return { count1: c1, count2: c2 };
  }, [width, height]);

  const tileRotation = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), []);
  const tileScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useEffect(() => {
    if (!mesh1Ref.current || !mesh2Ref.current) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    let i1 = 0, i2 = 0;
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < height; z++) {
        pos.set(x, 0.005, z);
        m.compose(pos, tileRotation, tileScale);
        if ((x + z) % 2 === 0) {
          mesh1Ref.current.setMatrixAt(i1++, m);
        } else {
          mesh2Ref.current.setMatrixAt(i2++, m);
        }
      }
    }
    mesh1Ref.current.instanceMatrix.needsUpdate = true;
    mesh2Ref.current.instanceMatrix.needsUpdate = true;
  }, [width, height, tileRotation, tileScale]);

  const geom = useMemo(() => new THREE.PlaneGeometry(0.98, 0.98), []);

  return (
    <group>
      <instancedMesh ref={mesh1Ref} args={[geom, undefined, count1]} receiveShadow>
        <meshStandardMaterial color={color1} roughness={0.8} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={mesh2Ref} args={[geom, undefined, count2]} receiveShadow>
        <meshStandardMaterial color={color2} roughness={0.85} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

// Floating dust particles for atmosphere — static positions, sine-wave animation
function CampaignDust({ width, height, color }: { width: number; height: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 15;

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.sin(i * 73.1) * 0.5 + 0.5) * (width + 10) - 5,
        y: 0.5 + (Math.sin(i * 37.7) * 0.5 + 0.5) * 3,
        z: (Math.sin(i * 127.3) * 0.5 + 0.5) * (height + 10) - 5,
        speed: 0.3 + (Math.sin(i * 97.1) * 0.5 + 0.5) * 0.5,
        phase: i * 1.7,
      });
    }
    return arr;
  }, [width, height]);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const y = p.y + Math.sin(t * p.speed + p.phase) * 0.5;
      tempMatrix.setPosition(p.x, y, p.z);
      ref.current.setMatrixAt(i, tempMatrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  const geom = useMemo(() => new THREE.SphereGeometry(0.06, 4, 4), []);

  return (
    <instancedMesh ref={ref} args={[geom, undefined, count]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.4} />
    </instancedMesh>
  );
}

// Ground plane extending beyond the level boundaries
function GroundPlane({ width, height, color }: { width: number; height: number; color: string }) {
  const cx = (width - 1) / 2;
  const cz = (height - 1) / 2;
  const size = Math.max(width, height) * 4;
  return (
    <mesh position={[cx, -0.1, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0} />
    </mesh>
  );
}

// Visible boundary walls around the level edges
function BoundaryWalls({ width, height, wallColor }: { width: number; height: number; wallColor: string }) {
  const cx = (width - 1) / 2;
  const cz = (height - 1) / 2;
  const wallH = 1.5;
  const wallThick = 0.4;

  const walls: { pos: [number, number, number]; colArgs: [number, number, number]; meshArgs: [number, number, number] }[] = [
    { pos: [cx, wallH / 2, -0.5 - wallThick / 2], colArgs: [width / 2 + wallThick, wallH / 2, wallThick / 2], meshArgs: [width + wallThick * 2, wallH, wallThick] },
    { pos: [cx, wallH / 2, height - 0.5 + wallThick / 2], colArgs: [width / 2 + wallThick, wallH / 2, wallThick / 2], meshArgs: [width + wallThick * 2, wallH, wallThick] },
    { pos: [-0.5 - wallThick / 2, wallH / 2, cz], colArgs: [wallThick / 2, wallH / 2, height / 2 + wallThick], meshArgs: [wallThick, wallH, height + wallThick * 2] },
    { pos: [width - 0.5 + wallThick / 2, wallH / 2, cz], colArgs: [wallThick / 2, wallH / 2, height / 2 + wallThick], meshArgs: [wallThick, wallH, height + wallThick * 2] },
  ];

  return (
    <group>
      {walls.map((w, i) => (
        <RigidBody key={`bw-${i}`} type="fixed" position={w.pos} userData={{ type: 'wall' }}>
          <CuboidCollider args={w.colArgs} />
          <mesh receiveShadow>
            <boxGeometry args={w.meshArgs} />
            <meshStandardMaterial color={wallColor} roughness={0.7} metalness={0.2} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

export function GridMap() {
  const walls = useGameStore(s => s.walls);
  const gridSize = useGameStore(s => s.gridSize);
  const exitPos = useGameStore(s => s.exitPos);
  const enemies = useGameStore(s => s.enemies);
  const turrets = useGameStore(s => s.turrets);
  const buttons = useGameStore(s => s.buttons);
  const healthBoxes = useGameStore(s => s.healthBoxes);
  const ammoBoxes = useGameStore(s => s.ammoBoxes);
  const portal = useGameStore(s => s.portal);
  const theme = useGameStore(s => s.theme);
  const decorations = useGameStore(s => s.decorations);

  // Register wall AABBs for bullet collision (runs synchronously during render)
  useMemo(() => {
    obstacleCache.clear();
    for (const w of walls) {
      obstacleCache.add({ minX: w.x - 0.5, maxX: w.x + 0.5, minZ: w.z - 0.5, maxZ: w.z + 0.5 });
    }
  }, [walls]);
  const allDead = (enemies.length > 0 || turrets.length > 0) &&
    enemies.filter(e => !e.unkillable).every(e => e.hp <= 0) &&
    turrets.every(t => t.hp <= 0 || t.disabled);

  const colors = THEME_COLORS[theme] || THEME_COLORS.industrial;

  return (
    <group>
      {/* Extended ground plane */}
      <GroundPlane width={gridSize.width} height={gridSize.height} color={colors.groundColor} />

      {/* Floor Collider */}
      <RigidBody type="fixed" position={[gridSize.width / 2 - 0.5, -0.05, gridSize.height / 2 - 0.5]} userData={{ type: 'floor' }}>
        <CuboidCollider args={[gridSize.width / 2, 0.05, gridSize.height / 2]} />
      </RigidBody>

      {/* Visible boundary walls */}
      <BoundaryWalls width={gridSize.width} height={gridSize.height} wallColor={colors.floor2} />

      {/* Checkerboard floor tiles */}
      <CheckerboardFloor width={gridSize.width} height={gridSize.height} color1={colors.floor} color2={colors.floor2} />

      {/* Atmospheric dust particles */}
      <CampaignDust width={gridSize.width} height={gridSize.height} color={colors.accent} />

      {/* Decorations */}
      {decorations.map((d) => (
        <group key={d.id} position={[d.pos.x, 0, d.pos.z]} rotation={[0, d.rotation, 0]} scale={d.scale}>
          {d.type === 'tree' && (
            <>
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.25, 2, 6]} />
                <meshStandardMaterial color="#5d4037" roughness={0.9} />
              </mesh>
              <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[1, 6, 6]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.9} />
              </mesh>
              <mesh position={[0.4, 2.2, 0.3]}>
                <sphereGeometry args={[0.6, 5, 5]} />
                <meshStandardMaterial color="#388e3c" roughness={0.9} />
              </mesh>
            </>
          )}
          {d.type === 'palm_tree' && (
            <group>
              <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0.1]}>
                <cylinderGeometry args={[0.15, 0.25, 3, 6]} />
                <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
              </mesh>
              {[0, 1, 2, 3, 4].map(i => (
                <mesh key={i} position={[0, 3, 0]} rotation={[0, (Math.PI * 2 / 5) * i, Math.PI / 4]}>
                  <coneGeometry args={[0.5, 2, 4]} />
                  <meshStandardMaterial color="#2e8b57" roughness={0.8} />
                </mesh>
              ))}
              {/* Coconuts */}
              <mesh position={[0.15, 2.8, 0.1]}>
                <sphereGeometry args={[0.1, 5, 5]} />
                <meshStandardMaterial color="#6b4226" roughness={0.9} />
              </mesh>
            </group>
          )}
          {d.type === 'rock' && (
            <mesh position={[0, 0.2, 0]}>
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial color="#757575" roughness={0.9} />
            </mesh>
          )}
          {d.type === 'building' && (
            <group>
              <mesh position={[0, (d.h || 10) / 2, 0]}>
                <boxGeometry args={[d.w || 2, d.h || 10, d.d || 2]} />
                <meshStandardMaterial color={d.color || "#1a202c"} metalness={0.5} roughness={0.2} />
              </mesh>
              {/* Window rows */}
              {Array.from({ length: Math.min(Math.floor((d.h || 10) / 3), 8) }, (_, i) => (
                <mesh key={i} position={[0, 2 + i * 3, (d.d || 2) / 2 + 0.01]}>
                  <planeGeometry args={[(d.w || 2) * 0.7, 1.5]} />
                  <meshStandardMaterial color="#1a1a2e" emissive="#63b3ed" emissiveIntensity={0.1} transparent opacity={0.5} />
                </mesh>
              ))}
            </group>
          )}
          {d.type === 'cactus' && (
            <>
              <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.15, 0.18, 1.6, 6]} />
                <meshStandardMaterial color="#4a7c44" roughness={0.9} />
              </mesh>
              {/* Arms */}
              <mesh position={[0.25, 0.9, 0]} rotation={[0, 0, -0.8]}>
                <cylinderGeometry args={[0.08, 0.1, 0.6, 5]} />
                <meshStandardMaterial color="#4a7c44" roughness={0.9} />
              </mesh>
              <mesh position={[-0.2, 1.1, 0]} rotation={[0, 0, 0.7]}>
                <cylinderGeometry args={[0.08, 0.1, 0.5, 5]} />
                <meshStandardMaterial color="#3d6b38" roughness={0.9} />
              </mesh>
            </>
          )}
          {d.type === 'pipe' && (
            <>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Pipe joints */}
              <mesh position={[1.5, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.15, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[-1.5, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.15, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
              </mesh>
            </>
          )}
          {d.type === 'bench' && (
            <group>
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[1.2, 0.08, 0.5]} />
                <meshStandardMaterial color="#4a3c2a" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.5, -0.2]}>
                <boxGeometry args={[1.2, 0.4, 0.06]} />
                <meshStandardMaterial color="#4a3c2a" roughness={0.8} />
              </mesh>
              <mesh position={[0.5, 0.12, 0]}>
                <boxGeometry args={[0.08, 0.25, 0.5]} />
                <meshStandardMaterial color="#222222" metalness={0.5} />
              </mesh>
              <mesh position={[-0.5, 0.12, 0]}>
                <boxGeometry args={[0.08, 0.25, 0.5]} />
                <meshStandardMaterial color="#222222" metalness={0.5} />
              </mesh>
            </group>
          )}
          {d.type === 'metro_sign' && (
            <group>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
                <meshStandardMaterial color="#333333" metalness={0.5} />
              </mesh>
              <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.1]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
              <mesh position={[0, 2.5, 0.06]}>
                <planeGeometry args={[0.5, 0.5]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
              </mesh>
            </group>
          )}
          {d.type === 'track' && (
            <group>
              <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
              <mesh position={[0.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 1]} />
                <meshStandardMaterial color="#555555" metalness={0.8} />
              </mesh>
              <mesh position={[-0.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 1]} />
                <meshStandardMaterial color="#555555" metalness={0.8} />
              </mesh>
            </group>
          )}
          {/* --- New decoration types --- */}
          {d.type === 'panel' && (
            <group>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[1.5, 2, 0.1]} />
                <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.2} />
              </mesh>
              {/* Screen glow */}
              <mesh position={[0, 1.2, 0.06]}>
                <planeGeometry args={[1, 0.8]} />
                <meshStandardMaterial color="#0f172a" emissive="#4fd1c5" emissiveIntensity={0.3} />
              </mesh>
            </group>
          )}
          {d.type === 'cold_storage' && (
            <group>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[1.2, 1.6, 1]} />
                <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Vent slats */}
              <mesh position={[0, 1.2, 0.51]}>
                <boxGeometry args={[0.8, 0.05, 0.01]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
              <mesh position={[0, 1.0, 0.51]}>
                <boxGeometry args={[0.8, 0.05, 0.01]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
              {/* Status light */}
              <mesh position={[0.4, 1.4, 0.52]}>
                <sphereGeometry args={[0.05, 5, 5]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
              </mesh>
            </group>
          )}
          {d.type === 'satellite' && (
            <group>
              {/* Pole */}
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 3, 6]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Dish */}
              <mesh position={[0, 3, 0]} rotation={[0.5, 0, 0]}>
                <coneGeometry args={[0.8, 0.4, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Antenna tip */}
              <mesh position={[0, 3.3, -0.2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
              </mesh>
            </group>
          )}
          {d.type === 'sand' && (
            <group>
              {/* Sand dune */}
              <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.8, 6, 4]} />
                <meshStandardMaterial color="#d4a373" roughness={1} />
              </mesh>
              <mesh position={[0.5, 0.1, 0.3]}>
                <sphereGeometry args={[0.5, 5, 3]} />
                <meshStandardMaterial color="#c09060" roughness={1} />
              </mesh>
            </group>
          )}
          {d.type === 'umbrella' && (
            <group>
              {/* Pole */}
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2, 6]} />
                <meshStandardMaterial color="#8B4513" roughness={0.7} />
              </mesh>
              {/* Canopy */}
              <mesh position={[0, 2, 0]}>
                <coneGeometry args={[1, 0.5, 8]} />
                <meshStandardMaterial color="#ef4444" roughness={0.6} />
              </mesh>
            </group>
          )}
          {d.type === 'beach_ball' && (
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.5} />
            </mesh>
          )}
          {d.type === 'tombstone' && (
            <group>
              {/* Stone slab */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.6, 1, 0.15]} />
                <meshStandardMaterial color="#52525b" roughness={0.9} />
              </mesh>
              {/* Rounded top */}
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.3, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#52525b" roughness={0.9} />
              </mesh>
              {/* Cross engraving */}
              <mesh position={[0, 0.6, 0.08]}>
                <boxGeometry args={[0.04, 0.3, 0.01]} />
                <meshStandardMaterial color="#3f3f46" />
              </mesh>
              <mesh position={[0, 0.65, 0.08]}>
                <boxGeometry args={[0.2, 0.04, 0.01]} />
                <meshStandardMaterial color="#3f3f46" />
              </mesh>
            </group>
          )}
          {d.type === 'dead_tree' && (
            <group>
              <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.12, 0.2, 2.4, 5]} />
                <meshStandardMaterial color="#3d2b1f" roughness={1} />
              </mesh>
              {/* Bare branches */}
              <mesh position={[0.3, 2, 0]} rotation={[0, 0, -0.6]}>
                <cylinderGeometry args={[0.03, 0.06, 1, 4]} />
                <meshStandardMaterial color="#2d1f14" roughness={1} />
              </mesh>
              <mesh position={[-0.2, 2.2, 0.1]} rotation={[0.2, 0, 0.5]}>
                <cylinderGeometry args={[0.02, 0.05, 0.8, 4]} />
                <meshStandardMaterial color="#2d1f14" roughness={1} />
              </mesh>
            </group>
          )}
          {d.type === 'crypt' && (
            <group>
              {/* Base */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.5, 1, 1.2]} />
                <meshStandardMaterial color="#3f3f46" roughness={0.8} />
              </mesh>
              {/* Roof */}
              <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[1.7, 0.15, 1.4]} />
                <meshStandardMaterial color="#52525b" roughness={0.7} />
              </mesh>
              {/* Door */}
              <mesh position={[0, 0.4, 0.61]}>
                <boxGeometry args={[0.5, 0.8, 0.02]} />
                <meshStandardMaterial color="#27272a" roughness={0.9} />
              </mesh>
              {/* Eerie glow */}
              <mesh position={[0, 0.6, 0.62]}>
                <sphereGeometry args={[0.08, 5, 5]} />
                <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
              </mesh>
            </group>
          )}
          {d.type === 'airplane' && (
            <group>
              {/* Fuselage */}
              <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.5, 4, 6, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
              </mesh>
              {/* Wings */}
              <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[1.5, 0.08, 4]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
              </mesh>
              {/* Tail */}
              <mesh position={[-2.5, 2.2, 0]}>
                <boxGeometry args={[0.5, 1, 0.08]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
              </mesh>
              {/* Engine */}
              <mesh position={[0.5, 1.2, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.8, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
              </mesh>
            </group>
          )}
          {d.type === 'luggage_cart' && (
            <group>
              {/* Base */}
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[1, 0.1, 0.6]} />
                <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Handle */}
              <mesh position={[-0.5, 0.5, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.7, 5]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} />
              </mesh>
              {/* Wheels */}
              <mesh position={[0.3, 0.05, 0.3]}>
                <sphereGeometry args={[0.06, 5, 5]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0.3, 0.05, -0.3]}>
                <sphereGeometry args={[0.06, 5, 5]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              {/* Luggage */}
              <mesh position={[0.1, 0.35, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.4]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.7} />
              </mesh>
            </group>
          )}
          {d.type === 'terminal_sign' && (
            <group>
              {/* Poles */}
              <mesh position={[-0.5, 1.2, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2.4, 5]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} />
              </mesh>
              <mesh position={[0.5, 1.2, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2.4, 5]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} />
              </mesh>
              {/* Sign board */}
              <mesh position={[0, 2, 0]}>
                <boxGeometry args={[1.2, 0.4, 0.08]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              {/* Text glow */}
              <mesh position={[0, 2, 0.05]}>
                <planeGeometry args={[1, 0.25]} />
                <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
              </mesh>
            </group>
          )}
          {d.type === 'flight_board' && (
            <group>
              {/* Stand */}
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[0.1, 2, 0.1]} />
                <meshStandardMaterial color="#475569" metalness={0.6} />
              </mesh>
              {/* Screen */}
              <mesh position={[0, 1.8, 0.08]}>
                <boxGeometry args={[1.2, 0.8, 0.05]} />
                <meshStandardMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.2} />
              </mesh>
              {/* Text lines */}
              {[0, 1, 2].map(i => (
                <mesh key={i} position={[0, 2 - i * 0.2, 0.12]}>
                  <planeGeometry args={[0.9, 0.08]} />
                  <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} transparent opacity={0.6} />
                </mesh>
              ))}
            </group>
          )}
          {d.type === 'security_gate' && (
            <group>
              {/* Left pillar */}
              <mesh position={[-0.4, 0.8, 0]}>
                <boxGeometry args={[0.15, 1.6, 0.3]} />
                <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Right pillar */}
              <mesh position={[0.4, 0.8, 0]}>
                <boxGeometry args={[0.15, 1.6, 0.3]} />
                <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Top bar */}
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[0.95, 0.08, 0.3]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.2} />
              </mesh>
              {/* Status indicator */}
              <mesh position={[0, 1.7, 0.16]}>
                <sphereGeometry args={[0.05, 5, 5]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
              </mesh>
            </group>
          )}
          {d.type === 'luggage_scanner' && (
            <group>
              {/* Main body */}
              <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[1.5, 0.6, 0.8]} />
                <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
              </mesh>
              {/* Tunnel opening */}
              <mesh position={[0, 0.45, 0.41]}>
                <boxGeometry args={[0.8, 0.4, 0.02]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Conveyor belt */}
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[2, 0.04, 0.6]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
              </mesh>
            </group>
          )}
        </group>
      ))}

{walls.map((w, i) => <Wall key={i} pos={w} />)}
      {turrets.map((t) => <Turret key={t.id} id={t.id} />)}
      {buttons.map((b) => <Button key={b.id} id={b.id} />)}
      {healthBoxes.map((h) => <HealthBox key={h.id} state={h} />)}
      {ammoBoxes.map((a) => <AmmoBox key={a.id} state={a} />)}
      {portal && <Portal state={portal} />}

      {exitPos && (
        <RigidBody
          type="fixed"
          position={[exitPos.x, 0.1, exitPos.z]}
          sensor
          userData={{ type: 'exit' }}
          onIntersectionEnter={({ other }) => {
            const userData = other.rigidBodyObject?.userData as any;
            if (userData?.type === 'player') {
               const { setPhase, enemies: currentEnemies, turrets: currentTurrets } = useGameStore.getState();
               if (currentEnemies.filter(e => !e.unkillable).every(e => e.hp <= 0) && currentTurrets.every(t => t.hp <= 0 || t.disabled)) {
                 setPhase('level_complete');
               }
            }
          }}
        >
          <CuboidCollider args={[0.8, 0.5, 0.8]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshBasicMaterial
              color={allDead ? "#22c55e" : "#ef4444"}
              opacity={0.4}
              transparent
            />
          </mesh>
          <pointLight
            color={allDead ? "#22c55e" : "#ef4444"}
            intensity={allDead ? 15 : 5}
            distance={5}
          />
        </RigidBody>
      )}
    </group>
  );
}
