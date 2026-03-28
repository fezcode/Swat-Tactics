import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { Position } from '../../types';
import { useGameStore } from '../../game/store';

// Seeded random from position for deterministic variation
function wallRand(x: number, z: number, seed = 0): number {
  const v = Math.sin(x * 127.1 + z * 311.7 + seed * 43758.5453) * 43758.5453;
  return v - Math.floor(v);
}

interface WallThemeConfig {
  color: string;
  color2: string;
  roughness: number;
  metalness: number;
}

const THEME_CONFIGS: Record<string, WallThemeConfig> = {
  industrial: { color: '#6d769a', color2: '#555e7a', roughness: 0.4, metalness: 0.3 },
  garden: { color: '#2e7d32', color2: '#1b5e20', roughness: 1.0, metalness: 0 },
  skyscraper: { color: '#4a5568', color2: '#2d3748', roughness: 0.2, metalness: 0.6 },
  desert: { color: '#d4a373', color2: '#c09060', roughness: 0.9, metalness: 0 },
  space_station: { color: '#334155', color2: '#1e293b', roughness: 0.15, metalness: 0.8 },
  beach: { color: '#92400e', color2: '#78350f', roughness: 0.8, metalness: 0 },
  cemetery: { color: '#52525b', color2: '#3f3f46', roughness: 0.7, metalness: 0.1 },
  airport: { color: '#94a3b8', color2: '#64748b', roughness: 0.2, metalness: 0.5 },
  metro: { color: '#334155', color2: '#1e293b', roughness: 0.3, metalness: 0.2 },
};

