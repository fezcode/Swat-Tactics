import { useGameStore } from '../../game/store';
import { MainMenu } from './MainMenu';
import { SFX } from '../../game/sounds';
import { useMemo, useState, useEffect, useRef } from 'react';

export function HUD() {
  const phase = useGameStore(s => s.phase);
  const player = useGameStore(s => s.player);
  const levelIndex = useGameStore(s => s.levelIndex);
  const loadLevel = useGameStore(s => s.loadLevel);
  const restartGame = useGameStore(s => s.restartGame);
  const countdown = useGameStore(s => s.countdown);
  const enemies = useGameStore(s => s.enemies);
  const lastDamageTime = useGameStore(s => s.lastDamageTime);
  const stats = useGameStore(s => s.stats);

  const [showDamageFlash, setShowDamageFlash] = useState(false);
  const [weaponSwitchAnim, setWeaponSwitchAnim] = useState(false);
  const prevSlotRef = useRef(player?.activeWeaponSlot || 'primary');

  useEffect(() => {
    if (lastDamageTime > 0) {
      setShowDamageFlash(true);
      const timer = setTimeout(() => setShowDamageFlash(false), 150);
      return () => clearTimeout(timer);
    }
  }, [lastDamageTime]);

  // Detect weapon switch for UI animation
  useEffect(() => {
    if (player && player.activeWeaponSlot !== prevSlotRef.current) {
      prevSlotRef.current = player.activeWeaponSlot;
      setWeaponSwitchAnim(true);
      const timer = setTimeout(() => setWeaponSwitchAnim(false), 400);
      return () => clearTimeout(timer);
    }
  }, [player?.activeWeaponSlot]);

  const boss = useMemo(() => {
    return enemies.find(e => 
      e.id.toLowerCase().includes('boss') || 
      e.id.toLowerCase().includes('master') || 
      e.id.toLowerCase().includes('overlord')
    );
  }, [enemies]);

  const handleClick = (action: () => void) => {
    SFX.buttonClick();
    action();
  };

  const handleHover = () => {
    SFX.buttonHover();
  };

  if (phase === 'main_menu') {
    return <MainMenu />;
  }

  if (phase === 'paused') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 text-white z-50 scanlines overflow-hidden">
        <h1 className="text-7xl font-black italic tracking-tighter neon-text mb-12 transform -skew-x-12">
          PAUSED
        </h1>
        <div className="flex flex-col gap-6 items-center transform -skew-x-12">
          <button 
            className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => handleClick(() => useGameStore.getState().togglePause())}
            onMouseEnter={handleHover}
          >
            RESUME MISSION
          </button>
          <button 
            className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer"
            onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu' }))}
            onMouseEnter={handleHover}
          >
            ABORT MISSION
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'game_over') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-white z-50 scanlines overflow-hidden animate-pulse">
        <h1 className="text-9xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-12">
          K.I.A.
        </h1>
        <div className="flex flex-col gap-4 items-center transform -skew-x-12">
          <button 
            className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => handleClick(() => loadLevel(levelIndex))}
            onMouseEnter={handleHover}
          >
            REPLAY MISSION
          </button>
          <button 
            className="px-12 py-2 bg-zinc-800 text-white text-lg font-black hover:bg-zinc-700 transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => handleClick(() => restartGame())}
            onMouseEnter={handleHover}
          >
            RESTART ALL MISSIONS
          </button>
          <button 
            className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer mt-4"
            onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu' }))}
            onMouseEnter={handleHover}
          >
            RETURN TO BASE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'level_complete') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/90 text-white z-50 scanlines overflow-hidden">
        <h1 className="text-8xl font-black italic tracking-tighter text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)] mb-12 transform -skew-x-12">
          AREA CLEARED
        </h1>
        <button 
          className="px-12 py-4 bg-pink-600 text-white text-2xl font-black hover:bg-pink-500 transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none transform -skew-x-12"
          onClick={() => handleClick(() => loadLevel(levelIndex + 1))}
          onMouseEnter={handleHover}
        >
          NEXT MISSION
        </button>
      </div>
    );
  }

  if (phase === 'victory') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-50 scanlines overflow-hidden">
        <div className="relative mb-12 animate-bounce">
          <h1 className="text-8xl font-black italic tracking-tighter neon-text">VICTORY</h1>
        </div>
        <p className="text-2xl font-bold text-zinc-400 mb-12 tracking-widest uppercase transform -skew-x-12">
          All Sectors Secured. Tactical Superiority Achieved.
        </p>
        <button 
          className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform -skew-x-12"
          onClick={() => handleClick(() => restartGame())}
          onMouseEnter={handleHover}
        >
          BACK TO MENU
        </button>
      </div>
    );
  }

  const hasDualWeapons = player && player.secondaryWeapon !== null;
  const isPrimary = player?.activeWeaponSlot === 'primary';

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10 overflow-hidden">
      {/* Damage Flash Overlay */}
      <div 
        className={`absolute inset-0 bg-red-600/20 transition-opacity duration-75 pointer-events-none z-0 ${showDamageFlash ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0.01 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div 
            key={Math.ceil(countdown)}
            className="text-9xl font-black italic text-white transform -skew-x-12 animate-countdown"
          >
            {countdown > 1 ? Math.ceil(countdown) - 1 : 'START'}
          </div>
        </div>
      )}

      {/* Boss Health Bar */}
      {boss && boss.hp > 0 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1/2 bg-zinc-950/80 p-2 border-b-4 border-red-600 transform -skew-x-12 pointer-events-auto shadow-2xl">
          <div className="flex justify-between items-end mb-1 px-2">
            <span className="text-xl font-black italic text-white tracking-tighter">{boss.id.toUpperCase()}</span>
            <span className="text-sm font-bold text-red-500 tracking-widest uppercase">Elite Target</span>
          </div>
          <div className="w-full h-4 bg-zinc-900 overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-red-600 transition-all duration-300" 
              style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-l-4 border-blue-500 shadow-2xl backdrop-blur-sm pointer-events-auto">
          <h2 className="text-3xl font-black italic text-white tracking-tighter">MISSION {levelIndex + 1}</h2>
          <p className="text-xs font-bold text-blue-400 tracking-widest uppercase mt-1">Status: Operational</p>
        </div>
        
        {player && (
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            {/* HP Panel */}
            <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-r-4 border-red-600 shadow-2xl backdrop-blur-sm flex flex-col items-end">
              <div className="text-4xl font-black italic text-red-600 tracking-tighter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                HP {player.hp}
              </div>
              <div className="w-48 h-2 bg-zinc-800 mt-2 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300" 
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* Weapon Panels */}
            <div className={`flex gap-2 items-end ${weaponSwitchAnim ? 'weapon-switch-anim' : ''}`}>
              {/* Primary Weapon */}
              <div 
                className={`transform -skew-x-12 shadow-2xl backdrop-blur-sm flex flex-col items-end transition-all duration-300 ${
                  isPrimary 
                    ? 'bg-zinc-950/90 p-4 border-r-4 border-blue-400 scale-100' 
                    : 'bg-zinc-950/60 p-2.5 border-r-2 border-zinc-600 scale-90 opacity-60'
                }`}
                style={{ 
                  transform: `skewX(-12deg)${weaponSwitchAnim && isPrimary ? ' translateY(-4px)' : ''}`,
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {isPrimary && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase animate-pulse">● ACTIVE</span>
                  </div>
                )}
                <div className={`font-black italic tracking-tighter ${
                  isPrimary ? 'text-xl text-blue-400' : 'text-sm text-zinc-500'
                }`}>
                  {player.weapon.name.toUpperCase()}
                </div>
                <div className={`font-black italic tracking-tighter ${
                  isPrimary ? 'text-2xl text-white mt-1' : 'text-base text-zinc-400 mt-0.5'
                }`}>
                  {player.weapon.ammo} / {player.weapon.maxAmmo}
                </div>
                {isPrimary && hasDualWeapons && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 text-[10px] font-black text-yellow-400 rounded-sm tracking-wider">Q</span>
                    <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">SWITCH</span>
                  </div>
                )}
              </div>

              {/* Secondary Weapon */}
              {hasDualWeapons && player.secondaryWeapon && (
                <div 
                  className={`transform -skew-x-12 shadow-2xl backdrop-blur-sm flex flex-col items-end transition-all duration-300 ${
                    !isPrimary 
                      ? 'bg-zinc-950/90 p-4 border-r-4 border-emerald-400 scale-100' 
                      : 'bg-zinc-950/60 p-2.5 border-r-2 border-zinc-600 scale-90 opacity-60'
                  }`}
                  style={{ 
                    transform: `skewX(-12deg)${weaponSwitchAnim && !isPrimary ? ' translateY(-4px)' : ''}`,
                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  {!isPrimary && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase animate-pulse">● ACTIVE</span>
                    </div>
                  )}
                  <div className={`font-black italic tracking-tighter ${
                    !isPrimary ? 'text-xl text-emerald-400' : 'text-sm text-zinc-500'
                  }`}>
                    {player.secondaryWeapon.name.toUpperCase()}
                  </div>
                  <div className={`font-black italic tracking-tighter ${
                    !isPrimary ? 'text-2xl text-white mt-1' : 'text-base text-zinc-400 mt-0.5'
                  }`}>
                    {player.secondaryWeapon.ammo} / {player.secondaryWeapon.maxAmmo}
                  </div>
                  {!isPrimary && hasDualWeapons && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 text-[10px] font-black text-yellow-400 rounded-sm tracking-wider">Q</span>
                      <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">SWITCH</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end">
        {/* Run Stats - Bottom Left */}
        <div className="bg-zinc-950/80 p-3 transform -skew-x-12 border-l-2 border-yellow-500 backdrop-blur-sm pointer-events-auto flex gap-6 text-xs font-bold text-zinc-400 tracking-widest uppercase shadow-2xl">
          <div className="flex items-center gap-2">
            RUN <span className="text-white bg-zinc-800 px-2 py-1">{stats.runs}</span>
          </div>
          <div className="flex items-center gap-2 text-red-500">
            KILLS <span className="text-white bg-red-900 px-2 py-1">{stats.kills}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            DEATHS <span className="text-white bg-zinc-800 px-2 py-1">{stats.deaths}</span>
          </div>
        </div>

        {/* Controls - Bottom Center */}
        <div className="bg-zinc-950/80 p-3 transform -skew-x-12 border-b-2 border-pink-500 backdrop-blur-sm pointer-events-auto flex gap-6 text-xs font-bold text-zinc-400 tracking-widest uppercase shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 px-2 py-1 text-white">WASD</span> MOVE
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 px-2 py-1 text-white">CLICK</span> FIRE
          </div>
          {hasDualWeapons && (
            <div className="flex items-center gap-2">
              <span className="bg-zinc-800 px-2 py-1 text-yellow-400">Q</span> SWITCH
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 px-2 py-1 text-white">ESC</span> PAUSE
          </div>
          <div className="flex items-center gap-2 text-pink-500">
            <span className="animate-pulse">●</span> LIVE FEED
          </div>
        </div>

        {/* Spacer for bottom right balance */}
        <div className="w-64 opacity-0 pointer-events-none" />
      </div>
    </div>
  );
}
