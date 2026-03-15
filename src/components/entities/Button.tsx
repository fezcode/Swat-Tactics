import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../game/store';
import { SFX } from '../../game/sounds';

interface ButtonProps {
  id: string;
}

export function Button({ id }: ButtonProps) {
  const button = useGameStore(s => s.buttons.find(b => b.id === id));
  const toggleButton = useGameStore(s => s.toggleButton);

  if (!button) return null;

  return (
    <RigidBody 
      type="fixed" 
      position={[button.pos.x, 0.05, button.pos.z]} 
      sensor 
      userData={{ type: 'button', id: button.id }}
      onIntersectionEnter={({ other }) => {
        const userData = other.rigidBodyObject?.userData as any;
        if (userData?.type === 'player' && !button.active) {
          toggleButton(id, true);
          SFX.buttonClick();
        }
      }}
    >
      <CuboidCollider args={[0.6, 0.2, 0.6]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial 
          color={button.active ? "#22c55e" : "#3b82f6"} 
          emissive={button.active ? "#22c55e" : "#3b82f6"}
          emissiveIntensity={button.active ? 2 : 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Visual Base */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[1.4, 0.1, 1.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      <pointLight 
        position={[0, 0.5, 0]}
        color={button.active ? "#22c55e" : "#3b82f6"} 
        intensity={button.active ? 10 : 2} 
        distance={3} 
      />
    </RigidBody>
  );
}
