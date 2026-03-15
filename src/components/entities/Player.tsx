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
  const { camera, pointer, raycaster } = useThree();
  const playerShoot = useGameStore(s => s.playerShoot);
  const phase = useGameStore(s => s.phase);
  const countdown = useGameStore(s => s.countdown);

  const keys = useRef({ w: false, a: false, s: false, d: false });
  const lastStoreUpdate = useRef(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.w = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.a = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.s = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.d = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.w = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.a = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.s = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.d = false;
    };
    
    const onPointerDown = (e: MouseEvent) => {
      if (phase !== 'playing' || e.button !== 0 || !rb.current || !meshRef.current || (countdown !== null && countdown > 0.5)) return;
      
      const { player } = useGameStore.getState();
      if (!player) return;

      if (player.weapon.ammo <= 0) {
        SFX.gunEmpty();
        return;
      }

      const pos = rb.current.translation();
      const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(meshRef.current.quaternion).normalize();
      const spawnPos = { x: pos.x + direction.x * 0.6, z: pos.z + direction.z * 0.6 };
      playerShoot(spawnPos, { x: direction.x, z: direction.z });
      SFX.playerShoot();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [phase, playerShoot, countdown]);

  useFrame(({ clock }) => {
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
  });

  if (state.hp <= 0) return null;

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
        <group position={[0.2, 0.1, -0.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
}
