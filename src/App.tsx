import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from './game/store';
import { GridMap } from './components/environment/GridMap';
import { SurvivalArena } from './components/environment/SurvivalArena';
import { Player } from './components/entities/Player';
import { Enemy } from './components/entities/Enemy';
import { Barrel } from './components/entities/Barrel';
import { HUD } from './components/ui/HUD';
import { PauseHandler } from './components/ui/PauseHandler';
import { ParticleSystem } from './components/entities/ParticleSystem';
import { Projectiles } from './components/entities/Projectile';
import { ExplosionEffects } from './components/entities/Explosion';
import { XPOrbs } from './components/entities/XPOrb';
import { ShadowClone } from './components/entities/ShadowClone';
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
    if (phase === 'playing' || phase === 'level_intro' || phase === 'survival_playing' || phase === 'survival_wave_intro') tick(delta);
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
  const gameMode = useGameStore(s => s.gameMode);
  const survivalMutations = useGameStore(s => s.survivalState?.mutations);
  const survivalArenaSize = useGameStore(s => s.survivalState?.arenaSize);

  const bgColor = useMemo(() => {
    if (gameMode === 'survival') {
      if (survivalMutations?.includes('darkness')) return '#020202';
      switch (theme) {
        case 'desert': return '#1a1408';
        case 'space_station': return '#050510';
        case 'cemetery': return '#0a0a0c';
        case 'metro': return '#080808';
        default: return '#050510';
      }
    }
    switch (theme) {
      case 'garden': return '#1a2e1a';
      case 'skyscraper': return '#0a0c14';
      case 'desert': return '#4a3c2a';
      case 'beach': return '#38bdf8';
      case 'metro': return '#1a1a1a';
      default: return '#050505';
    }
  }, [theme, gameMode, survivalMutations]);

  const isSurvival = gameMode === 'survival';
  const ambientIntensity = isSurvival ? (survivalMutations?.includes('darkness') ? 0.4 : 0.9) : 1.2;
  const arenaHalf = survivalArenaSize ? survivalArenaSize / 2 : 15;

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[20, 30, 20]} intensity={isSurvival ? 2.0 : 2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={0.5} shadow-camera-far={100} />
      {isSurvival && <pointLight position={[arenaHalf, 8, arenaHalf]} intensity={5} distance={40} color="#6366f1" />}
      <Physics gravity={[0, 0, 0]} paused={phase === 'paused'}>
        {isSurvival ? <SurvivalArena /> : <GridMap />}
        {player && <Player state={player} />}
        {enemies.map(e => <Enemy key={e.id} state={e} />)}
        {!isSurvival && barrels.map(b => <Barrel key={b.id} state={b} />)}
        {!isSurvival && hasTrain && <Train key={useGameStore.getState().levelIndex} />}
        <Projectiles />
        <ExplosionEffects />
      </Physics>
      {isSurvival && <XPOrbs />}
      {isSurvival && <ShadowClone />}
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
  const isDodging = useGameStore(s => s.isDodging);

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

      const targetFov = isSlashZooming ? 25 : (isDodging ? 38 : 45);
      const zoomSmoothing = isSlashZooming ? 0.000000000001 : 0.005; // extremely fast zoom in, slower zoom out 
      const zoomAlpha = 1 - Math.pow(zoomSmoothing, delta);
      (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((camera as THREE.PerspectiveCamera).fov, targetFov, zoomAlpha);
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
  const isSlashZooming = useGameStore(s => s.isSlashZooming);
  const isDodging = useGameStore(s => s.isDodging);

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
    <div className={`w-full h-screen relative overflow-hidden cursor-none ${isSlashZooming ? 'glitch-effect' : ''}`} style={{ backgroundColor: containerBg }}>
      <Canvas shadows>
        <CameraRig />
        <GameScene />
      </Canvas>
      <div className={`vignette ${isDodging ? 'vignette-active' : ''}`} />
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
