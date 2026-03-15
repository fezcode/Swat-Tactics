import { useState, useEffect, useMemo } from 'react';
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
  const theme = useGameStore(s => s.theme);

  const bgColor = useMemo(() => {
    switch (theme) {
      case 'garden': return '#1a2e1a';
      case 'skyscraper': return '#0a0c14';
      case 'desert': return '#4a3c2a';
      default: return '#050505';
    }
  }, [theme]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[20, 30, 20]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
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
  const lastDamageTime = useGameStore(s => s.lastDamageTime);

  useFrame(() => {
    let playerObj: THREE.Object3D | undefined;
    scene.traverse(child => {
      if (child.name === 'player') playerObj = child;
    });

    if (playerObj) {
      const pos = new THREE.Vector3();
      playerObj.getWorldPosition(pos);
      
      let offsetX = 0;
      let offsetZ = 0;

      // Screen shake logic
      const timeSinceDamage = Date.now() - lastDamageTime;
      if (timeSinceDamage < 300) {
        const intensity = (1 - timeSinceDamage / 300) * 0.5;
        offsetX = (Math.random() - 0.5) * intensity;
        offsetZ = (Math.random() - 0.5) * intensity;
      }

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pos.x + offsetX, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, pos.z + 10 + offsetZ, 0.1);
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
  const theme = useGameStore(s => s.theme);
  const phase = useGameStore(s => s.phase);

  const containerBg = useMemo(() => {
    if (phase === 'main_menu') return '#050505';
    switch (theme) {
      case 'garden': return '#1a2e1a';
      case 'skyscraper': return '#0a0c14';
      case 'desert': return '#4a3c2a';
      default: return '#050505';
    }
  }, [theme, phase]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleInteraction = () => {
      Music.play();
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Separate useEffect for Escape key to ensure it's not affected by re-renders or other listeners
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        useGameStore.getState().togglePause();
      }
    };

    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, []);

  // Ensure focus is on window when playing to catch keyboard events reliably
  useEffect(() => {
    if (phase === 'playing') {
      window.focus();
    }
  }, [phase]);

  return (
    <div 
      className="w-full h-screen relative overflow-hidden cursor-none"
      style={{ backgroundColor: containerBg }}
    >
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
