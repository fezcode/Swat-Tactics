import { useRef, useEffect, useState, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import type { PlayerState } from '../../types';
import { useGameStore } from '../../game/store';
import { positionCache } from '../../game/positionCache';
import * as THREE from 'three';
import { SFX } from '../../game/sounds';

export const Player = memo(function Player({ state }: { state: PlayerState }) {
  const rb = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const primaryGunRef = useRef<THREE.Group>(null);
  const secondaryGunRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Group>(null);
  const { camera, pointer, raycaster } = useThree();
  const playerShoot = useGameStore(s => s.playerShoot);
  const switchWeapon = useGameStore(s => s.switchWeapon);
  const dodge = useGameStore(s => s.dodge);
  const slash = useGameStore(s => s.slash);
  const phase = useGameStore(s => s.phase);
  const countdown = useGameStore(s => s.countdown);

  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false, e: false });
  const lastStoreUpdate = useRef(0);
  const mouseDown = useRef(false);
  const lastFireTime = useRef(0);
  
  const [slashActive, setSlashActive] = useState(false);
  const [dodgeActive, setDodgeActive] = useState(false);
  const dodgeDir = useRef({ x: 0, z: 0 });
  const prevPos = useRef(state.pos);
  
  // Track weapon switch animation
  const switchAnimProgress = useRef(0);
  const isSwitching = useRef(false);
  const prevSlot = useRef(state.activeWeaponSlot);

  useEffect(() => {
    if (prevSlot.current !== state.activeWeaponSlot) {
      isSwitching.current = true;
      switchAnimProgress.current = 0;
      prevSlot.current = state.activeWeaponSlot;
    }
  }, [state.activeWeaponSlot]);

  // Handle dodge teleport
  const lastDodgeRef = useRef(state.lastDodgeTime);
  useEffect(() => {
    if (state.lastDodgeTime > lastDodgeRef.current) {
      // Calculate dodge direction from movement delta
      const dx = state.pos.x - prevPos.current.x;
      const dz = state.pos.z - prevPos.current.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len > 0.1) {
        // We want the trail to point BACKWARDS from where we moved
        dodgeDir.current = { x: -dx / len, z: -dz / len };
      }

      if (rb.current) {
        rb.current.setTranslation({ x: state.pos.x, y: 0.5, z: state.pos.z }, true);
      }
      setDodgeActive(true);
      const timer = setTimeout(() => setDodgeActive(false), 250);
      lastDodgeRef.current = state.lastDodgeTime;
    }
    prevPos.current = state.pos;
  }, [state.lastDodgeTime, state.pos]);

  // Handle slash animation
  const lastSlashRef = useRef(state.lastSlashTime);
  useEffect(() => {
    if (state.lastSlashTime > lastSlashRef.current) {
      setSlashActive(true);
      const timer = setTimeout(() => setSlashActive(false), 500);
      return () => clearTimeout(timer);
    }
    lastSlashRef.current = state.lastSlashTime;
  }, [state.lastSlashTime]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.w = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.a = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.s = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.d = true;
      if (e.key === 'q' || e.key === 'Q') switchWeapon();
      if (e.key === 'e' || e.key === 'E') {
        const { levelIndex, gameMode } = useGameStore.getState();
        if (gameMode === 'survival' || levelIndex >= 80) slash();
      }
      if (e.key === 'Shift') {
        const { player, levelIndex, gameMode } = useGameStore.getState();
        if (!player || (gameMode !== 'survival' && levelIndex < 70)) return;
        
        keys.current.shift = true;
        let dx = 0;
        let dz = 0;
        if (keys.current.w) dz -= 1;
        if (keys.current.s) dz += 1;
        if (keys.current.a) dx -= 1;
        if (keys.current.d) dx += 1;
        if (dx === 0 && dz === 0) dz = -1;
        const len = Math.sqrt(dx * dx + dz * dz);
        dodge({ x: dx / len, z: dz / len });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.w = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.a = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.s = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.d = false;
      if (e.key === 'Shift') keys.current.shift = false;
    };
    
    const onPointerDown = (e: MouseEvent) => { if (e.button === 0) mouseDown.current = true; };
    const onPointerUp = (e: MouseEvent) => { if (e.button === 0) mouseDown.current = false; };
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onBlur = () => {
      keys.current = { w: false, a: false, s: false, d: false, shift: false, e: false };
      mouseDown.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('blur', onBlur);
    };
  }, [phase, playerShoot, countdown, switchWeapon, dodge, slash]);

  useFrame(({ clock }, delta) => {
    if (!rb.current || state.hp <= 0) return;

    const { gameMode: gm, survivalState: sv, timeScale } = useGameStore.getState();
    const validPhase = gm === 'survival' ? (phase === 'survival_playing') : (phase === 'playing');
    if (!validPhase || (countdown !== null && countdown > 0.5)) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const pos = rb.current.translation();
    // Always update position cache (non-reactive, instant)
    positionCache.set('player', { x: pos.x, z: pos.z });
    // Update store less frequently (triggers re-renders)
    if (clock.getElapsedTime() - lastStoreUpdate.current > 0.15) {
      lastStoreUpdate.current = clock.getElapsedTime();
      useGameStore.setState(s => ({ player: s.player ? { ...s.player, pos: { x: pos.x, z: pos.z } } : null }));
    }

    if (mouseDown.current && meshRef.current && !slashActive) {
      const { player } = useGameStore.getState();
      if (player && player.hp > 0) {
        const activeWeapon = player.activeWeaponSlot === 'secondary' && player.secondaryWeapon ? player.secondaryWeapon : player.weapon;
        let fireInterval = player.activeWeaponSlot === 'secondary' && player.secondaryWeapon ? 0.1 : 0.25;
        // Apply survival perk modifiers
        if (gm === 'survival' && sv) {
          const rapidStacks = sv.perkStacks['rapid_fire'] || 0;
          fireInterval *= Math.max(0.4, 1 - rapidStacks * 0.2);
          // Adrenaline: below 30% HP boost
          if (sv.activePerks.includes('adrenaline') && player.hp < player.maxHp * 0.3) {
            fireInterval *= 0.5;
          }
          // Berserker mutation: enemies fire faster (handled in Enemy), but also makes player fire slightly faster
        }
        const now = clock.getElapsedTime();
        
        if (now - lastFireTime.current >= fireInterval) {
          lastFireTime.current = now;
          if (activeWeapon.ammo <= 0) { SFX.gunEmpty(); } else {
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(meshRef.current.quaternion).normalize();
            const spawnPos = { x: pos.x + direction.x * 0.6, z: pos.z + direction.z * 0.6 };
            playerShoot(spawnPos, { x: direction.x, z: direction.z });
            SFX.playerShoot();
          }
        }
      }
    }

    let speed = gm === 'survival' ? 12 : 10;
    // Apply survival perk modifiers to speed
    if (gm === 'survival' && sv) {
      const swiftStacks = sv.perkStacks['swift_feet'] || 0;
      speed *= (1 + swiftStacks * 0.15);
      if (sv.activePerks.includes('adrenaline') && state.hp < state.maxHp * 0.3) {
        speed *= 1.3;
      }
    }
    let vx = 0;
    let vz = 0;
    if (keys.current.w) vz -= speed;
    if (keys.current.s) vz += speed;
    if (keys.current.a) vx -= speed;
    if (keys.current.d) vx += speed;
    if (vx !== 0 && vz !== 0) {
      const length = Math.sqrt(vx * vx + vz * vz);
      vx = (vx / length) * speed;
      vz = (vz / length) * speed;
    }
    rb.current.setLinvel({ x: vx * timeScale, y: 0, z: vz * timeScale }, true);

    if (gm !== 'survival') {
      const { exitPos, enemies, setPhase } = useGameStore.getState();
      if (exitPos && enemies.length > 0 && enemies.filter(e => !e.unkillable).every(e => e.hp <= 0)) {
         const dist = Math.sqrt(Math.pow(pos.x - exitPos.x, 2) + Math.pow(pos.z - exitPos.z, 2));
         if (dist < 1.2) setPhase('level_complete');
      }
    }

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
    const target = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, target);
    if (target && meshRef.current) {
      const pPos = rb.current.translation();
      const angle = Math.atan2(pPos.x - target.x, pPos.z - target.z);
      meshRef.current.rotation.y = angle;
    }

    if (isSwitching.current) {
      switchAnimProgress.current += delta * 6;
      if (switchAnimProgress.current >= 1) { switchAnimProgress.current = 1; isSwitching.current = false; }
    }
    const animT = isSwitching.current ? switchAnimProgress.current : 1;
    const ease = 1 - Math.pow(1 - animT, 3);
    const isPrimary = state.activeWeaponSlot === 'primary';
    if (primaryGunRef.current) {
      const targetY = isPrimary ? 0.1 : -0.1;
      const startY = isPrimary ? -0.1 : 0.1;
      primaryGunRef.current.position.y = startY + (targetY - startY) * ease;
    }
    if (secondaryGunRef.current) {
      const targetY = !isPrimary ? 0.1 : -0.1;
      const startY = !isPrimary ? -0.1 : 0.1;
      secondaryGunRef.current.position.y = startY + (targetY - startY) * ease;
    }

    // Slash Animation Rotation
    if (slashActive && swordRef.current) {
        swordRef.current.rotation.y += delta * 20;
    }
  });

  if (state.hp <= 0) return null;
  const isPrimary = state.activeWeaponSlot === 'primary';
  const svPerks = useGameStore.getState().survivalState?.activePerks || [];
  const hasDeathAura = svPerks.includes('death_aura');
  const hasAdrenaline = svPerks.includes('adrenaline') && state.hp < state.maxHp * 0.3;

  return (
    <RigidBody ref={rb} type="dynamic" position={[state.pos.x, 0.5, state.pos.z]} lockRotations enabledTranslations={[true, false, true]} friction={0} restitution={0} colliders={false} name="player" userData={{ type: 'player', id: state.id }}>
      <BallCollider args={[0.3]} />

      {/* Visual representation that ROTATES to face mouse */}
      <group ref={meshRef}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
          <meshStandardMaterial color={hasAdrenaline ? '#ef4444' : '#3b82f6'} roughness={0.4} metalness={0.6} emissive={hasAdrenaline ? '#ef4444' : '#000000'} emissiveIntensity={hasAdrenaline ? 2 : 0} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={hasAdrenaline ? '#fca5a5' : '#60a5fa'} roughness={0.3} />
        </mesh>

        {/* Death Aura visual ring */}
        {hasDeathAura && (
          <>
            <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.5, 3.0, 64]} />
              <meshBasicMaterial color="#dc2626" transparent opacity={0.15} />
            </mesh>
            <pointLight color="#dc2626" intensity={8} distance={4} />
          </>
        )}

        {/* Slash Sword Animation */}
        {slashActive && (
          <group ref={swordRef}>
             <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <torusGeometry args={[2.5, 0.1, 16, 100, Math.PI * 2]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.6} emissive="#ffffff" emissiveIntensity={10} />
             </mesh>
             <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.02, 4, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={20} />
             </mesh>
          </group>
        )}

        <group ref={primaryGunRef} position={[0.2, 0.1, -0.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color={isPrimary ? '#1e3a8a' : '#0f1d45'} emissive={isPrimary ? '#1e3a8a' : '#000000'} emissiveIntensity={isPrimary ? 0.3 : 0} />
          </mesh>
        </group>
        {state.secondaryWeapon && (
          <group ref={secondaryGunRef} position={[-0.2, 0.1, -0.4]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.1, 0.55]} />
              <meshStandardMaterial color={!isPrimary ? '#1e5a1e' : '#0f2d0f'} emissive={!isPrimary ? '#1e5a1e' : '#000000'} emissiveIntensity={!isPrimary ? 0.3 : 0} />
            </mesh>
          </group>
        )}
      </group>

      {/* Non-rotating group for effects */}
      <group>
        {/* Rainbow Dodge Trail - Positioned in opposite direction of dodge */}
        {dodgeActive && [0, 1, 2, 3, 4, 5, 6].map(i => {
          const dist = (i + 1) * 0.45;
          return (
            <mesh key={i} position={[dodgeDir.current.x * dist, 0, dodgeDir.current.z * dist]} scale={[1 - i * 0.1, 1 - i * 0.1, 1 - i * 0.1]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color={['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'][i]} transparent opacity={0.8 - i * 0.1} />
            </mesh>
          );
        })}
      </group>
    </RigidBody>
  );});
