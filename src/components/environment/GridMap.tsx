import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { Wall } from './Wall';
import { HealthBox } from '../entities/HealthBox';
import { useMemo } from 'react';

function GardenDecor({ gridSize }: { gridSize: { width: number, height: number } }) {
  const trees = useMemo(() => {
    const arr = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      let x = 0, z = 0;
      const margin = 5;
      if (side === 0) { x = Math.random() * (gridSize.width + margin*2) - margin; z = -margin - Math.random() * 10; }
      else if (side === 1) { x = Math.random() * (gridSize.width + margin*2) - margin; z = gridSize.height + margin + Math.random() * 10; }
      else if (side === 2) { x = -margin - Math.random() * 10; z = Math.random() * (gridSize.height + margin*2) - margin; }
      else { x = gridSize.width + margin + Math.random() * 10; z = Math.random() * (gridSize.height + margin*2) - margin; }
      
      arr.push({ x, z, scale: 0.8 + Math.random() * 1.5, type: Math.random() > 0.3 ? 'tree' : 'rock' });
    }
    return arr;
  }, [gridSize]);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.scale}>
          {t.type === 'tree' ? (
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
          ) : (
            <mesh position={[0, 0.2, 0]} castShadow>
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial color="#757575" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export function GridMap() {
  const walls = useGameStore(s => s.walls);
  const gridSize = useGameStore(s => s.gridSize);
  const exitPos = useGameStore(s => s.exitPos);
  const enemies = useGameStore(s => s.enemies);
  const healthBoxes = useGameStore(s => s.healthBoxes);
  const theme = useGameStore(s => s.theme);
  const allDead = enemies.length > 0 && enemies.every(e => e.hp <= 0);

  const maxDim = Math.max(gridSize.width, gridSize.height);

  const colors = {
    industrial: {
      floor: "#2d334a",
      grid: 0x4fd1c5
    },
    garden: {
      floor: "#5d4037", // Dirt road color
      grid: 0x8bc34a
    }
  }[theme];

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[gridSize.width / 2 - 0.5, -0.05, gridSize.height / 2 - 0.5]} userData={{ type: 'floor' }}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[gridSize.width, gridSize.height]} />
          <meshStandardMaterial color={colors.floor} roughness={0.8} metalness={0.1} />
        </mesh>
        
        {/* Floor Collider */}
        <CuboidCollider args={[gridSize.width / 2, 0.05, gridSize.height / 2]} />

        {/* Boundary Walls */}
        <CuboidCollider args={[gridSize.width * 2, 10, 5]} position={[0, 5, -gridSize.height]} />
        <CuboidCollider args={[gridSize.width * 2, 10, 5]} position={[0, 5, gridSize.height]} />
        <CuboidCollider args={[5, 10, gridSize.height * 2]} position={[gridSize.width, 5, 0]} />
        <CuboidCollider args={[5, 10, gridSize.height * 2]} position={[-gridSize.width, 5, 0]} />
      </RigidBody>

      {/* Outside Decorations for Garden Theme */}
      {theme === 'garden' && <GardenDecor gridSize={gridSize} />}

      {/* Grid Lines Overlay */}
      <gridHelper 
        args={[maxDim, maxDim, colors.grid, colors.grid]} 
        position={[maxDim / 2 - 0.5, 0.01, maxDim / 2 - 0.5]} 
        material-opacity={0.2} 
        material-transparent 
      />

      {walls.map((w, i) => <Wall key={i} pos={w} />)}
      {healthBoxes.map((h) => <HealthBox key={h.id} state={h} />)}

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
