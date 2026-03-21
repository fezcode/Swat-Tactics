import { useGameStore } from '../../game/store';
import { positionCache } from '../../game/positionCache';
import { SFX } from '../../game/sounds';
import { PerkSelection } from './PerkSelection';
import { PERKS } from '../../game/survivalPerks';
import { getMutationLabel, getMutationColor } from '../../game/survivalWaves';
import { useState, useEffect, useRef } from 'react';

function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastDraw = 0;
    const draw = (time: number) => {
      rafRef.current = requestAnimationFrame(draw);
      // Throttle to ~5 FPS — minimap doesn't need 60fps
      if (time - lastDraw < 200) return;
      lastDraw = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = useGameStore.getState();
      const player = state.player;
      const enemies = state.enemies;
      const survivalState = state.survivalState;

      const size = 160;
      const arenaSize = survivalState?.arenaSize || 30;
      const scale = size / arenaSize;

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = 'rgba(100, 100, 140, 0.15)';
      ctx.lineWidth = 0.5;
      const gridStep = 5;
      for (let i = 0; i <= arenaSize; i += gridStep) {
        ctx.beginPath(); ctx.moveTo(i * scale, 0); ctx.lineTo(i * scale, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * scale); ctx.lineTo(size, i * scale); ctx.stroke();
      }

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, size - 2, size - 2);

      // XP Orbs
      if (survivalState) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        survivalState.xpOrbs.forEach(orb => {
          ctx.beginPath();
          ctx.arc(orb.pos.x * scale, orb.pos.z * scale, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Enemies - read from position cache for accurate positions
      enemies.forEach(e => {
        if (e.hp <= 0) return;
        const ep = positionCache.get(e.id) || e.pos;
        ctx.fillStyle = e.color || '#ef4444';
        ctx.beginPath();
        ctx.arc(ep.x * scale, ep.z * scale, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Shadow clone
      if (survivalState?.clonePos) {
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(survivalState.clonePos.x * scale, survivalState.clonePos.z * scale, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player
      if (player) {
        const pp = positionCache.get('player') || player.pos;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.beginPath(); ctx.arc(pp.x * scale, pp.z * scale, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(pp.x * scale, pp.z * scale, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(pp.x * scale, pp.z * scale, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="border border-zinc-700/50 bg-zinc-950/80 backdrop-blur-sm"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute top-0 left-0 w-full px-2 py-0.5 bg-zinc-950/60">
        <span className="text-[8px] font-black text-zinc-500 tracking-[0.2em] uppercase">Tactical Map</span>
      </div>
      {/* Legend */}
      <div className="flex gap-2 mt-1">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[7px] text-zinc-600 font-bold">YOU</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[7px] text-zinc-600 font-bold">FOE</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500" /><span className="text-[7px] text-zinc-600 font-bold">XP</span></div>
      </div>
    </div>
  );
}

export function SurvivalHUD() {
  const phase = useGameStore(s => s.phase);
  const player = useGameStore(s => s.player);
  const survivalState = useGameStore(s => s.survivalState);
  const lastDamageTime = useGameStore(s => s.lastDamageTime);
  const fps = useGameStore(s => s.fps);
  const currentTrackName = useGameStore(s => s.currentTrackName);

  const arenaSize = survivalState?.arenaSize || 30;
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

  if (!survivalState) return null;

  const handleClick = (action: () => void) => { SFX.buttonClick(); action(); };
  const handleHover = () => { SFX.buttonHover(); };

  // Perk selection screen
  if (phase === 'survival_perk_select') {
    return <PerkSelection />;
  }

  // Game over screen
  if (phase === 'survival_game_over') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-white z-50 overflow-hidden">
        <h1 className="text-9xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-4 survival-title-glow">TERMINATED</h1>
        <div className="transform -skew-x-12 mb-8">
          <p className="text-2xl font-bold text-zinc-400 tracking-widest uppercase">Operation Endless Night</p>
        </div>

        <div className="flex gap-12 mb-12 transform -skew-x-12">
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Final Wave</div>
            <div className="text-5xl font-black italic text-white neon-text">{survivalState.wave}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Score</div>
            <div className="text-5xl font-black italic text-yellow-400">{survivalState.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Perks</div>
            <div className="text-5xl font-black italic text-purple-400">{survivalState.activePerks.length}</div>
          </div>
        </div>

        {survivalState.activePerks.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-lg justify-center mb-8">
            {survivalState.activePerks.map(perkId => {
              const perk = PERKS.find(p => p.id === perkId);
              if (!perk) return null;
              const stacks = survivalState.perkStacks[perkId] || 1;
              return (
                <div key={perkId} className="px-2 py-1 text-xs font-bold tracking-wider" style={{ background: `${perk.color}30`, color: perk.color, border: `1px solid ${perk.color}50` }}>
                  {perk.name}{stacks > 1 ? ` x${stacks}` : ''}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-4 items-center transform -skew-x-12">
          <button className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => handleClick(() => useGameStore.getState().startSurvival())} onMouseEnter={handleHover}>TRY AGAIN</button>
          <button className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer mt-4" onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu', gameMode: 'campaign', survivalState: null }))} onMouseEnter={handleHover}>RETURN TO BASE</button>
        </div>
      </div>
    );
  }

  const hasDualWeapons = player && player.secondaryWeapon !== null;
  const isPrimary = player?.activeWeaponSlot === 'primary';
  const isWaveIntro = phase === 'survival_wave_intro';
  const aliveEnemies = useGameStore.getState().enemies.filter(e => e.hp > 0).length;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-red-600/20 transition-opacity duration-75 pointer-events-none z-0 ${showDamageFlash ? 'opacity-100' : 'opacity-0'}`} />

      {/* Darkness mutation overlay */}
      {survivalState.mutations.includes('darkness') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />
      )}

      {/* Wave intro overlay */}
      {isWaveIntro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
          <div className="animate-countdown transform -skew-x-12">
            <h2 className="text-8xl font-black italic text-white tracking-tighter neon-text survival-title-glow">
              WAVE {survivalState.wave}
            </h2>
          </div>
          <div key={Math.ceil(survivalState.waveIntroTimer)} className="mt-4 animate-countdown">
            <span className="text-5xl font-black italic text-white/80 tracking-tighter">{Math.ceil(survivalState.waveIntroTimer)}</span>
          </div>
          {survivalState.wave % 5 === 0 && survivalState.wave > 0 && (
            <div className="mt-4 animate-pulse">
              <span className="text-3xl font-black italic text-red-500 tracking-tighter">BOSS WAVE</span>
            </div>
          )}
          {survivalState.wave >= 5 && (
            <div className="mt-3 text-sm font-bold text-zinc-400 tracking-widest uppercase animate-pulse">Arena expanding...</div>
          )}
          {survivalState.mutations.length > 0 && (
            <div className="mt-6 flex gap-3">
              {survivalState.mutations.map(m => (
                <div key={m} className="px-3 py-1 text-sm font-black tracking-widest uppercase" style={{ background: `${getMutationColor(m)}30`, color: getMutationColor(m), border: `1px solid ${getMutationColor(m)}` }}>
                  {getMutationLabel(m)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Music Indicator */}
      {currentTrackName !== "None" && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-40 transform -skew-x-12 flex flex-col items-center">
          <div className="bg-zinc-950/60 backdrop-blur-sm border-b-2 border-purple-500 px-4 py-1 flex items-center gap-3">
            <div className="text-[10px] font-black text-purple-400 tracking-[0.2em] uppercase">Now Playing</div>
            <div className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
              <span className="text-purple-500 animate-pulse">♫</span>
              {currentTrackName}
            </div>
          </div>
        </div>
      )}

      {/* Top row */}
      <div className="flex justify-between items-start">
        {/* Left: Wave, Score, Minimap */}
        <div className="flex flex-col gap-2">
          <div className="bg-zinc-950/80 p-3 transform -skew-x-12 border-l-4 border-purple-500 shadow-2xl backdrop-blur-sm pointer-events-auto">
            <div className="flex items-end gap-3">
              <h2 className="text-3xl font-black italic text-white tracking-tighter">WAVE {survivalState.wave}</h2>
              <span className="text-sm font-bold text-zinc-500 mb-0.5">{Math.round(arenaSize)}m</span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">Endless Night</span>
              <span className={`text-[10px] font-black ${fps < 30 ? 'text-red-500' : 'text-emerald-500'}`}>{Math.round(fps)} FPS</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-zinc-950/80 p-2.5 transform -skew-x-12 border-l-4 border-yellow-500 shadow-2xl backdrop-blur-sm">
              <div className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">Score</div>
              <div className="text-xl font-black italic text-yellow-400 tracking-tighter">{survivalState.score.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-950/80 p-2.5 transform -skew-x-12 border-l-4 border-red-600 shadow-2xl backdrop-blur-sm">
              <div className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">Hostiles</div>
              <div className="text-xl font-black italic text-red-400 tracking-tighter">{aliveEnemies}</div>
            </div>
          </div>

          {survivalState.killCombo >= 3 && (
            <div className="bg-zinc-950/80 p-2 transform -skew-x-12 border-l-4 border-pink-500 shadow-2xl backdrop-blur-sm animate-pulse">
              <div className="text-lg font-black italic text-pink-400 tracking-tighter">{survivalState.killCombo}x COMBO</div>
            </div>
          )}

          {/* Minimap */}
          <div className="mt-1 transform -skew-x-3">
            <Minimap />
          </div>
        </div>

        {/* Right: HP & Weapons */}
        {player && (
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            <div className="bg-zinc-950/80 p-4 transform -skew-x-12 border-r-4 border-red-600 shadow-2xl backdrop-blur-sm flex flex-col items-end">
              <div className="text-4xl font-black italic text-red-600 tracking-tighter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">HP {Math.ceil(player.hp)}</div>
              <div className="w-48 h-2 bg-zinc-800 mt-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
              </div>
              <div className="text-[10px] font-bold text-zinc-600 mt-1 tracking-widest uppercase">Auto-reload active</div>
            </div>

            <div className={`flex gap-2 items-end ${weaponSwitchAnim ? 'weapon-switch-anim' : ''}`}>
              <div className={`transform -skew-x-12 shadow-2xl backdrop-blur-sm flex flex-col items-end transition-all duration-300 ${isPrimary ? 'bg-zinc-950/90 p-3 border-r-4 border-blue-400 scale-100' : 'bg-zinc-950/60 p-2 border-r-2 border-zinc-600 scale-90 opacity-60'}`}>
                {isPrimary && <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase animate-pulse mb-0.5">● ACTIVE</span>}
                <div className={`font-black italic tracking-tighter ${isPrimary ? 'text-lg text-blue-400' : 'text-sm text-zinc-500'}`}>{player.weapon.name.toUpperCase()}</div>
                <div className={`font-black italic tracking-tighter ${isPrimary ? 'text-xl text-white' : 'text-base text-zinc-400'}`}>{player.weapon.ammo} / {player.weapon.maxAmmo}</div>
              </div>
              {hasDualWeapons && player.secondaryWeapon && (
                <div className={`transform -skew-x-12 shadow-2xl backdrop-blur-sm flex flex-col items-end transition-all duration-300 ${!isPrimary ? 'bg-zinc-950/90 p-3 border-r-4 border-emerald-400 scale-100' : 'bg-zinc-950/60 p-2 border-r-2 border-zinc-600 scale-90 opacity-60'}`}>
                  {!isPrimary && <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase animate-pulse mb-0.5">● ACTIVE</span>}
                  <div className={`font-black italic tracking-tighter ${!isPrimary ? 'text-lg text-emerald-400' : 'text-sm text-zinc-500'}`}>{player.secondaryWeapon.name.toUpperCase()}</div>
                  <div className={`font-black italic tracking-tighter ${!isPrimary ? 'text-xl text-white' : 'text-base text-zinc-400'}`}>{player.secondaryWeapon.ammo} / {player.secondaryWeapon.maxAmmo}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="flex justify-between items-end">
        {/* Active perks & mutations */}
        <div className="flex flex-col gap-1.5">
          {survivalState.mutations.length > 0 && (
            <div className="flex gap-1">
              {survivalState.mutations.map(m => (
                <div key={m} className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase" style={{ background: `${getMutationColor(m)}20`, color: getMutationColor(m) }}>
                  {getMutationLabel(m)}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1 max-w-sm">
            {survivalState.activePerks.map(perkId => {
              const perk = PERKS.find(p => p.id === perkId);
              if (!perk) return null;
              const stacks = survivalState.perkStacks[perkId] || 1;
              return (
                <div key={perkId} className="w-7 h-7 flex items-center justify-center relative" style={{ background: `${perk.color}25`, border: `1px solid ${perk.color}50` }} title={`${perk.name}${stacks > 1 ? ` x${stacks}` : ''}`}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: perk.color, boxShadow: `0 0 4px ${perk.color}` }} />
                  {stacks > 1 && <span className="absolute -top-1 -right-1 text-[7px] font-black text-white bg-zinc-900 px-0.5">{stacks}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Abilities & Controls */}
        <div className="flex flex-col gap-2 items-end">
          {player && (
            <div className="flex gap-2">
              {[
                { name: 'Dodge', key: 'SHIFT', perk: 'dodge_master', cd: [5000, 2500] },
                { name: 'Slash', key: 'E', perk: 'blade_storm', cd: [10000, 4000] },
              ].map(ability => {
                const hasPerk = survivalState.activePerks.includes(ability.perk as any);
                const cooldown = hasPerk ? ability.cd[1] : ability.cd[0];
                const elapsed = Date.now() - (ability.name === 'Dodge' ? player.lastDodgeTime : player.lastSlashTime);
                const ready = elapsed >= cooldown;
                const progress = ready ? 100 : (elapsed / cooldown) * 100;
                return (
                  <div key={ability.name} className="bg-zinc-950/80 p-1.5 transform -skew-x-12 backdrop-blur-sm w-20">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase">{ability.name}</span>
                      <span className="text-[8px] font-bold text-yellow-400 bg-zinc-800 px-1">{ability.key}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 mt-1 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full transition-all duration-100 ${ready ? 'bg-white shadow-[0_0_6px_white]' : 'bg-zinc-600'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-zinc-950/80 p-1.5 transform -skew-x-12 backdrop-blur-sm flex gap-3 text-[9px] font-bold text-zinc-500 tracking-widest uppercase">
            <span><span className="text-white">WASD</span> Move</span>
            <span><span className="text-white">Click</span> Fire</span>
            {hasDualWeapons && <span><span className="text-yellow-400">Q</span> Switch</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
