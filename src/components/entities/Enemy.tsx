import { useRef, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { Billboard } from '@react-three/drei';
import type { EnemyState, Position } from '../../types';
import { useGameStore } from '../../game/store';
import { positionCache } from '../../game/positionCache';
import * as THREE from 'three';
import { SFX } from '../../game/sounds';

type AIState = 'idle' | 'patrol' | 'chase' | 'attack';

export const Enemy = memo(function Enemy({ state }: { state: EnemyState }) {
  const rb = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const enemyShoot = useGameStore(s => s.enemyShoot);
  const phase = useGameStore(s => s.phase);
  const countdown = useGameStore(s => s.countdown);
  const theme = useGameStore(s => s.theme);

  const aiState = useRef<AIState>('idle');
  const lastShootTime = useRef(0);
  const visualRotation = useRef(state.rotation);

  const patrolTarget = useRef<Position | null>(null);
  const stateTimer = useRef(0);
  const strafeDir = useRef(1);
  const lastHitTimeLocal = useRef(state.lastHitTime || 0);
  
  const sprintStateRef = useRef({
    isSprinting: false,
    sprintTimer: 0,
    nextSprintIn: 0
  });

  useEffect(() => {
    strafeDir.current = Math.random() > 0.5 ? 1 : -1;
    sprintStateRef.current.nextSprintIn = Math.random() * 5 + 3;
    if (meshRef.current) meshRef.current.rotation.y = state.rotation;
    return () => { positionCache.delete(state.id); };
  }, []);

  useFrame(({ clock }, dt) => {
    if (!rb.current || !meshRef.current || state.hp <= 0) return;

    const gameMode = useGameStore.getState().gameMode;
    const validPhase = gameMode === 'survival' ? (phase === 'survival_playing') : (phase === 'playing');
    if (!validPhase || (countdown !== null && countdown > 0.5)) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const myPos = rb.current.translation();

    // Write position to non-reactive cache (zero cost, every frame)
    positionCache.set(state.id, { x: myPos.x, z: myPos.z });

    const player = useGameStore.getState().player;
    if (!player || player.hp <= 0) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const dx = player.pos.x - myPos.x;
    const dz = player.pos.z - myPos.z;
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);
    if (distToPlayer < 0.001) return; // avoid NaN
    const dirX = dx / distToPlayer;
    const dirZ = dz / distToPlayer;

    // Reactive: If hit, immediately chase
    if (state.lastHitTime && state.lastHitTime > lastHitTimeLocal.current) {
      lastHitTimeLocal.current = state.lastHitTime;
      if (aiState.current === 'idle' || aiState.current === 'patrol') {
        aiState.current = 'chase';
      }
    }

    // State transitions (simple, no raycasts)
    stateTimer.current -= dt;
    const detectRange = gameMode === 'survival' ? 25 : 15;

    if (distToPlayer < detectRange) {
      aiState.current = distToPlayer < 13 ? 'attack' : 'chase';
    } else if (aiState.current === 'attack' || aiState.current === 'chase') {
      if (distToPlayer > detectRange + 5) {
        aiState.current = 'patrol';
        stateTimer.current = 3;
      }
    } else if (aiState.current === 'idle') {
      aiState.current = 'patrol';
    }

    // Execution
    let moveX = 0, moveZ = 0;
    let targetAngle = visualRotation.current;
    const survivalSpeed = (state as any).survivalSpeed as number | undefined;
    
    // Dynamic sprint logic for survival mode
    let speedMult = 1.0;
    if (gameMode === 'survival') {
      const sprintState = sprintStateRef.current;
      if (sprintState.isSprinting) {
        sprintState.sprintTimer -= dt;
        speedMult = 1.8; // 80% faster when sprinting
        if (sprintState.sprintTimer <= 0) {
          sprintState.isSprinting = false;
          sprintState.nextSprintIn = Math.random() * 4 + 3; // wait 3-7 seconds before next sprint
        }
      } else {
        sprintState.nextSprintIn -= dt;
        if (sprintState.nextSprintIn <= 0) {
          sprintState.isSprinting = true;
          sprintState.sprintTimer = Math.random() * 1.5 + 1.0; // sprint for 1-2.5 seconds
        }
      }
    }
    
    let speed = (survivalSpeed || 3.0) * speedMult;

    switch (aiState.current) {
      case 'attack': {
        targetAngle = Math.atan2(-dx, -dz);
        speed = (survivalSpeed ? survivalSpeed * 0.7 : 2.5) * speedMult;

        if (stateTimer.current <= 0) {
          strafeDir.current *= -1;
          stateTimer.current = 1.5 + Math.random() * 2;
        }

        // Strafe perpendicular to player
        const sx = -dirZ * strafeDir.current;
        const sz = dirX * strafeDir.current;

        // Push/pull to maintain ideal range
        const idealDist = 7;
        const pull = (distToPlayer - idealDist) * 0.4;
        moveX = sx + dirX * pull;
        moveZ = sz + dirZ * pull;

        // Normalize
        const ml = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (ml > 0) { moveX /= ml; moveZ /= ml; }

        // Shoot
        const now = clock.getElapsedTime();
        const fireRate = gameMode === 'survival' ? 1.0 : 0.8;
        if (now - lastShootTime.current > fireRate) {
          lastShootTime.current = now;
          enemyShoot(
            { x: myPos.x + dirX * 0.8, z: myPos.z + dirZ * 0.8 },
            { x: dirX, z: dirZ },
            state.weapon.damage
          );
          SFX.enemyShoot();
        }
        break;
      }

      case 'chase':
        moveX = dirX;
        moveZ = dirZ;
        targetAngle = Math.atan2(-dx, -dz);
        speed = (survivalSpeed || 4.0) * speedMult;
        break;

      case 'patrol': {
        if (!patrolTarget.current || stateTimer.current <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3 + Math.random() * 5;
          const gs = useGameStore.getState().gridSize;
          patrolTarget.current = {
            x: Math.max(1, Math.min(gs.width - 1, myPos.x + Math.cos(angle) * dist)),
            z: Math.max(1, Math.min(gs.height - 1, myPos.z + Math.sin(angle) * dist)),
          };
          stateTimer.current = 4 + Math.random() * 4;
        }

        const pdx = patrolTarget.current.x - myPos.x;
        const pdz = patrolTarget.current.z - myPos.z;
        const pdist = Math.sqrt(pdx * pdx + pdz * pdz);

        if (pdist > 0.5) {
          moveX = pdx / pdist;
          moveZ = pdz / pdist;
          targetAngle = Math.atan2(-pdx, -pdz);
          speed = 1.5;
        } else {
          patrolTarget.current = null;
        }
        break;
      }
    }

    // Boundary clamp
    const gs = useGameStore.getState().gridSize;
    const m = 1.0;
    if (myPos.x < m && moveX < 0) moveX = 0;
    if (myPos.x > gs.width - m && moveX > 0) moveX = 0;
    if (myPos.z < m && moveZ < 0) moveZ = 0;
    if (myPos.z > gs.height - m && moveZ > 0) moveZ = 0;

    rb.current.setLinvel({ x: moveX * speed, y: 0, z: moveZ * speed }, true);
    visualRotation.current += (targetAngle - visualRotation.current) * 0.15;
    meshRef.current.rotation.y = visualRotation.current;
  });

  if (state.hp <= 0) return null;

  const barWidth = 0.8 * Math.pow(state.maxHp / 40, 0.5);
  const enemyScale = (state as any).scale as number || 1.0;
  const isGhost = (state as any).transparent as boolean || false;

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
      <BallCollider args={[0.3 * enemyScale]} />

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

      <group ref={meshRef} scale={[enemyScale, enemyScale, enemyScale]}>
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={state.color} transparent opacity={0.3} />
        </mesh>

        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
          <meshStandardMaterial color={state.color} roughness={0.5} transparent={isGhost} opacity={isGhost ? 0.4 : 1.0} emissive={isGhost ? state.color : '#000000'} emissiveIntensity={isGhost ? 2 : 0} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={isGhost ? state.color : '#fca5a5'} roughness={0.4} transparent={isGhost} opacity={isGhost ? 0.5 : 1.0} />
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
});
