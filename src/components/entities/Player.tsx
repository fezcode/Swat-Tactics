import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import type { PlayerState } from '../../types';
import { useGameStore } from '../../game/store';
import * as THREE from 'three';
import { SFX } from '../../game/sounds';

export function Player({ state }: { state: PlayerState }) {
  const rb = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const primaryGunRef = useRef<THREE.Group>(null);
  const secondaryGunRef = useRef<THREE.Group>(null);
  const { camera, pointer, raycaster } = useThree();
  const playerShoot = useGameStore(s => s.playerShoot);
  const switchWeapon = useGameStore(s => s.switchWeapon);
  const dodge = useGameStore(s => s.dodge);
  const phase = useGameStore(s => s.phase);
  const countdown = useGameStore(s => s.countdown);

  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const lastStoreUpdate = useRef(0);
  const mouseDown = useRef(false);
  const lastFireTime = useRef(0);
  
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
    if (state.lastDodgeTime > lastDodgeRef.current && rb.current) {
      rb.current.setTranslation({ x: state.pos.x, y: 0.5, z: state.pos.z }, true);
    }
    lastDodgeRef.current = state.lastDodgeTime;
  }, [state.lastDodgeTime, state.pos.x, state.pos.z]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.w = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.a = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.s = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.d = true;
      if (e.key === 'q' || e.key === 'Q') switchWeapon();
      if (e.key === 'Shift') {
        const { player, levelIndex } = useGameStore.getState();
        if (!player || levelIndex < 70) return; // Only level 71+
        
        keys.current.shift = true;
        // Dodge in current move direction or forward if standing still
        let dx = 0;
        let dz = 0;
        if (keys.current.w) dz -= 1;
        if (keys.current.s) dz += 1;
        if (keys.current.a) dx -= 1;
        if (keys.current.d) dx += 1;

        if (dx === 0 && dz === 0) dz = -1; // Default forward
        
        // Normalize
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
    
    const onPointerDown = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = true;
    };

    const onPointerUp = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = false;
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onBlur = () => {
      keys.current = { w: false, a: false, s: false, d: false, shift: false };
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
  }, [phase, playerShoot, countdown, switchWeapon, dodge]);

  useFrame(({ clock }, delta) => {
    if (!rb.current || state.hp <= 0) return;

    if (phase !== 'playing' || (countdown !== null && countdown > 0.5)) {
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Update position in store for AoE logic - throttled to 10fps
    const pos = rb.current.translation();
    if (clock.getElapsedTime() - lastStoreUpdate.current > 0.1) {
      lastStoreUpdate.current = clock.getElapsedTime();
      useGameStore.setState(s => ({ player: s.player ? { ...s.player, pos: { x: pos.x, z: pos.z } } : null }));
    }

    // Rapid-fire shooting (hold mouse button)
    if (mouseDown.current && meshRef.current) {
      const { player } = useGameStore.getState();
      if (player && player.hp > 0) {
        const activeWeapon = player.activeWeaponSlot === 'secondary' && player.secondaryWeapon
          ? player.secondaryWeapon
          : player.weapon;
        
        // Fire rate: SMG = 100ms, Pistol = 250ms
        const fireInterval = player.activeWeaponSlot === 'secondary' && player.secondaryWeapon ? 0.1 : 0.25;
        const now = clock.getElapsedTime();
        
        if (now - lastFireTime.current >= fireInterval) {
          lastFireTime.current = now;
          
          if (activeWeapon.ammo <= 0) {
            SFX.gunEmpty();
          } else {
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(meshRef.current.quaternion).normalize();
            const spawnPos = { x: pos.x + direction.x * 0.6, z: pos.z + direction.z * 0.6 };
            playerShoot(spawnPos, { x: direction.x, z: direction.z });
            SFX.playerShoot();
          }
        }
      }
    }

    // Movement
    const speed = 10;
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

    rb.current.setLinvel({ x: vx, y: 0, z: vz }, true);

    // Robust Exit Check
    const { exitPos, enemies, setPhase } = useGameStore.getState();
    if (exitPos && enemies.length > 0 && enemies.every(e => e.hp <= 0)) {
       const dist = Math.sqrt(Math.pow(pos.x - exitPos.x, 2) + Math.pow(pos.z - exitPos.z, 2));
       if (dist < 1.2) {
          setPhase('level_complete');
       }
    }

    // Aiming
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
    const target = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, target);

    if (target && meshRef.current) {
      const pPos = rb.current.translation();
      const angle = Math.atan2(pPos.x - target.x, pPos.z - target.z);
      meshRef.current.rotation.y = angle;
    }

    // Weapon switch animation — bob the guns up/down
    if (isSwitching.current) {
      switchAnimProgress.current += delta * 6; // ~0.33s animation
      if (switchAnimProgress.current >= 1) {
        switchAnimProgress.current = 1;
        isSwitching.current = false;
      }
    }

    const animT = isSwitching.current ? switchAnimProgress.current : 1;
    // Ease out
    const ease = 1 - Math.pow(1 - animT, 3);
    
    const isPrimary = state.activeWeaponSlot === 'primary';
    
    // Active gun bobs up, inactive bobs down
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
  });

  if (state.hp <= 0) return null;

  const isPrimary = state.activeWeaponSlot === 'primary';

  return (
    <RigidBody 
      ref={rb} 
      type="dynamic" 
      position={[state.pos.x, 0.5, state.pos.z]} 
      lockRotations 
      enabledTranslations={[true, false, true]}
      friction={0}
      restitution={0}
      colliders={false}
      name="player"
      userData={{ type: 'player', id: state.id }}
    >
      <BallCollider args={[0.3]} />
      <group ref={meshRef}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.3, 0.4, 4, 16]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.3} />
        </mesh>
        {/* Primary gun (right side) */}
        <group ref={primaryGunRef} position={[0.2, 0.1, -0.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial 
              color={isPrimary ? '#1e3a8a' : '#0f1d45'}
              emissive={isPrimary ? '#1e3a8a' : '#000000'}
              emissiveIntensity={isPrimary ? 0.3 : 0}
            />
          </mesh>
        </group>
        {/* Secondary gun (left side) — only when dual weapon is available */}
        {state.secondaryWeapon && (
          <group ref={secondaryGunRef} position={[-0.2, 0.1, -0.4]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.1, 0.55]} />
              <meshStandardMaterial 
                color={!isPrimary ? '#1e5a1e' : '#0f2d0f'}
                emissive={!isPrimary ? '#1e5a1e' : '#000000'}
                emissiveIntensity={!isPrimary ? 0.3 : 0}
              />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
}
