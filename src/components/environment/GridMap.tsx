import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { Wall } from './Wall';
import { HealthBox } from '../entities/HealthBox';
import { AmmoBox } from '../entities/AmmoBox';
import { Portal } from '../entities/Portal';

export function GridMap() {
  const walls = useGameStore(s => s.walls);
  const gridSize = useGameStore(s => s.gridSize);
  const exitPos = useGameStore(s => s.exitPos);
  const enemies = useGameStore(s => s.enemies);
  const healthBoxes = useGameStore(s => s.healthBoxes);
  const ammoBoxes = useGameStore(s => s.ammoBoxes);
  const portal = useGameStore(s => s.portal);
  const theme = useGameStore(s => s.theme);
  const decorations = useGameStore(s => s.decorations);
  const allDead = enemies.length > 0 && enemies.every(e => e.hp <= 0);

  const maxDim = Math.max(gridSize.width, gridSize.height);

  const colors = {
    industrial: {
      floor: "#2d334a",
      grid: 0x4fd1c5
    },
    garden: {
      floor: "#5d4037", 
      grid: 0x8bc34a
    },
    skyscraper: {
      floor: "#1a202c",
      grid: 0x63b3ed
    },
    desert: {
      floor: "#c2b280", 
      grid: 0xe6ccb2
    },
    space_station: {
      floor: "#0f172a",
      grid: 0xec4899
    }
  }[theme];

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[gridSize.width / 2 - 0.5, -0.05, gridSize.height / 2 - 0.5]} userData={{ type: 'floor' }}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[gridSize.width, gridSize.height]} />
          <meshStandardMaterial color={colors.floor} roughness={theme === 'space_station' ? 0.4 : 0.8} metalness={theme === 'space_station' ? 0.5 : 0.1} />
        </mesh>
        
        {/* Floor Collider */}
        <CuboidCollider args={[gridSize.width / 2, 0.05, gridSize.height / 2]} />

        {/* Boundary Walls */}
        <CuboidCollider args={[gridSize.width * 2, 10, 5]} position={[0, 5, -gridSize.height]} />
        <CuboidCollider args={[gridSize.width * 2, 10, 5]} position={[0, 5, gridSize.height]} />
        <CuboidCollider args={[5, 10, gridSize.height * 2]} position={[gridSize.width, 5, 0]} />
        <CuboidCollider args={[5, 10, gridSize.height * 2]} position={[-gridSize.width, 5, 0]} />
      </RigidBody>

      {/* Decorations */}
      {decorations.map((d) => (
        <group key={d.id} position={[d.pos.x, 0, d.pos.z]} rotation={[0, d.rotation, 0]} scale={d.scale}>
          {d.type === 'tree' && (
            <>
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
                <meshStandardMaterial color="#5d4037" />
              </mesh>
              <mesh position={[0, 2.5, 0]} castShadow>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial color="#2e7d32" />
              </mesh>
            </>
          )}
          {d.type === 'rock' && (
            <mesh position={[0, 0.2, 0]} castShadow>
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial color="#757575" />
            </mesh>
          )}
          {d.type === 'building' && (
            <mesh position={[0, -(d.h || 0)/2 + 0.5, 0]}>
              <boxGeometry args={[d.w || 2, d.h || 10, d.d || 2]} />
              <meshStandardMaterial color={d.color || "#1a202c"} metalness={0.5} roughness={0.2} />
              <mesh position={[0, 0, (d.d || 2)/2 + 0.01]}>
                <planeGeometry args={[(d.w || 2) * 0.8, (d.h || 10) * 0.8]} />
                <meshBasicMaterial color="#4fd1c5" opacity={0.1} transparent />
              </mesh>
            </mesh>
          )}
          {d.type === 'cactus' && (
            <>
              <mesh position={[0, 0.8, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.6, 8]} />
                <meshStandardMaterial color="#4a7c44" />
              </mesh>
              <mesh position={[0.3, 1.0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                <meshStandardMaterial color="#4a7c44" />
              </mesh>
              <mesh position={[-0.3, 1.2, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                <meshStandardMaterial color="#4a7c44" />
              </mesh>
            </>
          )}
          {d.type === 'satellite' && (
            <>
              <mesh castShadow>
                <sphereGeometry args={[0.5, 12, 12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <boxGeometry args={[0.1, 1.2, 0.05]} />
                <meshStandardMaterial color="#3b82f6" emissive="#1e3a8a" />
              </mesh>
              <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <boxGeometry args={[0.1, 1.2, 0.05]} />
                <meshStandardMaterial color="#3b82f6" emissive="#1e3a8a" />
              </mesh>
            </>
          )}
          {d.type === 'pipe' && (
            <mesh castShadow rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          )}
          {d.type === 'panel' && (
            <mesh castShadow>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
              <pointLight position={[0, 0.2, 0]} color="#ec4899" intensity={2} distance={2} />
            </mesh>
          )}
        </group>
      ))}

      {/* Grid Lines Overlay */}
      <gridHelper 
        args={[maxDim, maxDim, colors.grid, colors.grid]} 
        position={[maxDim / 2 - 0.5, 0.01, maxDim / 2 - 0.5]} 
        material-opacity={0.2} 
        material-transparent 
      />

      {walls.map((w, i) => <Wall key={i} pos={w} />)}
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
               const { setPhase, enemies: currentEnemies } = useGameStore.getState();
               if (currentEnemies.every(e => e.hp <= 0)) {
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
