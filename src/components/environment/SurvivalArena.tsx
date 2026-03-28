import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import * as THREE from 'three';
import { HealthBox } from '../entities/HealthBox';
import { AmmoBox } from '../entities/AmmoBox';
import { Barrel } from '../entities/Barrel';
import { obstacleCache } from '../../game/positionCache';

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
      {/* Two leg colliders — gap between is passable */}
      <CuboidCollider args={[0.08, 1.0, 0.08]} position={[-0.6, 1.0, 0]} />
      <CuboidCollider args={[0.08, 1.0, 0.08]} position={[0.6, 1.0, 0]} />
      {/* Sign panel collider at top only */}
      <CuboidCollider args={[0.8, 0.3, 0.06]} position={[0, 2.1, 0]} />
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

// --- Defensive structures (with physics — players can enter/hide) ---

function Bunker({ position, rotation, color }: { position: [number, number, number]; rotation: number; color: string }) {
  // Half-open castle: 3 walls + roof, open on one side for entry
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      {/* Back wall */}
      <CuboidCollider args={[2.0, 1.0, 0.15]} position={[0, 1.0, -1.5]} />
      <mesh position={[0, 1.0, -1.5]}>
        <boxGeometry args={[4.0, 2.0, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Left wall */}
      <CuboidCollider args={[0.15, 1.0, 1.5]} position={[-1.85, 1.0, 0]} />
      <mesh position={[-1.85, 1.0, 0]}>
        <boxGeometry args={[0.3, 2.0, 3.0]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Right wall */}
      <CuboidCollider args={[0.15, 1.0, 1.5]} position={[1.85, 1.0, 0]} />
      <mesh position={[1.85, 1.0, 0]}>
        <boxGeometry args={[0.3, 2.0, 3.0]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Roof slab */}
      <mesh position={[0, 2.05, -0.25]}>
        <boxGeometry args={[4.0, 0.15, 2.5]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.15} />
      </mesh>
      {/* Battlements on back wall */}
      {[-1.4, -0.5, 0.5, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 2.35, -1.5]}>
          <boxGeometry args={[0.5, 0.5, 0.35]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0.15} />
        </mesh>
      ))}
      {/* Side battlements */}
      {[-0.8, 0.8].map((z, i) => (
        <group key={`s${i}`}>
          <mesh position={[-1.85, 2.35, z]}>
            <boxGeometry args={[0.35, 0.5, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.9} metalness={0.15} />
          </mesh>
          <mesh position={[1.85, 2.35, z]}>
            <boxGeometry args={[0.35, 0.5, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.9} metalness={0.15} />
          </mesh>
        </group>
      ))}
    </RigidBody>
  );
}

function SandbagWall({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  // L-shaped sandbag cover
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      {/* Long side */}
      <CuboidCollider args={[1.2, 0.35, 0.25]} position={[0, 0.35, 0]} />
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.4, 0.7, 0.5]} />
        <meshStandardMaterial color="#8B7355" roughness={0.95} />
      </mesh>
      {/* Short side (L bend) */}
      <CuboidCollider args={[0.25, 0.35, 0.6]} position={[-1.15, 0.35, -0.85]} />
      <mesh position={[-1.15, 0.35, -0.85]}>
        <boxGeometry args={[0.5, 0.7, 1.2]} />
        <meshStandardMaterial color="#8B7355" roughness={0.95} />
      </mesh>
      {/* Sandbag texture bumps */}
      {[[-0.6, 0.6, 0.2], [0.3, 0.55, 0.2], [-0.1, 0.75, 0.15]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.15, 5, 4]} />
          <meshStandardMaterial color="#9B8565" roughness={0.98} />
        </mesh>
      ))}
    </RigidBody>
  );
}

function WatchTower({ position, color }: { position: [number, number, number]; color: string }) {
  // Small raised platform with half-walls — provides elevated cover
  return (
    <RigidBody type="fixed" position={position} colliders={false} userData={{ type: 'wall' }}>
      {/* 4 legs */}
      {[[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].map(([x, z], i) => (
        <mesh key={`leg${i}`} position={[x, 0.75, z]}>
          <cylinderGeometry args={[0.06, 0.08, 1.5, 5]} />
          <meshStandardMaterial color="#4a3728" roughness={0.9} />
        </mesh>
      ))}
      {/* Platform */}
      <CuboidCollider args={[1.0, 0.06, 1.0]} position={[0, 1.5, 0]} />
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.0, 0.12, 2.0]} />
        <meshStandardMaterial color="#5c4033" roughness={0.85} />
      </mesh>
      {/* Half-walls (2 sides only, leaving 2 sides open) */}
      <CuboidCollider args={[1.0, 0.3, 0.06]} position={[0, 1.86, -0.94]} />
      <mesh position={[0, 1.86, -0.94]}>
        <boxGeometry args={[2.0, 0.6, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
      <CuboidCollider args={[0.06, 0.3, 1.0]} position={[-0.94, 1.86, 0]} />
      <mesh position={[-0.94, 1.86, 0]}>
        <boxGeometry args={[0.12, 0.6, 2.0]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
    </RigidBody>
  );
}

function Crate({ position, scale = 1, color }: { position: [number, number, number]; scale?: number; color: string }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Cross slats */}
      <mesh position={[0, 0.3, 0.31]}>
        <boxGeometry args={[0.5, 0.05, 0.01]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0.31]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.5, 0.05, 0.01]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Pipe({ position, rotation, length = 3 }: { position: [number, number, number]; rotation: number; length?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, length, 8]} />
        <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ServerRack({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 1.6, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      {[0.3, 0.6, 0.9, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.21]}>
          <boxGeometry args={[0.4, 0.08, 0.01]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function Crypt({ position, rotation, color }: { position: [number, number, number]; rotation: number; color: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.4, 1.0, 1.0]} />
        <meshStandardMaterial color="#4a4a50" roughness={0.9} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.15, 0]} scale={[1.5, 0.35, 1.1]}>
        <coneGeometry args={[0.6, 1, 4]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.9} />
      </mesh>
      {/* Door opening (dark) */}
      <mesh position={[0, 0.35, 0.51]}>
        <boxGeometry args={[0.4, 0.7, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Glow accent */}
      <mesh position={[0, 0.9, 0.51]}>
        <boxGeometry args={[0.3, 0.05, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Gazebo({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* 4 pillars */}
      {[[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.0, z]}>
          <cylinderGeometry args={[0.06, 0.06, 2.0, 6]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.5} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 2.2, 0]}>
        <coneGeometry args={[1.4, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Base circle */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 8]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.6} />
      </mesh>
    </group>
  );
}

function LifeguardTower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Legs */}
      {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.0, z]}>
          <cylinderGeometry args={[0.05, 0.07, 2.0, 5]} />
          <meshStandardMaterial color="#d4a373" roughness={0.8} />
        </mesh>
      ))}
      {/* Platform */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[1.3, 0.1, 1.3]} />
        <meshStandardMaterial color="#d4a373" roughness={0.8} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[1.1, 0.8, 1.1]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[1.3, 0.08, 1.3]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>
    </group>
  );
}

