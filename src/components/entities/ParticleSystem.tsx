import { useGameStore } from '../../game/store';

export function ParticleSystem() {
  const particles = useGameStore(s => s.particles);

  return (
    <>
      {particles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}
    </>
  );
}
