import { useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from './game/store';
import { GridMap } from './components/environment/GridMap';
import { Player } from './components/entities/Player';
import { Enemy } from './components/entities/Enemy';
import { Barrel } from './components/entities/Barrel';
import { HUD } from './components/ui/HUD';
import { ParticleSystem } from './components/entities/ParticleSystem';
import { Projectiles } from './components/entities/Projectile';
import { ExplosionEffects } from './components/entities/Explosion';
import { Music } from './game/sounds';

function GameLoop() {
  const tick = useGameStore(s => s.tick);
  const phase = useGameStore(s => s.phase);
  useFrame((_, delta) => {
    if (phase === 'playing') {
      tick(delta);
    }
  });
  return null;
}

function GameScene() {
  const player = useGameStore(s => s.player);
  const enemies = useGameStore(s => s.enemies);
  const barrels = useGameStore(s => s.barrels);
  const phase = useGameStore(s => s.phase);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />

      <Physics gravity={[0, 0, 0]} paused={phase === 'paused'}>
        <GridMap />
        
        {player && <Player state={player} />}
        {enemies.map(e => <Enemy key={e.id} state={e} />)}
        {barrels.map(b => <Barrel key={b.id} state={b} />)}
        
        <Projectiles />
        <ExplosionEffects />
      </Physics>
      
      <ParticleSystem />
      <GameLoop />
    </>
  );
}

function CameraRig() {
  const { camera, scene } = useThree();

  useFrame(() => {
    let playerObj: THREE.Object3D | undefined;
    scene.traverse(child => {
      if (child.name === 'player') playerObj = child;
    });

    if (playerObj) {
      const pos = new THREE.Vector3();
      playerObj.getWorldPosition(pos);
      
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pos.x, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, pos.z + 10, 0.1);
      camera.lookAt(camera.position.x, 0, camera.position.z - 10);
    }
  });

  return (
    <PerspectiveCamera 
      makeDefault 
      position={[0, 15, 10]} 
      fov={45} 
    />
  );
}

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleInteraction = () => {
      Music.play();
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useGameStore.getState().togglePause();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#0a0a0a] relative overflow-hidden cursor-none">
      <Canvas shadows>
        <CameraRig />
        <GameScene />
      </Canvas>
      
      {/* CRT Scanline Overlay - Re-implemented safer version of what you liked */}
      <div className="scanlines-container" />

      <HUD />
      
      {/* Crosshair overlay following mouse - Highest Z-Index */}
      <div 
        className="pointer-events-none fixed z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{ left: mousePos.x, top: mousePos.y }}
      >
        <div className="w-6 h-6 border-2 border-white/70 rounded-full flex items-center justify-center mix-blend-difference">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
