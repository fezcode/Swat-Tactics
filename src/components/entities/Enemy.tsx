import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useRapier, BallCollider } from '@react-three/rapier';
import { Billboard } from '@react-three/drei';
import type { EnemyState, Position } from '../../types';
import { useGameStore } from '../../game/store';
import * as THREE from 'three';
import { SFX } from '../../game/sounds';

type AIState = 'idle' | 'patrol' | 'chase' | 'search' | 'attack';

export function Enemy({ state }: { state: EnemyState }) {
  const rb = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const enemyShoot = useGameStore(s => s.enemyShoot);
  const phase = useGameStore(s => s.phase);
  const countdown = useGameStore(s => s.countdown);
  const theme = useGameStore(s => s.theme);
  const { rapier, world } = useRapier();
  
  const [aiState, setAIState] = useState<AIState>('idle');
  const lastShootTime = useRef(0);
  const lastStoreUpdate = useRef(0);
  const visualRotation = useRef(state.rotation);
  
  // Advanced AI variables
  const patrolTarget = useRef<Position | null>(null);
  const searchTarget = useRef<Position | null>(null);
  const stateTimer = useRef(0);
  const strafeDir = useRef(Math.random() > 0.5 ? 1 : -1);
  const lastHitTimeLocal = useRef(state.lastHitTime || 0);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.rotation;
    }
  }, []);

  useFrame(({ clock }, dt) => {
    if (!rb.current || !meshRef.current || state.hp <= 0) return;

    if (phase !== 'playing' || (countdown !== null && countdown > 0.5)) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    
    const myPos = rb.current.translation();
    const myPosition: Position = { x: myPos.x, z: myPos.z };

    // Update global store less frequently for performance
    if (clock.getElapsedTime() - lastStoreUpdate.current > 0.1) {
      lastStoreUpdate.current = clock.getElapsedTime();
      useGameStore.setState(s => ({
        enemies: s.enemies.map(e => e.id === state.id ? { ...e, pos: myPosition } : e)
      }));
    }

    const player = useGameStore.getState().player;
    if (!player || player.hp <= 0) {
        rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        return;
    }

    // 1. Perception
    const dx = player.pos.x - myPos.x;
    const dz = player.pos.z - myPos.z;
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);
    const dirToPlayer = { x: dx / distToPlayer, y: 0, z: dz / distToPlayer };
    
    // Line of sight check
    const rayOrigin = { x: myPos.x, y: 0.5, z: myPos.z };
    const hit = world.castRay(
      new rapier.Ray(rayOrigin, dirToPlayer),
      distToPlayer,
      true,
      undefined,
      undefined,
      undefined,
      rb.current as any
    );
    
    let hasLOS = true;
    if (hit) {
      const hitCollider = world.getCollider((hit as any).colliderHandle);
      if (hitCollider) {
        const hitBody = hitCollider.parent();
        const hitData = hitBody?.userData as any;
        if (hitData?.type === 'wall' && (hit as any).toi < distToPlayer - 0.2) hasLOS = false;
      }
    }

    // Reactive: If hit, immediately chase/search
    if (state.lastHitTime && state.lastHitTime > lastHitTimeLocal.current) {
        lastHitTimeLocal.current = state.lastHitTime;
        if (aiState === 'idle' || aiState === 'patrol') {
            setAIState('search');
            searchTarget.current = player.pos;
        }
    }

    // 2. State Machine Logic
    stateTimer.current -= dt;

    if (hasLOS) {
        // Player seen!
        if (distToPlayer < 12) {
            setAIState('attack');
        } else {
            setAIState('chase');
        }
        useGameStore.setState(s => ({
            enemies: s.enemies.map(e => e.id === state.id ? { ...e, lastSeenPlayerPos: player.pos } : e)
        }));
    } else {
        // Player lost
        if (aiState === 'attack' || aiState === 'chase') {
            setAIState('search');
            searchTarget.current = state.lastSeenPlayerPos || player.pos;
            stateTimer.current = 5; // Search for 5 seconds
        } else if (aiState === 'search' && stateTimer.current <= 0) {
            setAIState('patrol');
            stateTimer.current = 0;
        } else if (aiState === 'idle') {
            setAIState('patrol');
        }
    }

    // 3. Execution
    let moveDir = { x: 0, z: 0 };
    let targetAngle = visualRotation.current;
    let speed = 3.0;

    switch (aiState) {
        case 'attack':
            // Strafe and shoot
            targetAngle = Math.atan2(-dx, -dz);
            speed = 2.5;
            
            // Strafe behavior
            if (stateTimer.current <= 0) {
                strafeDir.current *= -1;
                stateTimer.current = 1 + Math.random() * 2;
            }
            
            const strafeX = -dirToPlayer.z * strafeDir.current;
            const strafeZ = dirToPlayer.x * strafeDir.current;
            
            // Maintain distance
            const idealDist = 7;
            const pushPull = (distToPlayer - idealDist) * 0.5;
            
            moveDir.x = strafeX + dirToPlayer.x * pushPull;
            moveDir.z = strafeZ + dirToPlayer.z * pushPull;

            // Shooting
            if (clock.getElapsedTime() - lastShootTime.current > 0.8) {
                lastShootTime.current = clock.getElapsedTime();
                const spawnPos = { x: myPos.x + dirToPlayer.x * 0.8, z: myPos.z + dirToPlayer.z * 0.8 };
                enemyShoot(spawnPos, dirToPlayer, state.weapon.damage);
                SFX.enemyShoot();
            }
            break;

        case 'chase':
            moveDir = dirToPlayer;
            targetAngle = Math.atan2(-dx, -dz);
            speed = 4.0;
            break;

        case 'search':
            if (searchTarget.current) {
                const sdx = searchTarget.current.x - myPos.x;
                const sdz = searchTarget.current.z - myPos.z;
                const sdist = Math.sqrt(sdx * sdx + sdz * sdz);
                if (sdist > 0.5) {
                    moveDir = { x: sdx / sdist, z: sdz / sdist };
                    targetAngle = Math.atan2(-sdx, -sdz);
                } else {
                    // Look around at search target
                    targetAngle += dt * 5;
                    if (stateTimer.current < 2) searchTarget.current = null;
                }
            }
            speed = 3.0;
            break;

        case 'patrol':
            if (!patrolTarget.current || stateTimer.current <= 0) {
                // Pick random nearby point not in wall
                const angle = Math.random() * Math.PI * 2;
                const dist = 3 + Math.random() * 5;
                const tx = Math.max(1, Math.min(useGameStore.getState().gridSize.width - 1, myPos.x + Math.cos(angle) * dist));
                const tz = Math.max(1, Math.min(useGameStore.getState().gridSize.height - 1, myPos.z + Math.sin(angle) * dist));
                patrolTarget.current = { x: tx, z: tz };
                stateTimer.current = 4 + Math.random() * 4;
            }
            
            const pdx = patrolTarget.current.x - myPos.x;
            const pdz = patrolTarget.current.z - myPos.z;
            const pdist = Math.sqrt(pdx * pdx + pdz * pdz);
            
            if (pdist > 0.5) {
                moveDir = { x: pdx / pdist, z: pdz / pdist };
                targetAngle = Math.atan2(-pdx, -pdz);
                speed = 1.5;
            } else {
                patrolTarget.current = null;
            }
            break;
    }

    // Avoid walls in moveDir
    if (moveDir.x !== 0 || moveDir.z !== 0) {
        const rayMove = new rapier.Ray({ x: myPos.x, y: 0.5, z: myPos.z }, { x: moveDir.x, y: 0, z: moveDir.z });
        const wallHit = world.castRay(rayMove, 1.0, true, undefined, undefined, undefined, rb.current as any);
        if (wallHit) {
            const hitCollider = world.getCollider((wallHit as any).colliderHandle);
            if (hitCollider?.parent()?.userData && (hitCollider.parent()!.userData as any).type === 'wall') {
                // Try to slide along wall
                const normal = (wallHit as any).normal;
                if (normal) {
                    const dot = moveDir.x * normal.x + moveDir.z * normal.z;
                    moveDir.x -= normal.x * dot;
                    moveDir.z -= normal.z * dot;
                }
            }
        }
    }

    // Apply movement and rotation
    rb.current.setLinvel({ x: moveDir.x * speed, y: 0, z: moveDir.z * speed }, true);
    visualRotation.current = THREE.MathUtils.lerp(visualRotation.current, targetAngle, 0.1);
    meshRef.current.rotation.y = visualRotation.current;
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
