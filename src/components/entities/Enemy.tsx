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
    const timeScale = useGameStore.getState().timeScale;
    const validPhase = gameMode === 'survival' ? (phase === 'survival_playing') : (phase === 'playing');
    if (!validPhase || (countdown !== null && countdown > 0.5)) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Frozen enemies can't move or shoot
    if (state.frozenUntil && Date.now() < state.frozenUntil) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      const myPos = rb.current.translation();
      positionCache.set(state.id, { x: myPos.x, z: myPos.z });
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
    const effectiveDt = dt * timeScale;
    stateTimer.current -= effectiveDt;
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
        sprintState.sprintTimer -= effectiveDt;
        speedMult = 1.8; // 80% faster when sprinting
        if (sprintState.sprintTimer <= 0) {
          sprintState.isSprinting = false;
          sprintState.nextSprintIn = Math.random() * 4 + 3; // wait 3-7 seconds before next sprint
        }
      } else {
        sprintState.nextSprintIn -= effectiveDt;
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

    rb.current.setLinvel({ x: moveX * speed * timeScale, y: 0, z: moveZ * speed * timeScale }, true);
    visualRotation.current += (targetAngle - visualRotation.current) * 0.15;
    meshRef.current.rotation.y = visualRotation.current;

    // Hit animation (shake and scale bump)
    const enemyScale = (state as any).scale as number || 1.0;
    if (state.lastHitTime && Date.now() - state.lastHitTime < 150) {
      const hitAlpha = (Date.now() - state.lastHitTime) / 150;
      meshRef.current.position.x = (Math.random() - 0.5) * 0.3 * (1 - hitAlpha);
      meshRef.current.position.y = (Math.random() - 0.5) * 0.3 * (1 - hitAlpha);
      meshRef.current.position.z = (Math.random() - 0.5) * 0.3 * (1 - hitAlpha);
      const hitScale = enemyScale * (1 + 0.4 * Math.sin(hitAlpha * Math.PI));
      meshRef.current.scale.set(hitScale, hitScale, hitScale);
    } else {
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.scale.set(enemyScale, enemyScale, enemyScale);
    }
  });

  if (state.hp <= 0) return null;

  const barWidth = 0.8 * Math.pow(state.maxHp / 40, 0.5);
  const enemyScale = (state as any).scale as number || 1.0;
  const isElite = state.isElite || false;
  const hasShield = (state.shieldHp || 0) > 0;
  const survivalType = (state as any).survivalType as string || 'grunt';
  const isFrozen = state.frozenUntil && Date.now() < state.frozenUntil;
  const isAllyShielded = state.allyShielded || false;
  const isBoss = state.isBoss || false;

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

      <Billboard position={[0, 1.2 * enemyScale, 0]}>
        <mesh>
          <planeGeometry args={[barWidth, 0.12]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[-(barWidth * (1 - state.hp / state.maxHp)) / 2, 0, 0.01]}>
          <planeGeometry args={[barWidth * (state.hp / state.maxHp), 0.08]} />
          <meshBasicMaterial color={state.hp > (state.maxHp * 0.3) ? state.color : "#ff0000"} />
        </mesh>
        {hasShield && state.shieldMaxHp && (
          <>
            <mesh position={[0, -0.12, 0]}>
              <planeGeometry args={[barWidth, 0.08]} />
              <meshBasicMaterial color="#111" />
            </mesh>
            <mesh position={[-(barWidth * (1 - (state.shieldHp || 0) / state.shieldMaxHp)) / 2, -0.12, 0.01]}>
              <planeGeometry args={[barWidth * ((state.shieldHp || 0) / state.shieldMaxHp), 0.06]} />
              <meshBasicMaterial color="#60a5fa" />
            </mesh>
          </>
        )}
        {/* Boss name tag */}
        {isBoss && state.bossName && (
          <mesh position={[0, 0.18, 0]}>
            <planeGeometry args={[barWidth * 1.5, 0.12]} />
            <meshBasicMaterial color={state.color} transparent opacity={0.6} />
          </mesh>
        )}
      </Billboard>

      <group ref={meshRef} scale={[enemyScale, enemyScale, enemyScale]}>
        {/* Ground shadow/ring */}
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={isElite ? '#fbbf24' : state.color} transparent opacity={isElite ? 0.6 : 0.3} />
        </mesh>
        {/* Elite glow ring */}
        {isElite && (
          <mesh position={[0, -0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
          </mesh>
        )}
        {/* Boss shield sphere */}
        {hasShield && (
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} wireframe />
          </mesh>
        )}
        {/* Ally shield bubble from Shielder */}
        {isAllyShielded && (
          <mesh>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshBasicMaterial color="#2dd4bf" transparent opacity={0.12} wireframe />
          </mesh>
        )}
        {/* Frozen ice crystal overlay */}
        {isFrozen && (
          <>
            <mesh>
              <icosahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial color="#67e8f9" transparent opacity={0.3} metalness={1} roughness={0} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <octahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial color="#a5f3fc" emissive="#67e8f9" emissiveIntensity={3} transparent opacity={0.6} />
            </mesh>
          </>
        )}

        {/* ====== TYPE-SPECIFIC BODY ====== */}

        {/* TANK: armored body with shoulder plates */}
        {survivalType === 'tank' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.35, 0.5, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Shoulder armor plates */}
            <mesh position={[-0.35, 0.2, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.15, 0.35, 0.3]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.35, 0.2, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.15, 0.35, 0.3]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Helmet */}
            <mesh castShadow position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Visor slit */}
            <mesh position={[0, 0.55, 0.25]}>
              <boxGeometry args={[0.25, 0.06, 0.05]} />
              <meshStandardMaterial color={state.color} emissive={state.color} emissiveIntensity={3} />
            </mesh>
          </>
        )}

        {/* GHOST: ethereal floating form with trailing wisps */}
        {survivalType === 'ghost' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
              <meshStandardMaterial color={state.color} transparent opacity={0.35} emissive={state.color} emissiveIntensity={2} />
            </mesh>
            {/* Ghost face */}
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color={state.color} transparent opacity={0.5} emissive={state.color} emissiveIntensity={3} />
            </mesh>
            {/* Wisp trails */}
            {[-0.2, 0.2].map((x, i) => (
              <mesh key={i} position={[x, -0.3, 0]}>
                <coneGeometry args={[0.12, 0.4, 4]} />
                <meshStandardMaterial color={state.color} transparent opacity={0.2} emissive={state.color} emissiveIntensity={2} />
              </mesh>
            ))}
            {/* Spectral eyes */}
            <mesh position={[-0.1, 0.5, 0.22]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={8} />
            </mesh>
            <mesh position={[0.1, 0.5, 0.22]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={8} />
            </mesh>
          </>
        )}

        {/* BOMBER: glowing core, danger stripes */}
        {survivalType === 'bomber' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.3, 0.35, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.5} />
            </mesh>
            {/* Danger stripes */}
            <mesh position={[0, 0, 0.31]}>
              <planeGeometry args={[0.4, 0.5]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.4} />
            </mesh>
            {/* Glowing core */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={6} />
            </mesh>
            {/* Head with fuse */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 4]} />
              <meshStandardMaterial color="#fbbf24" emissive="#ff6600" emissiveIntensity={4} />
            </mesh>
          </>
        )}

        {/* NECROMANCER: staff, robes, glowing eyes */}
        {survivalType === 'necromancer' && (
          <>
            {/* Robed body */}
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.35, 0.9, 6]} />
              <meshStandardMaterial color="#2d1b4e" roughness={0.8} />
            </mesh>
            {/* Head/hood */}
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color="#1a0f2e" roughness={0.9} />
            </mesh>
            {/* Glowing eyes */}
            <mesh position={[-0.08, 0.58, 0.18]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#c026d3" emissive="#c026d3" emissiveIntensity={10} />
            </mesh>
            <mesh position={[0.08, 0.58, 0.18]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#c026d3" emissive="#c026d3" emissiveIntensity={10} />
            </mesh>
            {/* Staff */}
            <mesh position={[0.35, 0.3, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.2, 4]} />
              <meshStandardMaterial color="#4a3728" roughness={0.8} />
            </mesh>
            {/* Staff orb */}
            <mesh position={[0.35, 0.95, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#c026d3" emissive="#c026d3" emissiveIntensity={8} metalness={1} roughness={0} />
            </mesh>
            {/* Dark aura ring */}
            <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.6, 0.8, 16]} />
              <meshBasicMaterial color="#c026d3" transparent opacity={0.2} />
            </mesh>
          </>
        )}

        {/* SHIELDER: bubble projector, tech armor */}
        {survivalType === 'shielder' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Shield generator backpack */}
            <mesh position={[0, 0.2, -0.3]}>
              <boxGeometry args={[0.25, 0.35, 0.2]} />
              <meshStandardMaterial color="#0f766e" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Generator glow */}
            <mesh position={[0, 0.3, -0.41]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={6} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#134e4a" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Shield projection ring */}
            <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.7, 16]} />
              <meshBasicMaterial color="#2dd4bf" transparent opacity={0.25} />
            </mesh>
          </>
        )}

        {/* SPLITTER: segmented body */}
        {survivalType === 'splitter' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.25, 0.3, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.5} />
            </mesh>
            {/* Segment lines */}
            <mesh position={[0, 0.1, 0]}>
              <torusGeometry args={[0.26, 0.02, 4, 12]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <torusGeometry args={[0.26, 0.02, 4, 12]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#6ee7b7" roughness={0.4} />
            </mesh>
          </>
        )}

        {/* RUSHER: sleek, streamlined */}
        {survivalType === 'rusher' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.25, 0.35, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.4} />
            </mesh>
            {/* Speed lines / fins */}
            <mesh position={[-0.25, 0.1, 0.15]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.05, 0.3, 0.15]} />
              <meshStandardMaterial color={state.color} emissive={state.color} emissiveIntensity={1} />
            </mesh>
            <mesh position={[0.25, 0.1, 0.15]} rotation={[0, -0.3, 0]}>
              <boxGeometry args={[0.05, 0.3, 0.15]} />
              <meshStandardMaterial color={state.color} emissive={state.color} emissiveIntensity={1} />
            </mesh>
            <mesh position={[0, 0.47, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color="#fca5a5" roughness={0.4} />
            </mesh>
          </>
        )}

        {/* SNIPER: scope, longer body */}
        {survivalType === 'sniper' && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.28, 0.45, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <sphereGeometry args={[0.23, 16, 16]} />
              <meshStandardMaterial color="#fca5a5" roughness={0.4} />
            </mesh>
            {/* Scope/visor */}
            <mesh position={[0, 0.55, 0.22]}>
              <cylinderGeometry args={[0.04, 0.03, 0.1, 6]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} />
            </mesh>
          </>
        )}

        {/* DEFAULT: grunt + any unmatched type */}
        {!['tank', 'ghost', 'bomber', 'necromancer', 'shielder', 'splitter', 'rusher', 'sniper'].includes(survivalType) && (
          <>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
              <meshStandardMaterial color={state.color} roughness={0.5} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#fca5a5" roughness={0.4} />
            </mesh>
          </>
        )}

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

        {/* Weapon (gun) — only for types that shoot */}
        {!['necromancer'].includes(survivalType) && (
          <group position={[0.2, 0.1, -0.4]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.1, 0.6]} />
              <meshStandardMaterial color={new THREE.Color(state.color).multiplyScalar(0.5).getHex()} />
            </mesh>
          </group>
        )}

        {/* Boss pulsing aura */}
        {isBoss && (
          <mesh position={[0, -0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 1.0, 32]} />
            <meshBasicMaterial color={state.color} transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
});
