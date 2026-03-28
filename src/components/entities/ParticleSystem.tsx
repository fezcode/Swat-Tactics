import { useGameStore } from '../../game/store';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const bloodGeo = new THREE.CircleGeometry(0.3, 16);
const bloodMat = new THREE.MeshBasicMaterial({ color: "#7f1d1d", transparent: true, opacity: 0.6, depthWrite: false });

const particleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const trailGeo = new THREE.PlaneGeometry(0.3, 0.06);

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

// Emissive material cache for glowing particles
const emissiveCache = new Map<string, THREE.MeshStandardMaterial>();
function getEmissiveMaterial(color: string): THREE.MeshStandardMaterial {
  let mat = emissiveCache.get(color);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 4, transparent: true, depthWrite: false });
    emissiveCache.set(color, mat);
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
        mat.opacity = Math.min(1, p.life * 1.5);
        // Scale particles down as they die
        const s = 0.3 + p.life * 0.7;
        mesh.scale.set(s, s, s);
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

// Enhanced explosion effects with multi-stage shockwaves
const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
const ringGeo = new THREE.RingGeometry(0, 1, 32);
const shockwaveGeo = new THREE.RingGeometry(0.8, 1, 32);

export function ExplosionEffects() {
  const explosions = useGameStore(s => s.explosions);

  return (
    <group>
      {explosions.map(e => {
        const s = e.radius * (1 - e.life);
        const innerS = e.radius * (1 - e.life) * 0.6;
        return (
          <group key={e.id} position={[e.pos.x, 0.1, e.pos.z]}>
            {/* Inner fireball */}
            <mesh scale={[innerS, innerS, innerS]} geometry={sphereGeo}>
              <meshBasicMaterial color="#ffffff" transparent opacity={e.life * 0.8} />
            </mesh>
            {/* Outer fireball */}
            <mesh scale={[s, s, s]} geometry={sphereGeo}>
              <meshBasicMaterial color="#ffaa00" transparent opacity={e.life * 0.4} />
            </mesh>
            {/* Ground ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[e.radius, e.radius, 1]} geometry={ringGeo}>
              <meshBasicMaterial color="#ff4400" transparent opacity={e.life * 0.8} />
            </mesh>
            {/* Expanding shockwave ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} scale={[s * 1.3, s * 1.3, 1]} geometry={shockwaveGeo}>
              <meshBasicMaterial color="#ff8800" transparent opacity={e.life * 0.6} />
            </mesh>
            {/* Second delayed shockwave */}
            {e.life < 0.7 && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} scale={[s * 0.8, s * 0.8, 1]} geometry={shockwaveGeo}>
                <meshBasicMaterial color="#ffcc00" transparent opacity={(e.life - 0.3) * 1.5} />
              </mesh>
            )}
            {/* Dynamic point light */}
            <pointLight color="#ffaa00" intensity={e.life * 30} distance={e.radius * 3} />
            {/* Secondary warm glow */}
            <pointLight color="#ff4400" intensity={e.life * 15} distance={e.radius * 2} position={[0, 1, 0]} />
          </group>
        );
      })}
    </group>
  );
}

// Floating damage/combo text rendered in 3D
export function FloatingTexts() {
  const floatingTexts = useGameStore(s => s.survivalState?.floatingTexts || []);

  return (
    <group>
      {floatingTexts.map(t => {
        const yOffset = (1 - t.life) * 2;
        const scale = t.text.includes('COMBO') ? 0.015 : t.text.includes('!') ? 0.012 : 0.008;
        return null; // Floating texts are rendered in SurvivalHUD as HTML overlay
      })}
    </group>
  );
}

// Treasure chest 3D objects
export function TreasureChests() {
  const chests = useGameStore(s => s.survivalState?.treasureChests || []);
  const collectChest = useGameStore(s => s.collectChest);
  const player = useGameStore(s => s.player);

  useFrame(() => {
    if (!player || player.hp <= 0) return;
    const pPos = player.pos;
    for (const chest of chests) {
      const dx = pPos.x - chest.pos.x;
      const dz = pPos.z - chest.pos.z;
      if (Math.sqrt(dx * dx + dz * dz) < 1.2) {
        collectChest(chest.id);
        break;
      }
    }
  });

  return (
    <group>
      {chests.map(chest => (
        <TreasureChest key={chest.id} chest={chest} />
      ))}
    </group>
  );
}

function TreasureChest({ chest }: { chest: { id: string; pos: { x: number; z: number }; type: string } }) {
  const ref = useRef<THREE.Group>(null);
  const chestColor = chest.type === 'score' ? '#fbbf24' : chest.type === 'heal' ? '#22c55e' : '#a855f7';

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.3 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
      ref.current.rotation.y = clock.getElapsedTime() * 2;
    }
  });

  return (
    <group position={[chest.pos.x, 0, chest.pos.z]}>
      <group ref={ref}>
        {/* Chest body */}
        <mesh>
          <boxGeometry args={[0.4, 0.3, 0.3]} />
          <meshStandardMaterial color="#8B6914" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Chest lid */}
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.42, 0.08, 0.32]} />
          <meshStandardMaterial color="#A0781C" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Glow gem */}
        <mesh position={[0, 0.08, 0.16]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={chestColor} emissive={chestColor} emissiveIntensity={6} />
        </mesh>
        {/* Lock */}
        <mesh position={[0, 0.02, 0.16]}>
          <boxGeometry args={[0.08, 0.1, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color={chestColor} transparent opacity={0.15} />
      </mesh>
      <pointLight color={chestColor} intensity={3} distance={4} position={[0, 0.5, 0]} />
    </group>
  );
}
