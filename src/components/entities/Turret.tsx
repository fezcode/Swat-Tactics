import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Billboard } from '@react-three/drei';
import { useGameStore } from '../../game/store';
import { SFX } from '../../game/sounds';
import * as THREE from 'three';

interface TurretProps {
  id: string;
}

export function Turret({ id }: TurretProps) {
  const turret = useGameStore(s => s.turrets.find(t => t.id === id));
  const player = useGameStore(s => s.player);
  const phase = useGameStore(s => s.phase);
  const enemyShoot = useGameStore(s => s.enemyShoot);
  const updateTurretFireTime = useGameStore(s => s.updateTurretFireTime);
  const countdown = useGameStore(s => s.countdown);
  const headRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!turret || turret.hp <= 0 || turret.disabled || !player || phase !== 'playing' || !headRef.current || (countdown !== null && countdown > 0.5)) return;

    // Look at player
    const dx = player.pos.x - turret.pos.x;
    const dz = player.pos.z - turret.pos.z;
    const angle = Math.atan2(dx, dz);
    headRef.current.rotation.y = angle;

    // Shoot
    const dist = Math.sqrt(dx * dx + dz * dz);
    const now = Date.now();
    if (dist < 15 && now - turret.lastFireTime > turret.fireRate) {
      updateTurretFireTime(id);
      
      const dirX = Math.sin(angle);
      const dirZ = Math.cos(angle);
      
      enemyShoot(
        { x: turret.pos.x + dirX * 0.5, z: turret.pos.z + dirZ * 0.5 },
        { x: dirX, z: dirZ },
        turret.damage
      );
      SFX.enemyShoot();
    }
  });

  if (!turret || turret.hp <= 0) return null;

  // Scale bar width based on maxHp (40 is standard)
  const barWidth = 0.8 * Math.pow(turret.maxHp / 40, 0.5);

  return (
    <RigidBody 
      type="fixed" 
      position={[turret.pos.x, 0, turret.pos.z]}
      userData={{ type: 'turret', id: turret.id }}
    >
      <CuboidCollider args={[0.4, 0.8, 0.4]} position={[0, 0.4, 0]} />
      
      {/* Turret Health Bar - Billboarded */}
      <Billboard position={[0, 1.5, 0]}>
        <mesh>
          <planeGeometry args={[barWidth, 0.12]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[-(barWidth * (1 - turret.hp / turret.maxHp)) / 2, 0, 0.01]}>
          <planeGeometry args={[barWidth * (turret.hp / turret.maxHp), 0.08]} />
          <meshBasicMaterial color={turret.disabled ? "#666" : (turret.hp > (turret.maxHp * 0.3) ? turret.color : "#ff0000")} />
        </mesh>
      </Billboard>

      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.5, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Head */}
      <group ref={headRef} position={[0, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color={turret.disabled ? "#666" : turret.color} />
        </mesh>
        {/* Barrel */}
        <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </RigidBody>
  );
}