function ControlTower({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 2.4, 0.8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 2.1, 0.41]}>
        <boxGeometry args={[0.6, 0.4, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 4]} />
        <meshStandardMaterial color="#6b7280" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Windsock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3.0, 4]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, 2.9, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.12, 0.6, 4]} />
        <meshStandardMaterial color="#f97316" roughness={0.6} />
      </mesh>
    </group>
  );
}

function IronFence({ position, rotation, length = 3 }: { position: [number, number, number]; rotation: number; length?: number }) {
  const count = Math.floor(length / 0.3);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Horizontal rail */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[length, 0.04, 0.04]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[length, 0.04, 0.04]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Vertical bars */}
      {Array.from({ length: count }, (_, i) => {
        const x = -length / 2 + i * (length / count) + length / count / 2;
        return (
          <mesh key={i} position={[x, 0.47, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.85, 4]} />
            <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
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

    // Barriers (physics, 3-4)
    for (let i = 0; i < 4; i++) {
      const p = randPos(4);
      if (p) decos.push({ type: 'barrier', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
    }

    // Sandbag walls (physics, 2)
    for (let i = 0; i < 2; i++) {
      const p = randPos(5);
      if (p) decos.push({ type: 'sandbag', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
    }

    // Bunker/fort — 1 per arena, always present
    {
      const bunkerPos = randPos(6);
      const bunkerColors: Record<string, string> = {
        industrial: '#4a5568', desert: '#92775a', space_station: '#1e293b', cemetery: '#3a3a40',
        metro: '#44403c', garden: '#5c7a50', beach: '#c4a882', airport: '#475569',
      };
      if (bunkerPos) decos.push({ type: 'bunker', pos: bunkerPos, rot: rand() * Math.PI * 2, scale: 1, color: bunkerColors[theme] || '#4a5568' });
    }

    // Rubble (visual, 6-8)
    for (let i = 0; i < 7; i++) {
      decos.push({ type: 'rubble', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 0.6 + rand() * 1.0, color: '' });
    }

    // Crates (visual, 3-5)
    for (let i = 0; i < 4; i++) {
      const crateColors = ['#5c4033', '#6b4423', '#78593a', '#4a3728'];
      decos.push({ type: 'crate', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 0.7 + rand() * 0.6, color: crateColors[Math.floor(rand() * crateColors.length)] });
    }

    switch (theme) {
      case 'industrial':
      case 'metro': {
        for (let i = 0; i < 5; i++) {
          const q = i;
          const qx = q < 2 ? margin + rand() * (sz * 0.25) : sz * 0.75 + rand() * (sz * 0.25 - margin);
          const qz = q % 2 === 0 ? margin + rand() * (sz * 0.25) : sz * 0.75 + rand() * (sz * 0.25 - margin);
          decos.push({ type: 'tree', pos: [qx, 0, qz], rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.6, color: '' });
        }
        for (let i = 0; i < 3; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'container', pos: p, rot: rand() * Math.PI, scale: 1, color: ['#991b1b', '#1e3a5f', '#374151'][Math.floor(rand() * 3)] });
        }
        decos.push({ type: 'billboard', pos: [sz * 0.25, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
        decos.push({ type: 'billboard', pos: [sz * 0.7, 0, sz - margin - 1], rot: Math.PI, scale: 1, color: colors.glow });
        decos.push({ type: 'track', pos: [sz / 2, 0, sz * 0.2], rot: 0, scale: sz * 0.5, color: '' });
        if (wave > 3) decos.push({ type: 'train', pos: [sz * 0.35, 0, sz * 0.15 + rand() * 3], rot: rand() * 0.2, scale: 1, color: '' });
        // Pipes and watchtower for industrial feel
        for (let i = 0; i < 3; i++) {
          decos.push({ type: 'pipe', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: rand() * Math.PI, scale: 2 + rand() * 3, color: '' });
        }
        { const p = randPos(6); if (p) decos.push({ type: 'watchtower', pos: p, rot: 0, scale: 1, color: colors.accent }); }
        break;
      }
      case 'desert': {
        for (let i = 0; i < 8; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'cactus', pos: p, rot: 0, scale: 0.7 + rand() * 0.8, color: '' });
        }
        for (let i = 0; i < 6; i++) {
          decos.push({ type: 'sand_dune', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1 + rand() * 2, color: '' });
        }
        for (let i = 0; i < 2; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'container', pos: p, rot: rand() * Math.PI, scale: 1, color: '#78350f' });
        }
        { const p = randPos(6); if (p) decos.push({ type: 'watchtower', pos: p, rot: 0, scale: 1, color: '#92400e' }); }
        break;
      }
      case 'space_station': {
        for (let i = 0; i < 6; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'tech_pillar', pos: p, rot: 0, scale: 1, color: colors.glow });
        }
        for (let i = 0; i < 5; i++) {
          decos.push({ type: 'holo_ring', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1, color: colors.glow });
        }
        for (let i = 0; i < 3; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'server_rack', pos: p, rot: 0, scale: 1, color: colors.glow });
        }
        decos.push({ type: 'billboard', pos: [sz * 0.3, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
        decos.push({ type: 'billboard', pos: [sz * 0.65, 0, sz - margin - 1], rot: Math.PI, scale: 1, color: colors.glow });
        break;
      }
      case 'cemetery': {
        for (let i = 0; i < 12; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'tombstone', pos: p, rot: rand() * 0.3 - 0.15, scale: 0.7 + rand() * 0.5, color: '' });
        }
        for (let i = 0; i < 5; i++) {
          const q = i;
          const qx = q < 2 ? margin + rand() * (sz * 0.3) : sz * 0.7 + rand() * (sz * 0.3 - margin);
          const qz = q % 2 === 0 ? margin + rand() * (sz * 0.3) : sz * 0.7 + rand() * (sz * 0.3 - margin);
          decos.push({ type: 'tree', pos: [qx, 0, qz], rot: rand() * Math.PI * 2, scale: 0.9 + rand() * 0.5, color: '' });
        }
        for (let i = 0; i < 5; i++) {
          decos.push({ type: 'fog_pillar', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1, color: '#6366f1' });
        }
        // Crypts
        for (let i = 0; i < 2; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'crypt', pos: p, rot: rand() * Math.PI, scale: 1, color: '#6366f1' });
        }
        // Iron fences
        for (let i = 0; i < 3; i++) {
          decos.push({ type: 'iron_fence', pos: [margin + 2 + rand() * (sz - margin * 2 - 4), 0, margin + 2 + rand() * (sz - margin * 2 - 4)], rot: rand() * Math.PI, scale: 2 + rand() * 2, color: '' });
        }
        break;
      }
      case 'garden': {
        for (let i = 0; i < 8; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'garden_bush', pos: p, rot: 0, scale: 0.6 + rand() * 0.8, color: '' });
        }
        for (let i = 0; i < 10; i++) {
          const fc = ['#ec4899', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6'];
          decos.push({ type: 'flower', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 1, color: fc[Math.floor(rand() * fc.length)] });
        }
        // Gazebo
        { const p = randPos(6); if (p) decos.push({ type: 'gazebo', pos: p, rot: 0, scale: 1, color: '#22c55e' }); }
        // Iron fences
        for (let i = 0; i < 2; i++) {
          decos.push({ type: 'iron_fence', pos: [margin + 2 + rand() * (sz - margin * 2 - 4), 0, margin + 2 + rand() * (sz - margin * 2 - 4)], rot: rand() * Math.PI, scale: 2 + rand() * 2, color: '' });
        }
        break;
      }
      case 'beach': {
        for (let i = 0; i < 7; i++) {
          const p = randPos(3);
          if (p) decos.push({ type: 'palm_tree', pos: p, rot: 0, scale: 0.8 + rand() * 0.5, color: '' });
        }
        const uc = ['#ef4444', '#3b82f6', '#fbbf24', '#22c55e'];
        for (let i = 0; i < 5; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'umbrella', pos: p, rot: 0, scale: 1, color: uc[Math.floor(rand() * uc.length)] });
        }
        for (let i = 0; i < 5; i++) {
          decos.push({ type: 'sand_dune', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 0.8 + rand() * 1.5, color: '' });
        }
        // Lifeguard tower
        { const p = randPos(6); if (p) decos.push({ type: 'lifeguard', pos: p, rot: 0, scale: 1, color: '' }); }
        break;
      }
      case 'airport': {
        for (let i = 0; i < 4; i++) {
          const p = randPos(4);
          if (p) decos.push({ type: 'luggage_cart', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
        }
        for (let i = 0; i < 3; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'security_gate', pos: p, rot: rand() * Math.PI, scale: 1, color: '' });
        }
        // Runway lights — two rows
        for (let i = 0; i < 8; i++) {
          decos.push({ type: 'runway_light', pos: [sz * 0.15 + i * (sz * 0.09), 0.02, sz * 0.25], rot: 0, scale: 1, color: '' });
          decos.push({ type: 'runway_light', pos: [sz * 0.15 + i * (sz * 0.09), 0.02, sz * 0.75], rot: 0, scale: 1, color: '' });
        }
        decos.push({ type: 'billboard', pos: [sz * 0.3, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
        for (let i = 0; i < 2; i++) {
          const p = randPos(5);
          if (p) decos.push({ type: 'container', pos: p, rot: rand() * Math.PI, scale: 1, color: '#1e40af' });
        }
        // Control tower + windsock
        { const p = randPos(6); if (p) decos.push({ type: 'control_tower', pos: p, rot: 0, scale: 1, color: colors.glow }); }
        { const p = randPos(4); if (p) decos.push({ type: 'windsock', pos: p, rot: 0, scale: 1, color: '' }); }
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
    // --- Compute obstacle AABBs synchronously from deco data ---
    // This runs inside useMemo so it's guaranteed to be done before any frame renders.
    obstacleCache.clear();

    // Helper to compute rotated AABB
    const addAABB = (cx: number, cz: number, halfX: number, halfZ: number, rot: number = 0) => {
      const cosR = Math.abs(Math.cos(rot));
      const sinR = Math.abs(Math.sin(rot));
      const rHx = halfX * cosR + halfZ * sinR;
      const rHz = halfX * sinR + halfZ * cosR;
      obstacleCache.add({ minX: cx - rHx, maxX: cx + rHx, minZ: cz - rHz, maxZ: cz + rHz });
    };

    // Obelisks (corner pillars, always present)
    addAABB(2.5, 2.5, 0.6, 0.6);
    addAABB(sz - 2.5, 2.5, 0.6, 0.6);
    addAABB(2.5, sz - 2.5, 0.6, 0.6);
    addAABB(sz - 2.5, sz - 2.5, 0.6, 0.6);

    for (const d of decos) {
      const cx = d.pos[0], cz = d.pos[2];
      switch (d.type) {
        case 'container':
          addAABB(cx, cz, 1.2, 0.5, d.rot);
          break;
        case 'barrier':
          addAABB(cx, cz, 0.8, 0.25, d.rot);
          break;
        case 'train':
          addAABB(cx, cz, 2, 0.6, d.rot);
          break;
        case 'billboard':
          // Two narrow leg AABBs + sign panel at top (gap between legs is passable)
          addAABB(cx - 0.6, cz, 0.08, 0.08);
          addAABB(cx + 0.6, cz, 0.08, 0.08);
          break;
        case 'security_gate':
          addAABB(cx, cz, 0.6, 0.1, d.rot);
          break;
        case 'luggage_cart':
          addAABB(cx, cz, 0.5, 0.3, d.rot);
          break;
        case 'sandbag': {
          // Long side
          addAABB(cx, cz, 1.2, 0.25, d.rot);
          // Short side (L-bend) offset by [-1.15, -0.85] rotated
          const cos = Math.cos(d.rot), sin = Math.sin(d.rot);
          const sx = cx + (-1.15) * cos - (-0.85) * sin;
          const sz2 = cz + (-1.15) * sin + (-0.85) * cos;
          obstacleCache.add({ minX: sx - 0.4, maxX: sx + 0.4, minZ: sz2 - 0.7, maxZ: sz2 + 0.7 });
          break;
        }
        case 'bunker': {
          // 3 walls: back, left, right
          const cos = Math.cos(d.rot), sin = Math.sin(d.rot);
          // Back wall at offset [0, -1.5]
          const bx = cx + 1.5 * sin;
          const bz = cz + (-1.5) * cos;
          obstacleCache.add({ minX: bx - 2.0, maxX: bx + 2.0, minZ: bz - 0.3, maxZ: bz + 0.3 });
          // Left wall at offset [-1.85, 0]
          const lx = cx + (-1.85) * cos;
          const lz = cz + (-1.85) * sin;
          obstacleCache.add({ minX: lx - 0.3, maxX: lx + 0.3, minZ: lz - 1.5, maxZ: lz + 1.5 });
          // Right wall at offset [1.85, 0]
          const rx = cx + 1.85 * cos;
          const rz = cz + 1.85 * sin;
          obstacleCache.add({ minX: rx - 0.3, maxX: rx + 0.3, minZ: rz - 1.5, maxZ: rz + 1.5 });
          break;
        }
        case 'watchtower': {
          // Back half-wall and left half-wall
          obstacleCache.add({ minX: cx - 1.0, maxX: cx + 1.0, minZ: cz - 1.05, maxZ: cz - 0.83 });
          obstacleCache.add({ minX: cx - 1.05, maxX: cx - 0.83, minZ: cz - 1.0, maxZ: cz + 1.0 });
          break;
        }
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
          case 'bunker': return <Bunker key={`bk${i}`} position={d.pos} rotation={d.rot} color={d.color} />;
          case 'sandbag': return <SandbagWall key={`sb${i}`} position={d.pos} rotation={d.rot} />;
          case 'watchtower': return <WatchTower key={`wt${i}`} position={d.pos} color={d.color} />;
          case 'crate': return <Crate key={`cr${i}`} position={d.pos} scale={d.scale} color={d.color} />;
          case 'pipe': return <Pipe key={`pp${i}`} position={d.pos} rotation={d.rot} length={d.scale} />;
          case 'server_rack': return <ServerRack key={`sr${i}`} position={d.pos} color={d.color} />;
          case 'crypt': return <Crypt key={`cy${i}`} position={d.pos} rotation={d.rot} color={d.color} />;
          case 'gazebo': return <Gazebo key={`gz${i}`} position={d.pos} color={d.color} />;
          case 'lifeguard': return <LifeguardTower key={`lg${i}`} position={d.pos} />;
          case 'control_tower': return <ControlTower key={`ct${i}`} position={d.pos} color={d.color} />;
          case 'windsock': return <Windsock key={`ws${i}`} position={d.pos} />;
          case 'iron_fence': return <IronFence key={`if${i}`} position={d.pos} rotation={d.rot} length={d.scale} />;
          default: return null;
        }
      })}

      <HealthBoxList />
      <AmmoBoxList />
      <BarrelList />

      {/* Ambient floating dust particles (static, generated per wave) */}
      <AmbientDust arenaSize={arenaSize} color={colors.glow} wave={wave} />

      {/* Animated sweeping spotlights */}
      <SpotlightSweep arenaSize={arenaSize} color={colors.glow} />

      {/* Wave event lighting */}
      <WaveEventLighting arenaSize={arenaSize} />

      {/* Extended ground beyond arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[arenaSize / 2, -0.05, arenaSize / 2]}>
        <planeGeometry args={[arenaSize + 80, arenaSize + 80]} />
        <meshStandardMaterial color={colors.fog} roughness={1} metalness={0} />
      </mesh>

      {/* Visible boundary walls — low-profile themed walls around arena perimeter */}
      <ArenaWalls arenaSize={arenaSize} color={colors.accent} glowColor={colors.glow} />

      {/* Beyond-boundary scenery — distant structures/terrain visible outside arena */}
      <BeyondScenery arenaSize={arenaSize} theme={theme} colors={colors} />

      {/* Floor ground markings — hazard lines, center marker, lane lines */}
      <FloorMarkings arenaSize={arenaSize} glowColor={colors.glow} accentColor={colors.accent} />

      {/* Fog volume pillars around edges for depth */}
      {[0, 1, 2, 3].map(side => {
        const cx = arenaSize / 2;
        const positions: [number, number, number][] = side === 0
          ? [[-8, 0.5, cx], [-12, 1, cx * 0.5], [-10, 0.8, cx * 1.5]]
          : side === 1
          ? [[arenaSize + 8, 0.5, cx], [arenaSize + 12, 1, cx * 0.5], [arenaSize + 10, 0.8, cx * 1.5]]
          : side === 2
          ? [[cx, 0.5, -8], [cx * 0.5, 1, -12], [cx * 1.5, 0.8, -10]]
          : [[cx, 0.5, arenaSize + 8], [cx * 0.5, 1, arenaSize + 12], [cx * 1.5, 0.8, arenaSize + 10]];
        return positions.map((p, j) => (
          <mesh key={`fog-${side}-${j}`} position={p}>
            <cylinderGeometry args={[2, 3, 4, 6]} />
            <meshBasicMaterial color={colors.fog} transparent opacity={0.15} />
          </mesh>
        ));
      })}
    </>
  );
}