export function Wall({ pos }: { pos: Position }) {
  const theme = useGameStore(s => s.theme);

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.industrial;

  // Deterministic variation per wall tile
  const variant = useMemo(() => {
    const r = wallRand(pos.x, pos.z);
    const r2 = wallRand(pos.x, pos.z, 1);
    const r3 = wallRand(pos.x, pos.z, 2);
    return {
      useAltColor: r > 0.6,
      hasTrim: r2 > 0.3,
      trimSide: Math.floor(r3 * 4), // 0=top, 1=front, 2=right, 3=left
      hasPanel: r > 0.4 && r < 0.7,
      panelOffset: (r2 - 0.5) * 0.2,
    };
  }, [pos.x, pos.z]);

  const baseColor = variant.useAltColor ? config.color2 : config.color;

  return (
    <RigidBody
      type="fixed"
      position={[pos.x, 0.5, pos.z]}
      userData={{ type: 'wall' }}
      friction={0}
      restitution={0}
    >
      <CuboidCollider args={[0.5, 0.5, 0.5]} />

      {/* Main wall block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={config.roughness}
          metalness={config.metalness}
        />
      </mesh>


      {/* Theme-specific details */}
      {theme === 'industrial' && (
        <>
          {/* Rivet dots on front face */}
          <mesh position={[0.3, 0.3, 0.51]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.3, 0.3, 0.51]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.3, -0.3, 0.51]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.3, -0.3, 0.51]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Horizontal seam */}
          <mesh position={[0, 0, 0.505]}>
            <boxGeometry args={[0.9, 0.02, 0.01]} />
            <meshStandardMaterial color="#555e7a" metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}

      {theme === 'garden' && (
        <>
          {/* Hedge leaf bumps */}
          {variant.hasPanel && (
            <>
              <mesh position={[0.2, 0.3, 0.45]}>
                <sphereGeometry args={[0.15, 5, 5]} />
                <meshStandardMaterial color="#388e3c" roughness={1} />
              </mesh>
              <mesh position={[-0.15, -0.1, 0.48]}>
                <sphereGeometry args={[0.12, 5, 5]} />
                <meshStandardMaterial color="#43a047" roughness={1} />
              </mesh>
              <mesh position={[0.05, 0.35, 0.46]}>
                <sphereGeometry args={[0.1, 5, 5]} />
                <meshStandardMaterial color="#2e7d32" roughness={1} />
              </mesh>
            </>
          )}
        </>
      )}

      {theme === 'skyscraper' && (
        <>
          {/* Window panel */}
          {variant.hasPanel && (
            <mesh position={[0, variant.panelOffset, 0.505]}>
              <boxGeometry args={[0.6, 0.4, 0.01]} />
              <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} emissive="#63b3ed" emissiveIntensity={0.15} />
            </mesh>
          )}
          {/* Vertical seam */}
          <mesh position={[0, 0, 0.505]}>
            <boxGeometry args={[0.02, 1, 0.01]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.2} />
          </mesh>
        </>
      )}

      {theme === 'desert' && (
        <>
          {/* Sandstone cracks / texture lines */}
          {variant.hasPanel && (
            <>
              <mesh position={[0.1, 0.15, 0.505]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.4, 0.015, 0.01]} />
                <meshStandardMaterial color="#a08060" roughness={1} />
              </mesh>
              <mesh position={[-0.2, -0.2, 0.505]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.3, 0.015, 0.01]} />
                <meshStandardMaterial color="#a08060" roughness={1} />
              </mesh>
            </>
          )}
          {/* Bottom erosion edge */}
          <mesh position={[0, -0.45, 0.505]}>
            <boxGeometry args={[1, 0.08, 0.01]} />
            <meshStandardMaterial color="#b8956a" roughness={1} />
          </mesh>
        </>
      )}

      {theme === 'space_station' && (
        <>
          {/* Glowing strip */}
          <mesh position={[0, 0, 0.505]}>
            <boxGeometry args={[0.8, 0.06, 0.01]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.5} roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Panel lines */}
          <mesh position={[0.35, 0, 0.505]}>
            <boxGeometry args={[0.02, 0.9, 0.01]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.35, 0, 0.505]}>
            <boxGeometry args={[0.02, 0.9, 0.01]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}

      {theme === 'beach' && (
        <>
          {/* Wood plank lines */}
          <mesh position={[0, 0.2, 0.505]}>
            <boxGeometry args={[0.9, 0.02, 0.01]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.15, 0.505]}>
            <boxGeometry args={[0.9, 0.02, 0.01]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        </>
      )}

      {theme === 'cemetery' && (
        <>
          {/* Weathered stone texture */}
          {variant.hasPanel && (
            <mesh position={[variant.panelOffset, 0.1, 0.505]}>
              <boxGeometry args={[0.3, 0.3, 0.02]} />
              <meshStandardMaterial color="#3f3f46" roughness={0.9} metalness={0.05} />
            </mesh>
          )}
          {/* Mortar lines */}
          <mesh position={[0, 0, 0.505]}>
            <boxGeometry args={[0.02, 1, 0.01]} />
            <meshStandardMaterial color="#27272a" roughness={1} />
          </mesh>
          <mesh position={[0, 0, 0.505]}>
            <boxGeometry args={[1, 0.02, 0.01]} />
            <meshStandardMaterial color="#27272a" roughness={1} />
          </mesh>
        </>
      )}

      {theme === 'airport' && (
        <>
          {/* Brushed steel panel with yellow caution stripe */}
          <mesh position={[0, -0.4, 0.505]}>
            <boxGeometry args={[1, 0.08, 0.01]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.3} roughness={0.3} />
          </mesh>
          {/* Panel seam */}
          {variant.hasPanel && (
            <mesh position={[0, 0.1, 0.505]}>
              <boxGeometry args={[0.02, 0.7, 0.01]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.2} />
            </mesh>
          )}
        </>
      )}

      {theme === 'metro' && (
        <>
          {/* Tile pattern lines */}
          <mesh position={[0, 0.15, 0.505]}>
            <boxGeometry args={[0.9, 0.015, 0.01]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.505]}>
            <boxGeometry args={[0.9, 0.015, 0.01]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
          {/* Yellow safety stripe at bottom */}
          <mesh position={[0, -0.45, 0.505]}>
            <boxGeometry args={[1, 0.06, 0.01]} />
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.4} roughness={0.3} />
          </mesh>
        </>
      )}
    </RigidBody>
  );
}
