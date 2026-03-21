import { useGameStore } from '../../game/store';
import { MainMenu } from './MainMenu';
import { SurvivalHUD } from './SurvivalHUD';
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
  const timeLeft = useGameStore(s => s.timeLeft);
  const currentTrackName = useGameStore(s => s.currentTrackName);
  const fps = useGameStore(s => s.fps);

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

  const gameMode = useGameStore(s => s.gameMode);

  if (phase === 'main_menu') return <MainMenu />;

  // Route to survival HUD for all survival phases
  if (gameMode === 'survival' && (phase === 'survival_playing' || phase === 'survival_wave_intro' || phase === 'survival_perk_select' || phase === 'survival_game_over')) {
    return <SurvivalHUD />;
  }

  if (phase === 'paused') {
    const survivalState = useGameStore.getState().survivalState;
    const isSurvival = gameMode === 'survival';
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/85 text-white z-50 scanlines overflow-hidden">
        <div className="flex flex-col items-center max-h-[90vh] w-full max-w-5xl px-4">
          <h1 className="text-7xl font-black italic tracking-tighter neon-text mb-8 transform -skew-x-12">PAUSED</h1>

          <div className="flex flex-col gap-4 items-center transform -skew-x-12 mb-8">
            <button className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => handleClick(() => useGameStore.getState().togglePause())} onMouseEnter={handleHover}>RESUME MISSION</button>
            <button className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer" onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu', gameMode: 'campaign', survivalState: null }))} onMouseEnter={handleHover}>ABORT MISSION</button>
          </div>

          <div className="w-full overflow-y-auto flex-1 pr-2 border-t border-zinc-700/50 pt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
            {/* CONTROLS */}
            <div className="mb-6">
              <h2 className="text-xl font-black italic tracking-tight text-blue-400 mb-3 transform -skew-x-12 border-b border-blue-400/30 pb-1">CONTROLS</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Move</span><span className="font-bold">W A S D / Arrow Keys</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Aim / Look</span><span className="font-bold">Mouse</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Shoot</span><span className="font-bold">Left Click (Hold)</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Dodge Roll</span><span className="font-bold">Shift</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Slash Attack</span><span className="font-bold">E</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Switch Weapon</span><span className="font-bold">Q</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Pause</span><span className="font-bold">Escape</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Next Track</span><span className="font-bold">. (Period)</span></div>
              </div>
            </div>

            {/* PERKS - only show in survival */}
            {isSurvival && (
              <div className="mb-6">
                <h2 className="text-xl font-black italic tracking-tight text-purple-400 mb-3 transform -skew-x-12 border-b border-purple-400/30 pb-1">PERKS</h2>
                <p className="text-xs text-zinc-500 mb-3">Offered after each wave. Tier 1 from Wave 1, Tier 2 from Wave 10, Tier 3 from Wave 20.</p>

                <div className="mb-3">
                  <h3 className="text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Tier 1 - Standard</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="font-bold" style={{ color: '#94a3b8' }}>IRON SKIN</span> <span className="text-zinc-400">— +25 Max HP & full heal. Stackable.</span></div>
                    <div><span className="font-bold" style={{ color: '#f59e0b' }}>RAPID FIRE</span> <span className="text-zinc-400">— -20% fire interval. Max 3 stacks.</span></div>
                    <div><span className="font-bold" style={{ color: '#3b82f6' }}>EXTENDED MAG</span> <span className="text-zinc-400">— +50% max ammo. Stackable.</span></div>
                    <div><span className="font-bold" style={{ color: '#22c55e' }}>SWIFT FEET</span> <span className="text-zinc-400">— +15% movement speed. Max 3 stacks.</span></div>
                    <div><span className="font-bold" style={{ color: '#a855f7' }}>SCAVENGER</span> <span className="text-zinc-400">— Pickups give 50% more. Stackable.</span></div>
                    <div><span className="font-bold" style={{ color: '#ef4444' }}>COMBAT REGEN</span> <span className="text-zinc-400">— Regenerate 2 HP/sec. Stackable.</span></div>
                    <div><span className="font-bold" style={{ color: '#dc2626' }}>HOLLOW POINTS</span> <span className="text-zinc-400">— +25% bullet damage. Stackable.</span></div>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Tier 2 - Advanced</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="font-bold" style={{ color: '#06b6d4' }}>RICOCHET</span> <span className="text-zinc-400">— Bullets bounce off arena edges.</span></div>
                    <div><span className="font-bold" style={{ color: '#f97316' }}>EXPLOSIVE ROUNDS</span> <span className="text-zinc-400">— Bullets explode on impact.</span></div>
                    <div><span className="font-bold" style={{ color: '#e2e8f0' }}>DODGE MASTER</span> <span className="text-zinc-400">— Dodge cooldown -50%, range +50%.</span></div>
                    <div><span className="font-bold" style={{ color: '#f472b6' }}>BLADE STORM</span> <span className="text-zinc-400">— Slash cooldown -60%, damage x2.</span></div>
                    <div><span className="font-bold" style={{ color: '#8b5cf6' }}>MAGNETISM</span> <span className="text-zinc-400">— Pickup radius doubled. Stackable.</span></div>
                    <div><span className="font-bold" style={{ color: '#10b981' }}>DUAL WIELD</span> <span className="text-zinc-400">— Unlock SMG secondary weapon.</span></div>
                    <div><span className="font-bold" style={{ color: '#ef4444' }}>ADRENALINE</span> <span className="text-zinc-400">— Below 30% HP: +50% fire rate & speed.</span></div>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Tier 3 - Legendary</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="font-bold" style={{ color: '#fbbf24' }}>ORBITAL STRIKE</span> <span className="text-zinc-400">— Massive explosion every 25 seconds.</span></div>
                    <div><span className="font-bold" style={{ color: '#6366f1' }}>SHADOW CLONE</span> <span className="text-zinc-400">— AI companion fights alongside you.</span></div>
                    <div><span className="font-bold" style={{ color: '#dc2626' }}>DEATH AURA</span> <span className="text-zinc-400">— Nearby enemies take 8 DPS. Stackable.</span></div>
                    <div><span className="font-bold" style={{ color: '#14b8a6' }}>TIME WARP</span> <span className="text-zinc-400">— 25% chance on kill to slow all enemies.</span></div>
                    <div><span className="font-bold" style={{ color: '#f97316' }}>PHOENIX</span> <span className="text-zinc-400">— Revive once with 50% HP + explosion.</span></div>
                    <div><span className="font-bold" style={{ color: '#ec4899' }}>BULLET HELL</span> <span className="text-zinc-400">— Fire 3 bullets in a spread.</span></div>
                  </div>
                </div>

                {/* Active perks */}
                {survivalState && survivalState.activePerks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-700/50">
                    <h3 className="text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Your Active Perks</h3>
                    <div className="flex flex-wrap gap-2">
                      {survivalState.activePerks.map((perkId, i) => {
                        const stacks = survivalState.perkStacks[perkId] || 1;
                        const perkName = perkId.replace(/_/g, ' ').toUpperCase();
                        return <span key={i} className="text-xs font-bold px-2 py-0.5 bg-zinc-800 rounded">{perkName}{stacks > 1 ? ` x${stacks}` : ''}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ENEMIES - only show in survival */}
            {isSurvival && (
              <div className="mb-6">
                <h2 className="text-xl font-black italic tracking-tight text-red-400 mb-3 transform -skew-x-12 border-b border-red-400/30 pb-1">ENEMIES</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="font-bold" style={{ color: '#fcd34d' }}>GRUNT</span> <span className="text-zinc-400">— Basic shooter. Low HP, slow.</span></div>
                  <div><span className="font-bold" style={{ color: '#ea580c' }}>RUSHER</span> <span className="text-zinc-400">— Fast, aggressive. Closes distance quickly.</span></div>
                  <div><span className="font-bold" style={{ color: '#3b82f6' }}>SNIPER</span> <span className="text-zinc-400">— High damage, shoots from distance.</span></div>
                  <div><span className="font-bold" style={{ color: '#7f1d1d' }}>TANK</span> <span className="text-zinc-400">— High HP, slow, heavy damage.</span></div>
                  <div><span className="font-bold" style={{ color: '#ff4400' }}>BOMBER</span> <span className="text-zinc-400">— Explodes on death, damaging nearby.</span></div>
                  <div><span className="font-bold" style={{ color: '#a78bfa' }}>GHOST</span> <span className="text-zinc-400">— Semi-transparent, hard to see.</span></div>
                  <div><span className="font-bold" style={{ color: '#6ee7b7' }}>SPLITTER</span> <span className="text-zinc-400">— Splits into 2 smaller enemies on death.</span></div>
                </div>
              </div>
            )}

            {/* WAVE MUTATIONS - only show in survival */}
            {isSurvival && (
              <div className="mb-4">
                <h2 className="text-xl font-black italic tracking-tight text-yellow-400 mb-3 transform -skew-x-12 border-b border-yellow-400/30 pb-1">WAVE MUTATIONS</h2>
                <p className="text-xs text-zinc-500 mb-3">Mutations stack as waves progress, making enemies increasingly dangerous.</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="font-bold text-yellow-300">ACCELERATED</span> <span className="text-zinc-400">— Wave 10+. Enemies move faster.</span></div>
                  <div><span className="font-bold text-yellow-300">ARMORED</span> <span className="text-zinc-400">— Wave 20+. Enemies have more HP.</span></div>
                  <div><span className="font-bold text-yellow-300">VENGEFUL</span> <span className="text-zinc-400">— Wave 30+. Enemies explode on death.</span></div>
                  <div><span className="font-bold text-yellow-300">DARKNESS</span> <span className="text-zinc-400">— Wave 40+. Reduced visibility.</span></div>
                  <div><span className="font-bold text-yellow-300">BERSERKER</span> <span className="text-zinc-400">— Wave 50+. Enemies deal more damage.</span></div>
                </div>
                {survivalState && survivalState.mutations.length > 0 && (
                  <div className="mt-2 text-xs text-zinc-500">Active: <span className="text-yellow-400 font-bold">{survivalState.mutations.map(m => m.replace(/_/g, ' ').toUpperCase()).join(', ')}</span></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'game_over') {
    const isTimeout = timeLeft === 0;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-white z-50 scanlines overflow-hidden animate-pulse">
        <h1 className="text-9xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-12">{isTimeout ? "TIME'S UP" : "K.I.A."}</h1>
        <div className="flex flex-col gap-4 items-center transform -skew-x-12">
          <button className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => handleClick(() => loadLevel(levelIndex))} onMouseEnter={handleHover}>REPLAY MISSION</button>
          <button className="px-12 py-2 bg-zinc-800 text-white text-lg font-black hover:bg-zinc-700 transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => handleClick(() => restartGame())} onMouseEnter={handleHover}>RESTART ALL MISSIONS</button>
          <button className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer mt-4" onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu' }))} onMouseEnter={handleHover}>RETURN TO BASE</button>
        </div>
      </div>
    );
  }

  if (phase === 'level_complete') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/90 text-white z-50 scanlines overflow-hidden">
        <h1 className="text-8xl font-black italic tracking-tighter text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)] mb-12 transform -skew-x-12">AREA CLEARED</h1>
        <button className="px-12 py-4 bg-pink-600 text-white text-2xl font-black hover:bg-pink-500 transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none transform -skew-x-12" onClick={() => handleClick(() => loadLevel(levelIndex + 1))} onMouseEnter={handleHover}>NEXT MISSION</button>
      </div>
    );
  }

  if (phase === 'victory') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-50 scanlines overflow-hidden">
        <div className="relative mb-12 animate-bounce">
          <h1 className="text-8xl font-black italic tracking-tighter neon-text">VICTORY</h1>
        </div>
        <p className="text-2xl font-bold text-zinc-400 mb-12 tracking-widest uppercase transform -skew-x-12">All Sectors Secured. Tactical Superiority Achieved.</p>
        <button className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform -skew-x-12" onClick={() => handleClick(() => restartGame())} onMouseEnter={handleHover}>BACK TO MENU</button>
      </div>
    );
  }

  const hasDualWeapons = player && player.secondaryWeapon !== null;
  const isPrimary = player?.activeWeaponSlot === 'primary';

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-red-600/20 transition-opacity duration-75 pointer-events-none z-0 ${showDamageFlash ? 'opacity-100' : 'opacity-0'}`} />

      {countdown !== null && countdown > 0.01 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div key={Math.ceil(countdown)} className="text-9xl font-black italic text-white transform -skew-x-12 animate-countdown">{countdown > 1 ? Math.ceil(countdown) - 1 : 'START'}</div>
        </div>
      )}

      {/* Music Indicator - Top Center-ish */}
      {currentTrackName !== "None" && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-40 transform -skew-x-12 flex flex-col items-center">
            <div className="bg-zinc-950/60 backdrop-blur-sm border-b-2 border-blue-500 px-4 py-1 flex items-center gap-3">
                <div className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">Now Playing</div>
                <div className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                    <span className="text-blue-500 animate-pulse">♫</span>
                    {currentTrackName}
                </div>
            </div>
        </div>
      )}

      {/* Ability Indicators - Left Side Center */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-none z-40 transform -skew-x-12">
        {/* Dodge Indicator */}
        {player && levelIndex >= 70 && (
          <div className="bg-zinc-950/80 p-3 border-l-4 border-white shadow-2xl backdrop-blur-sm">
            <div className="text-xs font-black text-zinc-500 tracking-[0.2em] uppercase mb-1">Evasion System</div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-black italic tracking-tighter text-white">DODGE</div>
              <div className="mb-1 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[10px] font-black text-yellow-400 rounded-sm">SHIFT</div>
            </div>
            <div className="w-32 h-1.5 bg-zinc-900 mt-2 relative overflow-hidden">
               {(() => {
                 const cooldown = 5000;
                 const elapsed = Date.now() - player.lastDodgeTime;
                 const ready = elapsed >= cooldown;
                 const progress = ready ? 100 : (elapsed / cooldown) * 100;
                 return <div className={`absolute top-0 left-0 h-full transition-all duration-100 ${ready ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-600'}`} style={{ width: `${progress}%` }} />;
               })()}
            </div>
          </div>
        )}

        {/* Slash Indicator */}
        {player && levelIndex >= 80 && (
          <div className="bg-zinc-950/80 p-3 border-l-4 border-white shadow-2xl backdrop-blur-sm">
            <div className="text-xs font-black text-zinc-500 tracking-[0.2em] uppercase mb-1">Melee System</div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-black italic tracking-tighter text-white">SLASH</div>
              <div className="mb-1 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[10px] font-black text-yellow-400 rounded-sm">E</div>
            </div>
            <div className="w-32 h-1.5 bg-zinc-900 mt-2 relative overflow-hidden">
               {(() => {
                 const cooldown = 10000;
                 const elapsed = Date.now() - player.lastSlashTime;
                 const ready = elapsed >= cooldown;
                 const progress = ready ? 100 : (elapsed / cooldown) * 100;
                 return <div className={`absolute top-0 left-0 h-full transition-all duration-100 ${ready ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-600'}`} style={{ width: `${progress}%` }} />;
               })()}
            </div>
          </div>
        )}
      </div>

      {timeLeft !== null && phase === 'playing' && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-40 transform -skew-x-12 mt-12">
          <div className={`text-6xl font-black italic tracking-tighter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{Math.max(0, timeLeft).toFixed(1)}</div>
          <div className="text-sm font-bold text-zinc-400 tracking-widest uppercase">Time Remaining</div>
        </div>
      )}

      {boss && boss.hp > 0 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1/2 bg-zinc-950/80 p-2 border-b-4 border-red-600 transform -skew-x-12 pointer-events-auto shadow-2xl">
          <div className="flex justify-between items-end mb-1 px-2">
            <span className="text-xl font-black italic text-white tracking-tighter">{boss.id.toUpperCase()}</span>
            <span className="text-sm font-bold text-red-500 tracking-widest uppercase">Elite Target</span>
          </div>
          <div className="w-full h-4 bg-zinc-900 overflow-hidden border border-zinc-800">
            <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-l-4 border-blue-500 shadow-2xl backdrop-blur-sm pointer-events-auto">
          <h2 className="text-3xl font-black italic text-white tracking-tighter">MISSION {levelIndex + 1}</h2>
          <p className="text-xs font-bold text-blue-400 tracking-widest uppercase mt-1">Status: Operational</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">System Performance:</span>
            <span className={`text-[10px] font-black tracking-tighter ${fps < 30 ? 'text-red-500' : 'text-emerald-500'}`}>
              {Math.round(fps)} FPS
            </span>
          </div>
        </div>
        
        {player && (
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-r-4 border-red-600 shadow-2xl backdrop-blur-sm flex flex-col items-end">
              <div className="text-4xl font-black italic text-red-600 tracking-tighter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">HP {player.hp}</div>
              <div className="w-48 h-2 bg-zinc-800 mt-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
              </div>
            </div>

            <div className={`flex gap-2 items-end ${weaponSwitchAnim ? 'weapon-switch-anim' : ''}`}>
              <div className={`transform -skew-x-12 shadow-2xl backdrop-blur-sm flex flex-col items-end transition-all duration-300 ${isPrimary ? 'bg-zinc-950/90 p-4 border-r-4 border-blue-400 scale-100' : 'bg-zinc-950/60 p-2.5 border-r-2 border-zinc-600 scale-90 opacity-60'}`} style={{ transform: `skewX(-12deg)${weaponSwitchAnim && isPrimary ? ' translateY(-4px)' : ''}`, transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                {isPrimary && <div className="flex items-center gap-2 mb-0.5"><span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase animate-pulse">● ACTIVE</span></div>}
                <div className={`font-black italic tracking-tighter ${isPrimary ? 'text-xl text-blue-400' : 'text-sm text-zinc-500'}`}>{player.weapon.name.toUpperCase()}</div>
                <div className={`font-black italic tracking-tighter ${isPrimary ? 'text-2xl text-white mt-1' : 'text-base text-zinc-400 mt-0.5'}`}>{player.weapon.ammo} / {player.weapon.maxAmmo}</div>
                {isPrimary && hasDualWeapons && <div className="flex items-center gap-1 mt-1.5"><span className="bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 text-[10px] font-black text-yellow-400 rounded-sm tracking-wider">Q</span><span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">SWITCH</span></div>}
              </div>

              {hasDualWeapons && player.secondaryWeapon && (
                <div className={`transform -skew-x-12 shadow-2xl backdrop-blur-sm flex flex-col items-end transition-all duration-300 ${!isPrimary ? 'bg-zinc-950/90 p-4 border-r-4 border-emerald-400 scale-100' : 'bg-zinc-950/60 p-2.5 border-r-2 border-zinc-600 scale-90 opacity-60'}`} style={{ transform: `skewX(-12deg)${weaponSwitchAnim && !isPrimary ? ' translateY(-4px)' : ''}`, transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  {!isPrimary && <div className="flex items-center gap-2 mb-0.5"><span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase animate-pulse">● ACTIVE</span></div>}
                  <div className={`font-black italic tracking-tighter ${!isPrimary ? 'text-xl text-emerald-400' : 'text-sm text-zinc-500'}`}>{player.secondaryWeapon.name.toUpperCase()}</div>
                  <div className={`font-black italic tracking-tighter ${!isPrimary ? 'text-2xl text-white mt-1' : 'text-base text-zinc-400 mt-0.5'}`}>{player.secondaryWeapon.ammo} / {player.secondaryWeapon.maxAmmo}</div>
                  {!isPrimary && hasDualWeapons && <div className="flex items-center gap-1 mt-1.5"><span className="bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 text-[10px] font-black text-yellow-400 rounded-sm tracking-wider">Q</span><span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">SWITCH</span></div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div className="bg-zinc-950/80 p-3 transform -skew-x-12 border-l-2 border-yellow-500 backdrop-blur-sm pointer-events-auto flex gap-6 text-xs font-bold text-zinc-400 tracking-widest uppercase shadow-2xl">
          <div>RUN <span className="text-white bg-zinc-800 px-2 py-1">{stats.runs}</span></div>
          <div className="text-red-500">KILLS <span className="text-white bg-red-900 px-2 py-1">{stats.kills}</span></div>
          <div className="text-zinc-500">DEATHS <span className="text-white bg-zinc-800 px-2 py-1">{stats.deaths}</span></div>
        </div>

        <div className="bg-zinc-950/80 p-3 transform -skew-x-12 border-b-2 border-pink-500 backdrop-blur-sm pointer-events-auto flex gap-6 text-xs font-bold text-zinc-400 tracking-widest uppercase shadow-2xl">
          <div className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 text-white">WASD</span> MOVE</div>
          <div className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 text-white">CLICK</span> FIRE</div>
          {hasDualWeapons && <div className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 text-yellow-400">Q</span> SWITCH</div>}
          <div className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 text-white">ESC</span> PAUSE</div>
          {levelIndex >= 70 && <div className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 text-yellow-400">SHIFT</span> DODGE</div>}
          {levelIndex >= 80 && <div className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 text-yellow-400">E</span> SLASH</div>}
          <div className="flex items-center gap-2 text-pink-500"><span className="animate-pulse">●</span> LIVE FEED</div>
        </div>
        <div className="w-64 opacity-0 pointer-events-none" />
      </div>
    </div>
  );
}