// Visible boundary walls — detailed with panels, warning stripes, and mounted lights
function ArenaWalls({ arenaSize, color, glowColor }: { arenaSize: number; color: string; glowColor: string }) {
  const half = arenaSize / 2;
  const wallH = 1.8;
  const wallThick = 0.35;

  // Generate wall panel segments for visual detail
  const panelCount = Math.floor(arenaSize / 3);

  return (
    <group>
      {/* Four wall segments */}
      {[
        { pos: [half, wallH / 2, -wallThick / 2] as [number, number, number], args: [arenaSize + 1, wallH, wallThick] as [number, number, number], axis: 'x' as const },
        { pos: [half, wallH / 2, arenaSize + wallThick / 2] as [number, number, number], args: [arenaSize + 1, wallH, wallThick] as [number, number, number], axis: 'x' as const },
        { pos: [-wallThick / 2, wallH / 2, half] as [number, number, number], args: [wallThick, wallH, arenaSize + 1] as [number, number, number], axis: 'z' as const },
        { pos: [arenaSize + wallThick / 2, wallH / 2, half] as [number, number, number], args: [wallThick, wallH, arenaSize + 1] as [number, number, number], axis: 'z' as const },
      ].map((w, i) => (
        <group key={`wall-${i}`}>
          {/* Base wall */}
          <mesh position={w.pos}>
            <boxGeometry args={w.args} />
            <meshStandardMaterial color={color} roughness={0.8} metalness={0.3} />
          </mesh>
          {/* Bottom warning stripe */}
          <mesh position={[w.pos[0], 0.06, w.pos[2]]}>
            <boxGeometry args={[w.args[0] + 0.02, 0.12, w.args[2] + 0.02]} />
            <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={0.8} />
          </mesh>
          {/* Top cap */}
          <mesh position={[w.pos[0], wallH + 0.04, w.pos[2]]}>
            <boxGeometry args={[w.args[0] + 0.06, 0.08, w.args[2] + 0.06]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Panel seam lines along wall */}
          {Array.from({ length: panelCount }, (_, j) => {
            const t = (j + 0.5) * (arenaSize / panelCount);
            const seamPos: [number, number, number] = w.axis === 'x'
              ? [t, wallH / 2, w.pos[2] + (i === 0 ? 0.18 : -0.18)]
              : [w.pos[0] + (i === 2 ? 0.18 : -0.18), wallH / 2, t];
            return (
              <mesh key={`seam-${j}`} position={seamPos}>
                <boxGeometry args={w.axis === 'x' ? [0.03, wallH * 0.85, 0.01] : [0.01, wallH * 0.85, 0.03]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.3} />
              </mesh>
            );
          })}
        </group>
      ))}
      {/* Corner pillars with lights */}
      {[
        [0, 0], [arenaSize, 0], [0, arenaSize], [arenaSize, arenaSize]
      ].map(([x, z], i) => (
        <group key={`corner-${i}`}>
          <mesh position={[x, wallH * 0.55, z]}>
            <boxGeometry args={[0.7, wallH * 1.1, 0.7]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} />
          </mesh>
          {/* Pillar cap */}
          <mesh position={[x, wallH * 1.15, z]}>
            <boxGeometry args={[0.8, 0.1, 0.8]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Corner light */}
          <mesh position={[x, wallH * 1.25, z]}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={4} />
          </mesh>
          <pointLight position={[x, wallH * 1.3, z]} color={glowColor} intensity={3} distance={8} />
        </group>
      ))}
      {/* Wall-mounted lights along each wall */}
      {[0, 1, 2, 3].map(side =>
        Array.from({ length: 3 }, (_, j) => {
          const t = arenaSize * (0.2 + j * 0.3);
          let lp: [number, number, number];
          if (side === 0) lp = [t, wallH * 0.7, 0.2];
          else if (side === 1) lp = [t, wallH * 0.7, arenaSize - 0.2];
          else if (side === 2) lp = [0.2, wallH * 0.7, t];
          else lp = [arenaSize - 0.2, wallH * 0.7, t];
          return (
            <group key={`wl-${side}-${j}`}>
              <mesh position={lp}>
                <boxGeometry args={[0.2, 0.1, 0.2]} />
                <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={2} />
              </mesh>
              <pointLight position={[lp[0], lp[1] - 0.3, lp[2]]} color={glowColor} intensity={1.5} distance={5} />
            </group>
          );
        })
      )}
    </group>
  );
}

