import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import * as THREE from 'three';
import { HealthBox } from '../entities/HealthBox';
import { AmmoBox } from '../entities/AmmoBox';
import { Barrel } from '../entities/Barrel';

const THEME_COLORS: Record<string, { floor: string; floor2: string; grid: string; obelisk: string; glow: string; fog: string; accent: string }> = {
  industrial: { floor: '#1a1e2e', floor2: '#161a28', grid: '#2dd4bf', obelisk: '#3b82f6', glow: '#3b82f6', fog: '#0a0e1a', accent: '#64748b' },
  desert:     { floor: '#3d3424', floor2: '#332a1c', grid: '#d4a373', obelisk: '#f59e0b', glow: '#f59e0b', fog: '#1a1408', accent: '#92400e' },
  space_station: { floor: '#0c1020', floor2: '#080c18', grid: '#c026d3', obelisk: '#a855f7', glow: '#a855f7', fog: '#050510', accent: '#4c1d95' },
  cemetery:   { floor: '#1e1e24', floor2: '#18181e', grid: '#6b7280', obelisk: '#6366f1', glow: '#6366f1', fog: '#0a0a0c', accent: '#374151' },
  metro:      { floor: '#161620', floor2: '#101018', grid: '#eab308', obelisk: '#ef4444', glow: '#ef4444', fog: '#080808', accent: '#78716c' },
  garden:     { floor: '#1a2e1a', floor2: '#152815', grid: '#4ade80', obelisk: '#22c55e', glow: '#22c55e', fog: '#0a1a0a', accent: '#166534' },
  beach:      { floor: '#3d3828', floor2: '#342f20', grid: '#fbbf24', obelisk: '#f59e0b', glow: '#38bdf8', fog: '#1a1608', accent: '#ca8a04' },
  airport:    { floor: '#1e2028', floor2: '#181a22', grid: '#60a5fa', obelisk: '#3b82f6', glow: '#60a5fa', fog: '#0c0e14', accent: '#1e40af' },
};

// --- Only obelisks get useFrame (4 total, always present) ---
function Obelisk({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.5;
      ref.current.position.y = 2.0 + Math.sin(t * 2) * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.5;
      ringRef.current.rotation.x = Math.sin(t) * 0.3;
    }
  });
  return (
    <RigidBody type="fixed" position={position} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.6, 2, 0.6]} position={[0, 1, 0]} />
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} metalness={1} roughness={0} />
      </mesh>
      <mesh ref={ringRef} position={[0, 2.0, 0]}>
        <torusGeometry args={[0.7, 0.03, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={8} transparent opacity={0.7} />
      </mesh>
    </RigidBody>
  );
}

// --- Static decorations (NO RigidBody, NO useFrame, NO castShadow) ---

function DeadTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.08, 0.15, 1.6, 5]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 1.3, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.03, 0.06, 0.6, 4]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 1.5, 0.05]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.02, 0.05, 0.5, 4]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>
    </group>
  );
}

function LampPost({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 2.4, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

function Rubble({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1 * scale, 0]} scale={[scale, scale * 0.6, scale]}>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Cactus({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 1.4, 6]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 1.1, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.07, 0.09, 0.5, 5]} />
        <meshStandardMaterial color="#3a7a32" roughness={0.8} />
      </mesh>
    </group>
  );
}

function SandDune({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={[scale * 2, scale * 0.3, scale * 1.5]}>
      <sphereGeometry args={[1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#c4a35a" roughness={0.95} />
    </mesh>
  );
}

function Tombstone({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: number; scale?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.12]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FogPillar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={[position[0], 1.5, position[2]]}>
      <cylinderGeometry args={[0.8, 1.2, 3, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
}

function PalmTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2.0, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      {[0, 1.5, 3.0, 4.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.5, 2.1, Math.sin(a) * 0.5]} rotation={[0.6 * Math.sin(a), a, -0.6 * Math.cos(a)]}>
          <boxGeometry args={[0.8, 0.04, 0.3]} />
          <meshStandardMaterial color="#2d7a2d" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function BeachUmbrella({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 5]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <coneGeometry args={[0.8, 0.4, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function TechPillar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.4, 2.0, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.0, 0.21]}>
        <planeGeometry args={[0.3, 1.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

function HoloRing({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={[position[0], 1.5, position[2]]}>
      <torusGeometry args={[0.6, 0.02, 6, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} transparent opacity={0.5} />
    </mesh>
  );
}

function FlowerPatch({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {[0, 1.2, 2.4, 3.6].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.3, 0.2, Math.sin(a) * 0.3]}>
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function GardenBush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={[position[0], 0.4 * scale, position[2]]} scale={[scale, scale * 0.8, scale]}>
      <sphereGeometry args={[0.5, 6, 6]} />
      <meshStandardMaterial color="#166534" roughness={0.85} />
    </mesh>
  );
}

function RunwayLight({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.15, 0.02, 0.15]} />
      <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
    </mesh>
  );
}

// --- Obstacles with physics (RigidBody) - only these need collision ---

function CargoContainer({ position, rotation, color }: { position: [number, number, number]; rotation: number; color: string }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[1.2, 0.6, 0.5]} position={[0, 0.6, 0]} />
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[2.4, 1.2, 1.0]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.7} />
      </mesh>
    </RigidBody>
  );
}

function Barrier({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.8, 0.3, 0.25]} position={[0, 0.3, 0]} />
      <mesh receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.5]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 0.26]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}

