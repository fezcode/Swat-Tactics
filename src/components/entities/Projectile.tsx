import { useRef, useEffect } from 'react';
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import type { ProjectileState } from '../../types';

function ProjectileItem({ p }: { p: ProjectileState }) {
  const rb = useRef<RapierRigidBody>(null);
  const removeProjectile = useGameStore(s => s.removeProjectile);
  const damageEntity = useGameStore(s => s.damageEntity);
  const theme = useGameStore(s => s.theme);

  useEffect(() => {
    if (rb.current) {
      rb.current.setLinvel({ x: p.velocity.x, y: 0, z: p.velocity.z }, true);
    }
  }, []);

  const playerBulletColor = theme === 'beach' ? "#000000" : "#ffffff";

  return (
    <RigidBody 
      ref={rb}
      type="dynamic"
      position={[p.pos.x, 0.5, p.pos.z]}
      ccd={true}
      gravityScale={0}
      sensor
      userData={{ type: 'projectile' }}
      onIntersectionEnter={({ other }) => {
        const otherRb = other.rigidBodyObject;
        const userData = otherRb?.userData as any;
        
        if (!userData) return;
        
        if (userData.type === 'floor' || userData.type === 'projectile' || userData.type === 'exit') return;
        if (p.isEnemy && (userData.type === 'enemy' || userData.type === 'turret')) return;
        if (!p.isEnemy && userData.type === 'player') return;
        
        // Get current physics position for precise impact reporting
        const currentPos = rb.current ? rb.current.translation() : p.pos;

        if (userData.id) {
          damageEntity(userData.id, p.damage, { x: currentPos.x, z: currentPos.z });
        } else if (userData.type === 'player') {
          damageEntity('player', p.damage, { x: currentPos.x, z: currentPos.z });
        }
        
        removeProjectile(p.id);
      }}
    >
      <BallCollider args={[0.1]} />
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={p.isEnemy ? "#ff4444" : playerBulletColor} />
      </mesh>
    </RigidBody>
  );
}

export function Projectiles() {
  const projectiles = useGameStore(s => s.projectiles);

  return (
    <group>
      {projectiles.map(p => (
        <ProjectileItem key={p.id} p={p} />
      ))}
    </group>
  );
}