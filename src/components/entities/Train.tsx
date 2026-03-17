import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { SFX } from '../../game/sounds';

export function Train() {
  const rb = useRef<RapierRigidBody>(null);
  const gridSize = useGameStore(s => s.gridSize);
  const setTrainActive = useGameStore(s => s.setTrainActive);
  const damageEntity = useGameStore(s => s.damageEntity);
  const addProjectile = useGameStore(s => s.addProjectile);
  const phase = useGameStore(s => s.phase);
  
  const [active, setActive] = useState(false);
  const trainX = useRef(-40);
  const lastShootTime = useRef(0);
  const speed = 18;

  const trackZ = Math.floor(gridSize.height / 2);
  const trackWidth = Math.ceil(gridSize.width) + 80;

  useEffect(() => {
    if (phase !== 'playing') return;
    
    const spawnTrain = () => {
        trainX.current = -40;
        setActive(true);
        setTrainActive(true);
    };

    const timeout = setTimeout(spawnTrain, 2000);
    const interval = setInterval(spawnTrain, 10000); 

    return () => {
        clearTimeout(timeout);
        clearInterval(interval);
        setTrainActive(false);
        setActive(false);
    };
  }, [phase, setTrainActive]);

  useFrame((state, delta) => {
    if (!active || phase !== 'playing') return;

    trainX.current += speed * delta;
    
    if (rb.current) {
        rb.current.setNextKinematicTranslation({ x: trainX.current, y: 1, z: trackZ });
    }

    if (trainX.current > gridSize.width + 40) {
      setActive(false);
      setTrainActive(false);
    }

    const now = state.clock.getElapsedTime();
    const player = useGameStore.getState().player;
    
    if (player && player.hp > 0 && now - lastShootTime.current > 0.5) {
        lastShootTime.current = now;
        const offsets = [2.5, -2.5];
        
        offsets.forEach(offsetX => {
            const spawnX = trainX.current + offsetX;
            const dx = player.pos.x - spawnX;
            const dz = player.pos.z - trackZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 20) {
                addProjectile({
                    pos: { x: spawnX, z: trackZ },
                    velocity: { x: (dx / dist) * 22, z: (dz / dist) * 22 },
                    damage: 12,
                    life: 2.0,
                    isEnemy: true
                });
                SFX.enemyShoot();
            }
        });
    }
  });

  return (
    <group>
      {/* Optimized Tracks - Just a few long meshes instead of hundreds */}
      <group position={[gridSize.width / 2 - 0.5, 0, trackZ]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[trackWidth, 1.4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0.05, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[trackWidth, 0.12]} />
          <meshStandardMaterial color="#444" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[trackWidth, 0.12]} />
          <meshStandardMaterial color="#444" metalness={0.9} />
        </mesh>
        {/* Simplified sleepers using a repeating texture or fewer boxes could go here, but for now let's keep it minimal for FPS */}
      </group>

      {active && (
        <RigidBody
          ref={rb}
          type="kinematicPosition"
          position={[trainX.current, 1, trackZ]}
          colliders={false}
          sensor
          name="train"
          userData={{ type: 'train' }}
          onIntersectionEnter={({ other }) => {
            const userData = other.rigidBodyObject?.userData as any;
            if (userData?.type === 'player') {
              damageEntity('player', 1000); 
            }
          }}
        >
          <CuboidCollider args={[4, 1, 0.7]} />
          <group>
            <mesh castShadow>
              <boxGeometry args={[8, 1.6, 1.3]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.3, 0.66]}>
              <planeGeometry args={[7, 0.5]} />
              <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 0.3, -0.66]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[7, 0.5]} />
              <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} transparent opacity={0.7} />
            </mesh>
            <mesh position={[4.05, -0.2, 0.4]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} />
            </mesh>
            <mesh position={[4.05, -0.2, -0.4]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} />
            </mesh>
            <pointLight position={[4.5, 0, 0]} color="#fbbf24" intensity={15} distance={12} />
            {[2.5, -2.5].map((x, i) => (
                <group key={i} position={[x, 1.2, 0]}>
                    <mesh castShadow>
                        <capsuleGeometry args={[0.3, 0.5, 4, 16]} />
                        <meshStandardMaterial color="#000000" emissive="#ff0000" emissiveIntensity={0.4} />
                    </mesh>
                    <mesh position={[0, 0.6, 0]}>
                        <sphereGeometry args={[0.28, 16, 16]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                    <mesh position={[0.4, 0.1, -0.3]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[0.15, 0.15, 0.7]} />
                        <meshStandardMaterial color="#111" metalness={0.8} />
                    </mesh>
                </group>
            ))}
          </group>
        </RigidBody>
      )}
    </group>
  );
}