function TrainWreckage({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[2, 0.5, 0.6]} position={[0, 0.5, 0]} />
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1.0, 1.2]} />
        <meshStandardMaterial color="#44403c" roughness={0.8} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[3.8, 0.15, 1.3]} />
        <meshStandardMaterial color="#57534e" roughness={0.7} metalness={0.5} />
      </mesh>
    </RigidBody>
  );
}

function Billboard({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.8, 1.5, 0.1]} position={[0, 1.0, 0]} />
      <mesh position={[-0.6, 1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 5]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.6, 1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 5]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.1, 0.05]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.4} />
      </mesh>
    </RigidBody>
  );
}

function SecurityGate({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.6, 1.0, 0.1]} position={[0, 1.0, 0]} />
      <mesh position={[-0.5, 1.0, 0]}>
        <boxGeometry args={[0.12, 2.0, 0.15]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.5, 1.0, 0]}>
        <boxGeometry args={[0.12, 2.0, 0.15]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.15]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
      </mesh>
    </RigidBody>
  );
}

function LuggageCart({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.5, 0.35, 0.3]} position={[0, 0.35, 0]} />
      <mesh receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.6]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.5]} />
        <meshStandardMaterial color="#1e40af" roughness={0.6} />
      </mesh>
    </RigidBody>
  );
}

// Track rail - static, no physics
function TrackRail({ position, length, rotation }: { position: [number, number, number]; length: number; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.02, -0.3]}>
        <boxGeometry args={[length, 0.04, 0.06]} />
        <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.3]}>
        <boxGeometry args={[length, 0.04, 0.06]} />
        <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

interface DecoItem {
  type: string;
  pos: [number, number, number];
  rot: number;
  scale: number;
  color: string;
}

// Isolated list components
function HealthBoxList() {
  const healthBoxes = useGameStore(s => s.healthBoxes);
  return <>{healthBoxes.map(h => <HealthBox key={h.id} state={h} />)}</>;
}
function AmmoBoxList() {
  const ammoBoxes = useGameStore(s => s.ammoBoxes);
  return <>{ammoBoxes.map(a => <AmmoBox key={a.id} state={a} />)}</>;
}
function BarrelList() {
  const barrels = useGameStore(s => s.barrels);
  return <>{barrels.map(b => <Barrel key={b.id} state={b} />)}</>;
}

