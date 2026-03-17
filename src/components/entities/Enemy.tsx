import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useRapier, BallCollider } from '@react-three/rapier';
import { Billboard } from '@react-three/drei';
import type { EnemyState } from '../../types';
import { useGameStore } from '../../game/store';
import * as THREE from 'three';
import { SFX } from '../../game/sounds';

export function Enemy({ state }: { state: EnemyState }) {
  const rb = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const enemyShoot = useGameStore(s => s.enemyShoot);
  const phase = useGameStore(s => s.phase);
  const countdown = useGameStore(s => s.countdown);
  const theme = useGameStore(s => s.theme);
  const { rapier, world } = useRapier();
  
  const lastShootTime = useRef(0);
  const lastStoreUpdate = useRef(0);
  const visualRotation = useRef(state.rotation);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.rotation;
    }
  }, []);

  useFrame(({ clock }) => {
    if (!rb.current || !meshRef.current || state.hp <= 0) return;

    if (phase !== 'playing' || (countdown !== null && countdown > 0.5)) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    
    const myPos = rb.current.translation();
    if (clock.getElapsedTime() - lastStoreUpdate.current > 0.1) {
      lastStoreUpdate.current = clock.getElapsedTime();
      useGameStore.setState(s => ({
        enemies: s.enemies.map(e => e.id === state.id ? { ...e, pos: { x: myPos.x, z: myPos.z } } : e)
      }));
    }

    const player = useGameStore.getState().player;
    if (player && player.hp > 0) {
      const dx = player.pos.x - myPos.x;
      const dz = player.pos.z - myPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const dir = { x: dx / dist, y: 0, z: dz / dist };
      const angle = Math.atan2(-dx, -dz);

      const rayOrigin = { x: myPos.x, y: 0.5, z: myPos.z };
      const hit = world.castRay(
        new rapier.Ray(rayOrigin, dir),
        dist,
        true,
        undefined,
        undefined,
        undefined,
        rb.current as any
      );
      
      let hasLOS = true;
      let hitBarrelTooClose = false;
      if (hit) {
        const hitCollider = world.getCollider((hit as any).colliderHandle);
        if (hitCollider) {
          const hitBody = hitCollider.parent();
          const hitData = hitBody?.userData as any;
          if (hitData?.type === 'wall' && (hit as any).toi < dist - 0.2) hasLOS = false;
          if (hitData?.type === 'barrel' && (hit as any).toi < dist - 0.2 && (hit as any).toi < 3.0) hitBarrelTooClose = true;
        }
      }

      if (hasLOS) {
        visualRotation.current = THREE.MathUtils.lerp(visualRotation.current, angle, 0.15);
        meshRef.current.rotation.y = visualRotation.current;
        if (dist < 15 && !hitBarrelTooClose && clock.getElapsedTime() - lastShootTime.current > 0.6) {
          lastShootTime.current = clock.getElapsedTime();
          const spawnPos = { x: myPos.x + dir.x * 0.8, z: myPos.z + dir.z * 0.8 };
          enemyShoot(spawnPos, dir, state.weapon.damage);
          SFX.enemyShoot();
        }
        if (dist > 3) {
          const speed = 3.5;
          rb.current.setLinvel({ x: dir.x * speed, y: 0, z: dir.z * speed }, true);
        } else {
          rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
      } else {
        rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
  });

  if (state.hp <= 0) return null;

  const barWidth = 0.8 * Math.pow(state.maxHp / 40, 0.5);

  return (
    <RigidBody 
      ref={rb} 
      type="dynamic" 
      position={[state.pos.x, 0.5, state.pos.z]} 
      rotation={[0, 0, 0]}
      lockRotations
      enabledTranslations={[true, false, true]}
      friction={0}
      restitution={0}
      colliders={false}
      ccd={true}
      name={`enemy_${state.id}`}
      userData={{ type: 'enemy', id: state.id }}
    >
      <BallCollider args={[0.3]} />
      
      <Billboard position={[0, 1.2, 0]}>
        <mesh>
          <planeGeometry args={[barWidth, 0.12]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[-(barWidth * (1 - state.hp / state.maxHp)) / 2, 0, 0.01]}>
          <planeGeometry args={[barWidth * (state.hp / state.maxHp), 0.08]} />
          <meshBasicMaterial color={state.hp > (state.maxHp * 0.3) ? state.color : "#ff0000"} />
        </mesh>
      </Billboard>

      <group ref={meshRef}>
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
          <meshStandardMaterial color={state.color} roughness={0.5} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#fca5a5" roughness={0.4} />
        </mesh>

        {theme === 'beach' && (
          <group position={[0, 0.65, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 0.6, 32]} />
              <meshStandardMaterial color="#fbbf24" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
          </group>
        )}
        <group position={[0.2, 0.1, -0.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color={new THREE.Color(state.color).multiplyScalar(0.5).getHex()} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
}
