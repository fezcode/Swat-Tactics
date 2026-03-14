import { useGameStore } from '../../game/store';

export function ExplosionEffects() {
  const explosions = useGameStore(s => s.explosions);

  return (
    <group>
      {explosions.map(e => (
        <group key={e.id} position={[e.pos.x, 0.1, e.pos.z]}>
          {/* Main flash */}
          <mesh scale={1 - e.life}>
            <sphereGeometry args={[e.radius, 16, 16]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={e.life * 0.5} 
            />
          </mesh>
          {/* Ground ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[e.radius * (1 - e.life), e.radius, 32]} />
            <meshBasicMaterial 
              color="#ff4400" 
              transparent 
              opacity={e.life} 
            />
          </mesh>
          <pointLight color="#ffaa00" intensity={e.life * 20} distance={e.radius * 2} />
        </group>
      ))}
    </group>
  );
}