export function SurvivalArena() {
  const wave = useGameStore(s => s.survivalState?.wave || 0);
  const arenaSize = useGameStore(s => s.survivalState?.arenaSize || 30);
  const theme = useGameStore(s => s.theme);
  const colors = THEME_COLORS[theme] || THEME_COLORS.industrial;

  // Generate decorations — lean counts, physics only on obstacles
  const decorations = useMemo(() => {
    const decos: DecoItem[] = [];
    let seed = wave * 7777.777;
    const rand = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    const margin = 2.5;
    const sz = arenaSize;

    const randPos = (minDist = 5): [number, number, number] | null => {
      for (let a = 0; a < 5; a++) {
        const x = margin + 2 + rand() * (sz - margin * 2 - 4);
        const z = margin + 2 + rand() * (sz - margin * 2 - 4);
        if (Math.sqrt((x - sz / 2) ** 2 + (z - sz / 2) ** 2) > minDist) return [x, 0, z];
      }
      return null;
    };

    // Edge lamp posts (visual only, no physics — 2 per side max)
    for (let side = 0; side < 4; side++) {
      for (let j = 0; j < 2; j++) {
        const t = sz * (0.3 + j * 0.4);
        let px = 0, pz = 0;
        if (side === 0) { px = t; pz = margin; }
        else if (side === 1) { px = t; pz = sz - margin; }
        else if (side === 2) { px = margin; pz = t; }
        else { px = sz - margin; pz = t; }
        decos.push({ type: 'lamp', pos: [px, 0, pz], rot: 0, scale: 1, color: colors.glow });
      }
    }

    // Barriers (physics, 2-3)
    for (let i = 0; i < 3; i++) {
      const p = randPos(4);
      if (p) decos.push({ type: 'barrier', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
    }

    // Rubble (visual, 4-6)
    for (let i = 0; i < 5; i++) {
      decos.push({ type: 'rubble', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 0.6 + rand() * 1.0, color: '' });
    }

    switch (theme) {
      case 'industrial':
      case 'metro': {
        for (let i = 0; i < 4; i++) {
          const q = i;
          const qx = q < 2 ? margin + rand() * (sz * 0.25) : sz * 0.75 + rand() * (sz * 0.25 - margin);
          const qz = q % 2 === 0 ? margin + rand() * (sz * 0.25) : sz * 0.75 + rand() * (sz * 0.25 - margin);
          decos.push({ type: 'tree', pos: [qx, 0, qz], rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.6, color: '' });
        }
        for (let i = 0; i < 2; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'container', pos: p, rot: rand() * Math.PI, scale: 1, color: ['#991b1b', '#1e3a5f', '#374151'][Math.floor(rand() * 3)] });
        }
        decos.push({ type: 'billboard', pos: [sz * 0.25, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
        decos.push({ type: 'track', pos: [sz / 2, 0, sz * 0.2], rot: 0, scale: sz * 0.5, color: '' });
        if (wave > 3) decos.push({ type: 'train', pos: [sz * 0.35, 0, sz * 0.15 + rand() * 3], rot: rand() * 0.2, scale: 1, color: '' });
        break;
      }
      case 'desert': {
        for (let i = 0; i < 6; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'cactus', pos: p, rot: 0, scale: 0.7 + rand() * 0.8, color: '' });
        }
        for (let i = 0; i < 4; i++) {
          decos.push({ type: 'sand_dune', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1 + rand() * 2, color: '' });
        }
        const p = randPos(5);
        if (p) decos.push({ type: 'container', pos: p, rot: rand() * Math.PI, scale: 1, color: '#78350f' });
        break;
      }
      case 'space_station': {
        for (let i = 0; i < 4; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'tech_pillar', pos: p, rot: 0, scale: 1, color: colors.glow });
        }
        for (let i = 0; i < 3; i++) {
          decos.push({ type: 'holo_ring', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1, color: colors.glow });
        }
        decos.push({ type: 'billboard', pos: [sz * 0.3, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
        break;
      }
      case 'cemetery': {
        for (let i = 0; i < 8; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'tombstone', pos: p, rot: rand() * 0.3 - 0.15, scale: 0.7 + rand() * 0.5, color: '' });
        }
        for (let i = 0; i < 4; i++) {
          const q = i;
          const qx = q < 2 ? margin + rand() * (sz * 0.3) : sz * 0.7 + rand() * (sz * 0.3 - margin);
          const qz = q % 2 === 0 ? margin + rand() * (sz * 0.3) : sz * 0.7 + rand() * (sz * 0.3 - margin);
          decos.push({ type: 'tree', pos: [qx, 0, qz], rot: rand() * Math.PI * 2, scale: 0.9 + rand() * 0.5, color: '' });
        }
        for (let i = 0; i < 3; i++) {
          decos.push({ type: 'fog_pillar', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1, color: '#6366f1' });
        }
        break;
      }
      case 'garden': {
        for (let i = 0; i < 5; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'garden_bush', pos: p, rot: 0, scale: 0.6 + rand() * 0.8, color: '' });
        }
        for (let i = 0; i < 6; i++) {
          const fc = ['#ec4899', '#f59e0b', '#a855f7', '#ef4444'];
          decos.push({ type: 'flower', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1, color: fc[Math.floor(rand() * fc.length)] });
        }
        break;
      }
      case 'beach': {
        for (let i = 0; i < 5; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'palm_tree', pos: p, rot: 0, scale: 0.8 + rand() * 0.5, color: '' });
        }
        const uc = ['#ef4444', '#3b82f6', '#fbbf24', '#22c55e'];
        for (let i = 0; i < 3; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'umbrella', pos: p, rot: 0, scale: 1, color: uc[Math.floor(rand() * uc.length)] });
        }
        for (let i = 0; i < 3; i++) {
          decos.push({ type: 'sand_dune', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 0.8 + rand() * 1.5, color: '' });
        }
        break;
      }
      case 'airport': {
        for (let i = 0; i < 3; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'luggage_cart', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
        }
        for (let i = 0; i < 2; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'security_gate', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
        }
        // A few runway lights (static, just meshes)
        for (let i = 0; i < 6; i++) {
          decos.push({ type: 'runway_light', pos: [sz * 0.2 + i * (sz * 0.1), 0.02, sz * 0.25], rot: 0, scale: 1, color: '' });
        }
        decos.push({ type: 'billboard', pos: [sz * 0.3, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
        const p = randPos(5);
        if (p) decos.push({ type: 'container', pos: p, rot: rand() * Math.PI, scale: 1, color: '#1e40af' });
        break;
      }
      default: {
        for (let i = 0; i < 4; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'tree', pos: p, rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.6, color: '' });
        }
        break;
      }
    }
    return decos;
  }, [wave, arenaSize, theme, colors.glow, colors.accent]);

  // Instanced floor
  const floorTileSize = 2;
  const floorCount = Math.ceil(arenaSize / floorTileSize);
  const floorData = useMemo(() => {
    const tilesA: [number, number, number][] = [];
    const tilesB: [number, number, number][] = [];
    for (let x = 0; x < floorCount; x++) {
      for (let z = 0; z < floorCount; z++) {
        const pos: [number, number, number] = [x * floorTileSize + floorTileSize / 2, -0.01, z * floorTileSize + floorTileSize / 2];
        if ((x + z) % 2 === 0) tilesA.push(pos); else tilesB.push(pos);
      }
    }
    return { tilesA, tilesB };
  }, [floorCount]);
  const floorInstancedA = useRef<THREE.InstancedMesh>(null);
  const floorInstancedB = useRef<THREE.InstancedMesh>(null);
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(floorTileSize - 0.02, floorTileSize - 0.02), []);
  const floorMatA = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.floor, roughness: 0.85, metalness: 0.15 }), [colors.floor]);
  const floorMatB = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.floor2, roughness: 0.85, metalness: 0.15 }), [colors.floor2]);
  useEffect(() => {
    const mat = new THREE.Matrix4();
    const rot = new THREE.Euler(-Math.PI / 2, 0, 0);
    const quat = new THREE.Quaternion().setFromEuler(rot);
    const scale = new THREE.Vector3(1, 1, 1);
    if (floorInstancedA.current) {
      floorData.tilesA.forEach((pos, i) => {
        mat.compose(new THREE.Vector3(...pos), quat, scale);
        floorInstancedA.current!.setMatrixAt(i, mat);
      });
      floorInstancedA.current.instanceMatrix.needsUpdate = true;
    }
    if (floorInstancedB.current) {
      floorData.tilesB.forEach((pos, i) => {
        mat.compose(new THREE.Vector3(...pos), quat, scale);
        floorInstancedB.current!.setMatrixAt(i, mat);
      });
      floorInstancedB.current.instanceMatrix.needsUpdate = true;
    }
  }, [floorData]);

  return (
    <>
      <instancedMesh ref={floorInstancedA} args={[floorGeo, floorMatA, floorData.tilesA.length]} receiveShadow />
      <instancedMesh ref={floorInstancedB} args={[floorGeo, floorMatB, floorData.tilesB.length]} receiveShadow />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[arenaSize / 2, 0.005, arenaSize / 2]}>
        <planeGeometry args={[arenaSize, arenaSize]} />
        <meshStandardMaterial color={colors.grid} transparent opacity={0.03} />
      </mesh>

      <RigidBody type="fixed" colliders={false} userData={{ type: 'wall' }}>
        <CuboidCollider args={[arenaSize / 2 + 5, 2, 0.5]} position={[arenaSize / 2, 1, -0.5]} />
        <CuboidCollider args={[arenaSize / 2 + 5, 2, 0.5]} position={[arenaSize / 2, 1, arenaSize + 0.5]} />
        <CuboidCollider args={[0.5, 2, arenaSize / 2 + 5]} position={[-0.5, 1, arenaSize / 2]} />
        <CuboidCollider args={[0.5, 2, arenaSize / 2 + 5]} position={[arenaSize + 0.5, 1, arenaSize / 2]} />
      </RigidBody>

      {/* Arena edge glow */}
      {[
        { pos: [arenaSize / 2, 0.02, 0] as [number, number, number], rot: 0, w: arenaSize + 1 },
        { pos: [arenaSize / 2, 0.02, arenaSize] as [number, number, number], rot: 0, w: arenaSize + 1 },
        { pos: [0, 0.02, arenaSize / 2] as [number, number, number], rot: Math.PI / 2, w: arenaSize + 1 },
        { pos: [arenaSize, 0.02, arenaSize / 2] as [number, number, number], rot: Math.PI / 2, w: arenaSize + 1 },
      ].map((edge, i) => (
        <mesh key={i} position={edge.pos} rotation={[0, edge.rot, 0]}>
          <planeGeometry args={[edge.w, 0.2]} />
          <meshBasicMaterial color={colors.glow} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Corner obelisks (only 4 — the only animated decorations) */}
      <Obelisk position={[2.5, 0, 2.5]} color={colors.obelisk} />
      <Obelisk position={[arenaSize - 2.5, 0, 2.5]} color={colors.obelisk} />
      <Obelisk position={[2.5, 0, arenaSize - 2.5]} color={colors.obelisk} />
      <Obelisk position={[arenaSize - 2.5, 0, arenaSize - 2.5]} color={colors.obelisk} />

      {decorations.map((d, i) => {
        switch (d.type) {
          case 'tree': return <DeadTree key={`t${i}`} position={d.pos} scale={d.scale} />;
          case 'lamp': return <LampPost key={`l${i}`} position={d.pos} color={d.color} />;
          case 'container': return <CargoContainer key={`c${i}`} position={d.pos} rotation={d.rot} color={d.color} />;
          case 'billboard': return <Billboard key={`b${i}`} position={d.pos} color={d.color} />;
          case 'train': return <TrainWreckage key={`tw${i}`} position={d.pos} rotation={d.rot} />;
          case 'track': return <TrackRail key={`tr${i}`} position={d.pos} length={d.scale} rotation={d.rot} />;
          case 'barrier': return <Barrier key={`br${i}`} position={d.pos} rotation={d.rot} />;
          case 'rubble': return <Rubble key={`r${i}`} position={d.pos} scale={d.scale} />;
          case 'cactus': return <Cactus key={`ca${i}`} position={d.pos} scale={d.scale} />;
          case 'sand_dune': return <SandDune key={`sd${i}`} position={d.pos} scale={d.scale} />;
          case 'tombstone': return <Tombstone key={`ts${i}`} position={d.pos} rotation={d.rot} scale={d.scale} />;
          case 'fog_pillar': return <FogPillar key={`fp${i}`} position={d.pos} color={d.color} />;
          case 'palm_tree': return <PalmTree key={`pt${i}`} position={d.pos} scale={d.scale} />;
          case 'umbrella': return <BeachUmbrella key={`bu${i}`} position={d.pos} color={d.color} />;
          case 'tech_pillar': return <TechPillar key={`tp${i}`} position={d.pos} color={d.color} />;
          case 'holo_ring': return <HoloRing key={`hr${i}`} position={d.pos} color={d.color} />;
          case 'flower': return <FlowerPatch key={`fl${i}`} position={d.pos} color={d.color} />;
          case 'garden_bush': return <GardenBush key={`gb${i}`} position={d.pos} scale={d.scale} />;
          case 'runway_light': return <RunwayLight key={`rl${i}`} position={d.pos} />;
          case 'luggage_cart': return <LuggageCart key={`lc${i}`} position={d.pos} rotation={d.rot} />;
          case 'security_gate': return <SecurityGate key={`sg${i}`} position={d.pos} rotation={d.rot} />;
          default: return null;
        }
      })}

      <HealthBoxList />
      <AmmoBoxList />
      <BarrelList />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[arenaSize / 2, -0.05, arenaSize / 2]}>
        <planeGeometry args={[arenaSize + 40, arenaSize + 40]} />
        <meshBasicMaterial color={colors.fog} />
      </mesh>
    </>
  );
}
