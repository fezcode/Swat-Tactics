import { useState, useEffect, useMemo, useRef } from 'react';
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
import { PauseHandler } from './components/ui/PauseHandler';
import { ParticleSystem } from './components/entities/ParticleSystem';
import { Projectiles } from './components/entities/Projectile';
import { ExplosionEffects } from './components/entities/Explosion';
import { Music } from './game/sounds';
import { Train } from './components/entities/Train';

function GameLoop() {
  const tick = useGameStore(s => s.tick);
  const phase = useGameStore(s => s.phase);
  const setFps = useGameStore(s => s.setFps);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame((_, delta) => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      setFps(frameCount.current);
      frameCount.current = 0;
      lastTime.current = now;
    }
    if (phase === 'playing' || phase === 'level_intro') tick(delta);
  });
  return null;
}

function GameScene() {
  const player = useGameStore(s => s.player);
  const enemies = useGameStore(s => s.enemies);
  const barrels = useGameStore(s => s.barrels);
  const phase = useGameStore(s => s.phase);
  const theme = useGameStore(s => s.theme);
  const hasTrain = useGameStore(s => s.hasTrain);

  const bgColor = useMemo(() => {
    switch (theme) {
      case 'garden': return '#1a2e1a';
      case 'skyscraper': return '#0a0c14';
      case 'desert': return '#4a3c2a';
      case 'beach': return '#38bdf8';
      case 'metro': return '#1a1a1a';
      default: return '#050505';
    }
  }, [theme]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[20, 30, 20]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={0.5} shadow-camera-far={100} />
      <Physics gravity={[0, 0, 0]} paused={phase === 'paused'}>
        <GridMap />
        {player && <Player state={player} />}
        {enemies.map(e => <Enemy key={e.id} state={e} />)}
        {barrels.map(b => <Barrel key={b.id} state={b} />)}
        {hasTrain && <Train key={useGameStore.getState().levelIndex} />}
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
  const lastShakeTime = useGameStore(s => s.lastShakeTime);
  const trainActive = useGameStore(s => s.trainActive);
  const isSlashZooming = useGameStore(s => s.isSlashZooming);

  useFrame((_, delta) => {
    let playerObj: THREE.Object3D | undefined;
    scene.traverse(child => { if (child.name === 'player') playerObj = child; });

    if (playerObj) {
      const pos = new THREE.Vector3();
      playerObj.getWorldPosition(pos);
      
      let offsetX = 0;
      let offsetZ = 0;
      const timeSinceDamage = Date.now() - lastDamageTime;
      const timeSinceShake = Date.now() - lastShakeTime;
      
      if (timeSinceDamage < 300 || timeSinceShake < 400 || trainActive) {
        const intensity = trainActive ? 0.4 : Math.max(
            timeSinceDamage < 300 ? (1 - timeSinceDamage / 300) * 0.5 : 0,
            timeSinceShake < 400 ? (1 - timeSinceShake / 400) * 0.8 : 0
        );
        offsetX = (Math.random() - 0.5) * intensity;
        offsetZ = (Math.random() - 0.5) * intensity;
      }

      // Frame-rate independent lerp for extreme smoothness
      // formula: 1 - Math.pow(smoothing, delta)
      const smoothing = 0.0001; // much lower = much faster
      const alpha = 1 - Math.pow(smoothing, delta);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pos.x + offsetX, alpha);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, pos.z + 10 + offsetZ, alpha);
      camera.lookAt(camera.position.x, 0, camera.position.z - 10);

      const targetFov = isSlashZooming ? 30 : 45;
      (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((camera as THREE.PerspectiveCamera).fov, targetFov, alpha * 2);
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });

  return <PerspectiveCamera makeDefault position={[0, 15, 10]} fov={45} />;
}

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const theme = useGameStore(s => s.theme);
  const phase = useGameStore(s => s.phase);
  const crtEnabled = useGameStore(s => s.crtEnabled);

  const containerBg = useMemo(() => {
    if (phase === 'main_menu') return '#050505';
    switch (theme) {
      case 'garden': return '#1a2e1a';
      case 'skyscraper': return '#0a0c14';
      case 'desert': return '#4a3c2a';
      case 'beach': return '#38bdf8';
      case 'metro': return '#1a1a1a';
      default: return '#050505';
    }
  }, [theme, phase]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleInteraction = () => { Music.play(); window.removeEventListener('mousedown', handleInteraction); window.removeEventListener('keydown', handleInteraction); };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === '.') Music.next(); };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mousedown', handleInteraction); window.removeEventListener('keydown', handleInteraction); window.removeEventListener('keydown', handleKeyDown); };
  }, []);

  useEffect(() => {
    if (phase !== 'main_menu') {
      window.focus();
      const refocus = () => window.focus();
      document.addEventListener('mousedown', refocus);
      const interval = setInterval(refocus, 2000);
      return () => { document.removeEventListener('mousedown', refocus); clearInterval(interval); };
    }
  }, [phase]);

  return (
    <div className="w-full h-screen relative overflow-hidden cursor-none" style={{ backgroundColor: containerBg }}>
      <Canvas shadows>
        <CameraRig />
        <GameScene />
      </Canvas>
      {crtEnabled && <div className="scanlines-container" />}
      <PauseHandler />
      <HUD />
      <div className="pointer-events-none fixed z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style={{ left: mousePos.x, top: mousePos.y }}>
        <div className="w-6 h-6 border-2 border-white/70 rounded-full flex items-center justify-center mix-blend-difference">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