// Distant scenery beyond the arena boundaries — creates a rich skyline/backdrop
function BeyondScenery({ arenaSize, theme, colors }: { arenaSize: number; theme: string; colors: typeof THEME_COLORS[string] }) {
  const scenery = useMemo(() => {
    const items: { type: string; pos: [number, number, number]; scale: number; w: number; d: number; color: string }[] = [];
    let seed = 42424.2;
    const rand = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

    // Near ring — detailed structures close to arena (5-15 units out)
    for (let i = 0; i < 24; i++) {
      const side = i % 4;
      const dist = 5 + rand() * 12;
      const along = -5 + rand() * (arenaSize + 10);
      let x = 0, z = 0;
      if (side === 0) { x = along; z = -dist; }
      else if (side === 1) { x = along; z = arenaSize + dist; }
      else if (side === 2) { x = -dist; z = along; }
      else { x = arenaSize + dist; z = along; }

      const height = 2 + rand() * 8;
      const itemType = theme === 'desert' || theme === 'beach' ? 'terrain'
        : theme === 'cemetery' ? 'ruin'
        : theme === 'garden' ? 'nature'
        : 'structure';
      items.push({ type: itemType, pos: [x, 0, z], scale: height, w: 1.5 + rand() * 3, d: 1.5 + rand() * 2, color: colors.accent });
    }

    // Far ring — tall skyline silhouettes (20-40 units out)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + rand() * 0.3;
      const dist = 25 + rand() * 20;
      const cx = arenaSize / 2 + Math.cos(angle) * dist;
      const cz = arenaSize / 2 + Math.sin(angle) * dist;
      const height = 8 + rand() * 25;
      const itemType = theme === 'desert' || theme === 'beach' ? 'terrain'
        : theme === 'cemetery' ? 'ruin'
        : theme === 'garden' ? 'nature'
        : 'skyline';
      items.push({ type: itemType, pos: [cx, 0, cz], scale: height, w: 2 + rand() * 5, d: 2 + rand() * 4, color: colors.accent });
    }

    // Extra props near walls — debris, vehicles, equipment
    for (let i = 0; i < 12; i++) {
      const side = i % 4;
      const dist = 2 + rand() * 4;
      const along = rand() * arenaSize;
      let x = 0, z = 0;
      if (side === 0) { x = along; z = -dist; }
      else if (side === 1) { x = along; z = arenaSize + dist; }
      else if (side === 2) { x = -dist; z = along; }
      else { x = arenaSize + dist; z = along; }
      items.push({ type: 'prop', pos: [x, 0, z], scale: 0.5 + rand() * 1.5, w: 1, d: 1, color: colors.accent });
    }

    return items;
  }, [arenaSize, theme, colors.accent]);

  return (
    <group>
      {scenery.map((s, i) => {
        if (s.type === 'structure') {
          return (
            <group key={`sc-${i}`} position={s.pos}>
              <mesh position={[0, s.scale / 2, 0]}>
                <boxGeometry args={[s.w, s.scale, s.d]} />
                <meshStandardMaterial color={s.color} roughness={0.8} metalness={0.3} />
              </mesh>
              {/* Window grid */}
              {Array.from({ length: Math.min(Math.floor(s.scale / 2), 6) }, (_, j) => (
                <mesh key={j} position={[0, 1.2 + j * 2, s.d / 2 + 0.01]}>
                  <planeGeometry args={[s.w * 0.7, 1.2]} />
                  <meshStandardMaterial color="#000" emissive={colors.glow} emissiveIntensity={0.15} transparent opacity={0.4} />
                </mesh>
              ))}
              {/* Roof detail */}
              <mesh position={[0, s.scale + 0.1, 0]}>
                <boxGeometry args={[s.w * 0.6, 0.2, s.d * 0.6]} />
                <meshStandardMaterial color={s.color} roughness={0.6} metalness={0.5} />
              </mesh>
            </group>
          );
        }
        if (s.type === 'skyline') {
          // Tall distant buildings — simpler geometry, darker silhouette
          return (
            <group key={`sc-${i}`} position={s.pos}>
              <mesh position={[0, s.scale / 2, 0]}>
                <boxGeometry args={[s.w, s.scale, s.d]} />
                <meshStandardMaterial color={colors.fog} roughness={0.9} metalness={0.2} />
              </mesh>
              {/* Scattered lit windows */}
              {Array.from({ length: Math.min(Math.floor(s.scale / 3), 8) }, (_, j) => {
                const wx = (Math.sin(i * 17 + j * 73) * 0.5 + 0.5) * s.w * 0.6 - s.w * 0.3;
                return (
                  <mesh key={j} position={[wx, 1.5 + j * 3, s.d / 2 + 0.01]}>
                    <planeGeometry args={[0.5, 0.8]} />
                    <meshStandardMaterial color={colors.glow} emissive={colors.glow} emissiveIntensity={0.5} transparent opacity={0.3} />
                  </mesh>
                );
              })}
              {/* Antenna/spire on top */}
              {s.scale > 15 && (
                <mesh position={[0, s.scale + 1, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 2, 4]} />
                  <meshStandardMaterial color={colors.accent} metalness={0.8} roughness={0.2} />
                </mesh>
              )}
              {/* Red warning light on tall buildings */}
              {s.scale > 18 && (
                <mesh position={[0, s.scale + 2.1, 0]}>
                  <sphereGeometry args={[0.1, 4, 4]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
                </mesh>
              )}
            </group>
          );
        }
        if (s.type === 'terrain') {
          return (
            <group key={`sc-${i}`} position={s.pos}>
              <mesh position={[0, s.scale * 0.15, 0]} scale={[s.w, s.scale * 0.3, s.d]}>
                <sphereGeometry args={[1, 5, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={s.color} roughness={1} />
              </mesh>
              {/* Secondary mound */}
              <mesh position={[s.w * 0.6, s.scale * 0.08, s.d * 0.3]} scale={[s.w * 0.5, s.scale * 0.15, s.d * 0.6]}>
                <sphereGeometry args={[1, 4, 3, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={s.color} roughness={1} />
              </mesh>
            </group>
          );
        }
        if (s.type === 'ruin') {
          const h = s.scale * 0.6;
          return (
            <group key={`sc-${i}`} position={s.pos}>
              <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[s.w || 1.5, h, s.d || 1]} />
                <meshStandardMaterial color="#3f3f46" roughness={0.9} />
              </mesh>
              {/* Broken top section */}
              <mesh position={[s.w * 0.2, h * 0.9, 0]}>
                <boxGeometry args={[s.w * 0.4, h * 0.3, (s.d || 1) * 1.05]} />
                <meshStandardMaterial color="#27272a" roughness={0.95} />
              </mesh>
              {/* Rubble at base */}
              <mesh position={[s.w * -0.3, 0.15, s.d * 0.3]}>
                <dodecahedronGeometry args={[0.3]} />
                <meshStandardMaterial color="#52525b" roughness={0.95} />
              </mesh>
            </group>
          );
        }
        if (s.type === 'nature') {
          return (
            <group key={`sc-${i}`} position={s.pos}>
              <mesh position={[0, s.scale * 0.3, 0]}>
                <cylinderGeometry args={[0.12, 0.2, s.scale * 0.6, 5]} />
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
              </mesh>
              <mesh position={[0, s.scale * 0.65, 0]}>
                <sphereGeometry args={[s.scale * 0.22, 5, 5]} />
                <meshStandardMaterial color="#1b5e20" roughness={0.9} />
              </mesh>
              <mesh position={[s.scale * 0.15, s.scale * 0.55, s.scale * 0.1]}>
                <sphereGeometry args={[s.scale * 0.15, 4, 4]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.9} />
              </mesh>
            </group>
          );
        }
        if (s.type === 'prop') {
          // Near-wall props — crates, barrels, debris
          const variant = i % 3;
          if (variant === 0) {
            return (
              <group key={`sc-${i}`} position={s.pos}>
                <mesh position={[0, 0.3 * s.scale, 0]}>
                  <boxGeometry args={[0.6 * s.scale, 0.6 * s.scale, 0.6 * s.scale]} />
                  <meshStandardMaterial color="#4a3728" roughness={0.9} />
                </mesh>
                <mesh position={[0.4 * s.scale, 0.25 * s.scale, 0.1]}>
                  <boxGeometry args={[0.4 * s.scale, 0.5 * s.scale, 0.5 * s.scale]} />
                  <meshStandardMaterial color="#5c4033" roughness={0.9} />
                </mesh>
              </group>
            );
          }
          if (variant === 1) {
            return (
              <mesh key={`sc-${i}`} position={[s.pos[0], 0.35 * s.scale, s.pos[2]]}>
                <cylinderGeometry args={[0.25 * s.scale, 0.25 * s.scale, 0.7 * s.scale, 8]} />
                <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
              </mesh>
            );
          }
          return (
            <mesh key={`sc-${i}`} position={[s.pos[0], 0.15 * s.scale, s.pos[2]]}>
              <dodecahedronGeometry args={[0.35 * s.scale]} />
              <meshStandardMaterial color="#57534e" roughness={0.95} />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

// Floor ground markings — center marker, lane/hazard lines
function FloorMarkings({ arenaSize, glowColor, accentColor }: { arenaSize: number; glowColor: string; accentColor: string }) {
  const half = arenaSize / 2;
  return (
    <group>
      {/* Center circle marker */}
      <mesh position={[half, 0.008, half]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.7, 32]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={1} transparent opacity={0.25} />
      </mesh>
      <mesh position={[half, 0.008, half]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={2} transparent opacity={0.3} />
      </mesh>
      {/* Cross lines through center */}
      <mesh position={[half, 0.007, half]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[arenaSize * 0.8, 0.05]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} transparent opacity={0.15} />
      </mesh>
      <mesh position={[half, 0.007, half]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[arenaSize * 0.8, 0.05]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} transparent opacity={0.15} />
      </mesh>
      {/* Corner warning triangles */}
      {[
        [3, 3], [arenaSize - 3, 3], [3, arenaSize - 3], [arenaSize - 3, arenaSize - 3]
      ].map(([x, z], i) => (
        <mesh key={`warn-${i}`} position={[x, 0.008, z]} rotation={[-Math.PI / 2, 0, (Math.PI / 2) * i]}>
          <ringGeometry args={[1.2, 1.4, 3]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={0.8} transparent opacity={0.2} />
        </mesh>
      ))}
      {/* Hazard stripes near edges — subtle dashes */}
      {[0, 1, 2, 3].map(side => {
        const dashes = [];
        const count = Math.floor(arenaSize / 4);
        for (let j = 0; j < count; j++) {
          const t = 2 + j * ((arenaSize - 4) / count);
          let pos: [number, number, number], rot: number;
          if (side === 0) { pos = [t, 0.007, 1.2]; rot = 0; }
          else if (side === 1) { pos = [t, 0.007, arenaSize - 1.2]; rot = 0; }
          else if (side === 2) { pos = [1.2, 0.007, t]; rot = Math.PI / 2; }
          else { pos = [arenaSize - 1.2, 0.007, t]; rot = Math.PI / 2; }
          dashes.push(
            <mesh key={`dash-${side}-${j}`} position={pos} rotation={[-Math.PI / 2, 0, rot]}>
              <planeGeometry args={[1.5, 0.08]} />
              <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={0.6} transparent opacity={0.15} />
            </mesh>
          );
        }
        return dashes;
      })}
    </group>
  );
}

// Ambient floating dust motes
function AmbientDust({ arenaSize, color, wave }: { arenaSize: number; color: string; wave: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useMemo(() => {
    const arr: { x: number; y: number; z: number; speed: number; phase: number }[] = [];
    let seed = wave * 31337;
    const rand = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    const count = Math.min(30, 10 + wave);
    for (let i = 0; i < count; i++) {
      arr.push({
        x: rand() * arenaSize,
        y: 0.5 + rand() * 3,
        z: rand() * arenaSize,
        speed: 0.3 + rand() * 0.8,
        phase: rand() * Math.PI * 2,
      });
    }
    return arr;
  }, [arenaSize, wave]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      child.position.y = p.y + Math.sin(t * p.speed + p.phase) * 0.5;
      child.position.x = p.x + Math.sin(t * 0.2 + p.phase) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Animated spotlights that sweep around the arena
function SpotlightSweep({ arenaSize, color }: { arenaSize: number; color: string }) {
  const half = arenaSize / 2;
  const spot0 = useRef<THREE.SpotLight>(null);
  const spot1 = useRef<THREE.SpotLight>(null);
  const spot2 = useRef<THREE.SpotLight>(null);
  const target0 = useRef<THREE.Object3D>(null);
  const target1 = useRef<THREE.Object3D>(null);
  const target2 = useRef<THREE.Object3D>(null);

  const configs = useMemo(() => [
    { radius: arenaSize * 0.35, speed: 0.4, phase: 0, yOffset: 6 },
    { radius: arenaSize * 0.25, speed: -0.3, phase: Math.PI * 0.66, yOffset: 7 },
    { radius: arenaSize * 0.3, speed: 0.25, phase: Math.PI * 1.33, yOffset: 5.5 },
  ], [arenaSize]);

  // Link targets to spotlights on mount
  useEffect(() => {
    if (spot0.current && target0.current) spot0.current.target = target0.current;
    if (spot1.current && target1.current) spot1.current.target = target1.current;
    if (spot2.current && target2.current) spot2.current.target = target2.current;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const targets = [target0.current, target1.current, target2.current];
    for (let i = 0; i < 3; i++) {
      const tgt = targets[i];
      const c = configs[i];
      if (!tgt) continue;
      const angle = t * c.speed + c.phase;
      tgt.position.x = half + Math.cos(angle) * c.radius + Math.sin(t * 0.15 + i) * 3;
      tgt.position.z = half + Math.sin(angle) * c.radius + Math.cos(t * 0.12 + i * 2) * 3;
    }
  });

  return (
    <group>
      <object3D ref={target0} position={[half, 0, half]} />
      <object3D ref={target1} position={[half, 0, half]} />
      <object3D ref={target2} position={[half, 0, half]} />
      <spotLight
        ref={spot0}
        position={[half - 5, configs[0].yOffset, half - 5]}
        color={color}
        intensity={8}
        distance={arenaSize * 0.8}
        angle={0.5}
        penumbra={0.8}
        decay={1.5}
      />
      <spotLight
        ref={spot1}
        position={[half + 5, configs[1].yOffset, half - 3]}
        color={color}
        intensity={6}
        distance={arenaSize * 0.8}
        angle={0.45}
        penumbra={0.9}
        decay={1.5}
      />
      <spotLight
        ref={spot2}
        position={[half, configs[2].yOffset, half + 5]}
        color={color}
        intensity={7}
        distance={arenaSize * 0.7}
        angle={0.55}
        penumbra={0.85}
        decay={1.5}
      />
    </group>
  );
}

// Dynamic lighting based on wave events
function WaveEventLighting({ arenaSize }: { arenaSize: number }) {
  const waveEvent = useGameStore(s => s.survivalState?.waveEvent);
  const cx = arenaSize / 2;

  if (!waveEvent) return null;

  const eventLights: Record<string, { color: string; intensity: number }> = {
    golden_wave: { color: '#fbbf24', intensity: 3 },
    cursed_wave: { color: '#7c3aed', intensity: 4 },
    frenzy: { color: '#ef4444', intensity: 2 },
    blood_moon: { color: '#dc2626', intensity: 5 },
    treasure_rain: { color: '#22c55e', intensity: 2 },
  };

  const light = eventLights[waveEvent];
  if (!light) return null;

  return (
    <group>
      <pointLight color={light.color} intensity={light.intensity} distance={arenaSize * 0.8} position={[cx, 8, cx]} />
      {/* Ground accent glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.03, cx]}>
        <circleGeometry args={[arenaSize * 0.3, 32]} />
        <meshBasicMaterial color={light.color} transparent opacity={0.04} />
      </mesh>
    </group>
  );
}
