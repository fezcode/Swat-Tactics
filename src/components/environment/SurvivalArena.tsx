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
};

function Obelisk({ position, color, glowColor }: { position: [number, number, number]; color: string; glowColor: string }) {
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
      {/* Base pillar */}
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Pillar top cap */}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} metalness={1} roughness={0} />
      </mesh>
      {/* Floating crystal */}
      <mesh ref={ref} castShadow>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} metalness={1} roughness={0} />
      </mesh>
      {/* Orbiting ring */}
      <mesh ref={ringRef} position={[0, 2.0, 0]}>
        <torusGeometry args={[0.7, 0.03, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={8} transparent opacity={0.7} /> 
      </mesh>
    </RigidBody>
  );}

// Decoration: Dead Tree
function DeadTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.2 * scale, 1.5 * scale, 0.2 * scale]} position={[0, 0.8 * scale, 0]} />
      <group scale={[scale, scale, scale]}>
        <mesh castShadow position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.15, 1.6, 6]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.15, 1.3, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.03, 0.06, 0.6, 4]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.1, 1.5, 0.05]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.02, 0.05, 0.5, 4]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Decoration: Lamp Post
function LampPost({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.2, 2.4, 0.2]} position={[0, 1.2, 0]} />
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 2.4, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
    </RigidBody>
  );
}

// Decoration: Cargo Container
function CargoContainer({ position, rotation, color }: { position: [number, number, number]; rotation: number; color: string }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[1.2, 0.6, 0.5]} position={[0, 0.6, 0]} />
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[2.4, 1.2, 1.0]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Container ribs */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.51]} castShadow>
          <boxGeometry args={[0.05, 1.1, 0.02]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </RigidBody>
  );
}

