import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { Wall } from './Wall';

export function GridMap() {
  const walls = useGameStore(s => s.walls);
  const gridSize = useGameStore(s => s.gridSize);
  const exitPos = useGameStore(s => s.exitPos);
  const enemies = useGameStore(s => s.enemies);
  const allDead = enemies.length > 0 && enemies.every(e => e.hp <= 0);

  const maxDim = Math.max(gridSize.width, gridSize.height);

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[gridSize.width / 2 - 0.5, -0.05, gridSize.height / 2 - 0.5]} userData={{ type: 'floor' }}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[gridSize.width, gridSize.height]} />
          <meshStandardMaterial color="#0a0c10" roughness={1} metalness={0} />
        </mesh>
        
        {/* Floor Collider */}
        <CuboidCollider args={[gridSize.width / 2, 0.05, gridSize.height / 2]} />

        {/* Boundary Walls - Massive colliders moved very far away to prevent ejection clipping */}
        {/* North */}
        <CuboidCollider args={[gridSize.width * 2, 10, 5]} position={[0, 5, -gridSize.height]} />
        {/* South */}
        <CuboidCollider args={[gridSize.width * 2, 10, 5]} position={[0, 5, gridSize.height]} />
        {/* East */}
        <CuboidCollider args={[5, 10, gridSize.height * 2]} position={[gridSize.width, 5, 0]} />
        {/* West */}
        <CuboidCollider args={[5, 10, gridSize.height * 2]} position={[-gridSize.width, 5, 0]} />
      </RigidBody>

      {/* Grid Lines Overlay */}
      <gridHelper 
        args={[maxDim, maxDim, 0x000000, 0x000000]} 
        position={[maxDim / 2 - 0.5, 0.01, maxDim / 2 - 0.5]} 
        material-opacity={0.05} 
        material-transparent 
      />

      {walls.map((w, i) => <Wall key={i} pos={w} />)}

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
            intensity={allDead ? 10 : 2} 
            distance={5} 
          />
        </RigidBody>
      )}
    </group>
  );
}