// Decoration: Billboard / Sign
function Billboard({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.8, 1.5, 0.1]} position={[0, 1.0, 0]} />
      {/* Poles */}
      <mesh castShadow position={[-0.6, 1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.6, 1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Glowing border */}
      <mesh position={[0, 2.1, 0.05]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.4} /> 
      </mesh>
    </RigidBody>
  );
}
// Decoration: Train Wreckage
function TrainWreckage({ position, rotation }: { position: [number, number, number]; rotation: number }) {      
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[2, 0.5, 0.6]} position={[0, 0.5, 0]} />
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1.0, 1.2]} />
        <meshStandardMaterial color="#44403c" roughness={0.8} metalness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[3.8, 0.15, 1.3]} />
        <meshStandardMaterial color="#57534e" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Wheels */}
      {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 12]} />
          <meshStandardMaterial color="#1c1917" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* Broken window */}
      <mesh position={[0.8, 0.7, 0.61]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} transparent opacity={0.3} />
      </mesh>
    </RigidBody>
  );
}
// Decoration: Track rail
function TrackRail({ position, length, rotation }: { position: [number, number, number]; length: number; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Rails */}
      <mesh position={[0, 0.02, -0.3]}>
        <boxGeometry args={[length, 0.04, 0.06]} />
        <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.3]}>
        <boxGeometry args={[length, 0.04, 0.06]} />
        <meshStandardMaterial color="#78716c" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Ties */}
      {Array.from({ length: Math.floor(length / 0.8) }, (_, i) => (
        <mesh key={i} position={[-length / 2 + 0.4 + i * 0.8, 0.01, 0]}>
          <boxGeometry args={[0.15, 0.02, 0.8]} />
          <meshStandardMaterial color="#44403c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Decoration: Concrete Barrier
function Barrier({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders={false} userData={{ type: 'wall' }}>
      <CuboidCollider args={[0.8, 0.3, 0.25]} position={[0, 0.3, 0]} />
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.5]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Yellow warning stripe */}
      <mesh position={[0, 0.3, 0.26]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}

// Decoration: Rubble / Rocks
function Rubble({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.1 * scale, 0]} scale={[scale, scale * 0.6, scale]}>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.2 * scale, 0.06 * scale, 0.15 * scale]} scale={[scale * 0.6, scale * 0.4, scale * 0.6]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#44403c" roughness={0.95} />
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

// Isolated list components — prevent SurvivalArena re-render when items change
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

  // Generate decorations procedurally based on wave
  const decorations = useMemo(() => {
    const decos: DecoItem[] = [];
    let seed = wave * 7777.777;
    const rand = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    const margin = 2.5;
    const sz = arenaSize;

    // Corner region trees (8-12 trees scattered in quadrants)
    for (let i = 0; i < 10; i++) {
      const quadrant = i % 4;
      const qx = quadrant < 2 ? margin + rand() * (sz * 0.25) : sz * 0.75 + rand() * (sz * 0.25 - margin);
      const qz = quadrant % 2 === 0 ? margin + rand() * (sz * 0.25) : sz * 0.75 + rand() * (sz * 0.25 - margin);
      decos.push({ type: 'tree', pos: [qx, 0, qz], rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.6, color: '' });
    }

    // Lamp posts around mid-edges
    const lampSpacing = Math.max(6, sz / 5);
    for (let i = 0; i < 4; i++) {
      const side = i;
      for (let j = 1; j < Math.floor(sz / lampSpacing); j++) {
        const t = j * lampSpacing;
        let px = 0, pz = 0;
        if (side === 0) { px = t; pz = margin; }
        else if (side === 1) { px = t; pz = sz - margin; }
        else if (side === 2) { px = margin; pz = t; }
        else { px = sz - margin; pz = t; }
        decos.push({ type: 'lamp', pos: [px, 0, pz], rot: 0, scale: 1, color: colors.glow });
      }
    }

    // Cargo containers (2-4)
    for (let i = 0; i < 3; i++) {
      const cx = margin + 3 + rand() * (sz - margin * 2 - 6);
      const cz = margin + 3 + rand() * (sz - margin * 2 - 6);
      // Avoid center area where player spawns
      const distCenter = Math.sqrt((cx - sz / 2) ** 2 + (cz - sz / 2) ** 2);
      if (distCenter > 5) {
        const containerColors = ['#991b1b', '#1e3a5f', '#374151', '#065f46', '#78350f'];
        decos.push({ type: 'container', pos: [cx, 0, cz], rot: rand() * Math.PI, scale: 1, color: containerColors[Math.floor(rand() * containerColors.length)] });
      }
    }

    // Billboards (2)
    decos.push({ type: 'billboard', pos: [sz * 0.25, 0, margin + 1], rot: 0, scale: 1, color: colors.glow });
    decos.push({ type: 'billboard', pos: [sz * 0.75, 0, sz - margin - 1], rot: Math.PI, scale: 1, color: colors.accent });

    // Train wreckage (1, if wave > 3)
    if (wave > 3) {
      decos.push({ type: 'train', pos: [sz * 0.3 + rand() * sz * 0.4, 0, sz * 0.15 + rand() * 3], rot: rand() * 0.3 - 0.15, scale: 1, color: '' });
    }

    // Track rails across the field
    decos.push({ type: 'track', pos: [sz / 2, 0, sz * 0.2], rot: 0, scale: sz * 0.6, color: '' });
    if (wave > 7) {
      decos.push({ type: 'track', pos: [sz / 2, 0, sz * 0.8], rot: 0, scale: sz * 0.5, color: '' });
    }

    // Barriers scattered (4-6)
    for (let i = 0; i < 5; i++) {
      const bx = margin + 2 + rand() * (sz - margin * 2 - 4);
      const bz = margin + 2 + rand() * (sz - margin * 2 - 4);
      const distCenter = Math.sqrt((bx - sz / 2) ** 2 + (bz - sz / 2) ** 2);
      if (distCenter > 4) {
        decos.push({ type: 'barrier', pos: [bx, 0, bz], rot: rand() * Math.PI, scale: 1, color: '' });
      }
    }

    // Rubble clusters
    for (let i = 0; i < 12; i++) {
      decos.push({ type: 'rubble', pos: [margin + rand() * (sz - margin * 2), 0, margin + rand() * (sz - margin * 2)], rot: 0, scale: 0.6 + rand() * 1.0, color: '' });
    }

    return decos;
  }, [wave, arenaSize, colors.glow, colors.accent]);

  // Checkerboard floor tiles - use two InstancedMeshes (one per color) instead of hundreds of individual meshes
  const floorTileSize = 2;
  const floorCount = Math.ceil(arenaSize / floorTileSize);
  const floorData = useMemo(() => {
    const tilesA: [number, number, number][] = [];
    const tilesB: [number, number, number][] = [];
    for (let x = 0; x < floorCount; x++) {
      for (let z = 0; z < floorCount; z++) {
        const pos: [number, number, number] = [x * floorTileSize + floorTileSize / 2, -0.01, z * floorTileSize + floorTileSize / 2];
        if ((x + z) % 2 === 0) tilesA.push(pos);
        else tilesB.push(pos);
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
      {/* Tiled floor - instanced for performance */}
      <instancedMesh ref={floorInstancedA} args={[floorGeo, floorMatA, floorData.tilesA.length]} receiveShadow />
      <instancedMesh ref={floorInstancedB} args={[floorGeo, floorMatB, floorData.tilesB.length]} receiveShadow />

      {/* Grid overlay - subtle */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[arenaSize / 2, 0.005, arenaSize / 2]}>
        <planeGeometry args={[arenaSize, arenaSize]} />
        <meshStandardMaterial color={colors.grid} transparent opacity={0.03} />
      </mesh>

      {/* Invisible boundary walls */}
      <RigidBody type="fixed" colliders={false} userData={{ type: 'wall' }}>
        <CuboidCollider args={[arenaSize / 2 + 5, 2, 0.5]} position={[arenaSize / 2, 1, -0.5]} />
        <CuboidCollider args={[arenaSize / 2 + 5, 2, 0.5]} position={[arenaSize / 2, 1, arenaSize + 0.5]} />
        <CuboidCollider args={[0.5, 2, arenaSize / 2 + 5]} position={[-0.5, 1, arenaSize / 2]} />
        <CuboidCollider args={[0.5, 2, arenaSize / 2 + 5]} position={[arenaSize + 0.5, 1, arenaSize / 2]} />
      </RigidBody>

      {/* Arena edge glow strips */}
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

      {/* Corner obelisks */}
      <Obelisk position={[2.5, 0, 2.5]} color={colors.obelisk} glowColor={colors.glow} />
      <Obelisk position={[arenaSize - 2.5, 0, 2.5]} color={colors.obelisk} glowColor={colors.glow} />
      <Obelisk position={[2.5, 0, arenaSize - 2.5]} color={colors.obelisk} glowColor={colors.glow} />
      <Obelisk position={[arenaSize - 2.5, 0, arenaSize - 2.5]} color={colors.obelisk} glowColor={colors.glow} />

      {/* Scene Decorations */}
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
          default: return null;
        }
      })}

      <HealthBoxList />
      <AmmoBoxList />
      <BarrelList />

      {/* Fog/atmosphere - dark outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[arenaSize / 2, -0.05, arenaSize / 2]}>
        <planeGeometry args={[arenaSize + 40, arenaSize + 40]} />
        <meshBasicMaterial color={colors.fog} />
      </mesh>
    </>
  );
}
