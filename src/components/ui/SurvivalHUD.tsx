import { useGameStore } from '../../game/store';
import { positionCache } from '../../game/positionCache';
import { SFX } from '../../game/sounds';
import { PerkSelection } from './PerkSelection';
import { PERKS, getActiveEvolutions } from '../../game/survivalPerks';
import { getMutationLabel, getMutationColor } from '../../game/survivalWaves';
import { useState, useEffect, useRef } from 'react';
import type { RunTimelineEntry } from '../../game/store';

function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastDraw = 0;
    const draw = (time: number) => {
      rafRef.current = requestAnimationFrame(draw);
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

      if (survivalState) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        survivalState.xpOrbs.forEach(orb => {
          ctx.beginPath();
          ctx.arc(orb.pos.x * scale, orb.pos.z * scale, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      enemies.forEach(e => {
        if (e.hp <= 0) return;
        const ep = positionCache.get(e.id) || e.pos;
        ctx.fillStyle = e.isElite ? '#fbbf24' : e.isBoss ? '#ff0000' : e.color || '#ef4444';
        const r = e.isBoss ? 4 : e.isElite ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.arc(ep.x * scale, ep.z * scale, r, 0, Math.PI * 2);
        ctx.fill();
        if (e.isElite) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      if (survivalState?.clonePos) {
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(survivalState.clonePos.x * scale, survivalState.clonePos.z * scale, 3, 0, Math.PI * 2);
        ctx.fill();
      }

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
      <div className="flex gap-2 mt-1">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[7px] text-zinc-600 font-bold">YOU</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[7px] text-zinc-600 font-bold">FOE</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-[7px] text-zinc-600 font-bold">ELITE</span></div>
      </div>
    </div>
  );
}

function DeathScreen({ survivalState }: { survivalState: any }) {
  const handleClick = (action: () => void) => { SFX.buttonClick(); action(); };
  const handleHover = () => { SFX.buttonHover(); };
  const meta = useGameStore(s => s.meta);
  const evolutions = getActiveEvolutions(survivalState.perkStacks);
  const creditsEarned = Math.floor(survivalState.score / 10) + survivalState.wave * 5;
  const isNewBest = survivalState.score >= survivalState.highScore && survivalState.score > 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-white z-50 overflow-y-auto py-8">
      <h1 className="text-9xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-4 survival-title-glow">TERMINATED</h1>
      {isNewBest && (
        <div className="text-2xl font-black text-yellow-400 animate-pulse mb-2">NEW PERSONAL BEST!</div>
      )}
      <div className="transform -skew-x-12 mb-6">
        <p className="text-2xl font-bold text-zinc-400 tracking-widest uppercase">Operation Endless Night</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-8 mb-8 transform -skew-x-12">
        <div className="text-center">
          <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Final Wave</div>
          <div className="text-5xl font-black italic text-white neon-text">{survivalState.wave}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Score</div>
          <div className="text-5xl font-black italic text-yellow-400">{survivalState.score.toLocaleString()}</div>
          {survivalState.scoreMultiplier > 1 && (
            <div className="text-xs font-bold text-yellow-600">x{survivalState.scoreMultiplier.toFixed(1)} multiplier</div>
          )}
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Credits</div>
          <div className="text-5xl font-black italic text-emerald-400">+{creditsEarned}</div>
        </div>
      </div>

      {/* Perks acquired */}
      {survivalState.activePerks.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-lg justify-center mb-4">
          {survivalState.activePerks.map((perkId: string) => {
            const perk = PERKS.find(p => p.id === perkId);
            if (!perk) return null;
            const stacks = survivalState.perkStacks[perkId] || 1;
            const isEvolved = survivalState.evolvedPerks.includes(perkId);
            return (
              <div key={perkId} className={`px-2 py-1 text-xs font-bold tracking-wider ${isEvolved ? 'ring-1 ring-yellow-400' : ''}`} style={{ background: `${perk.color}30`, color: perk.color, border: `1px solid ${perk.color}50` }}>
                {isEvolved ? '★ ' : ''}{perk.name}{stacks > 1 ? ` x${stacks}` : ''}
              </div>
            );
          })}
        </div>
      )}

      {/* Evolutions */}
      {evolutions.length > 0 && (
        <div className="flex gap-2 mb-4">
          {evolutions.map(evo => (
            <div key={evo.perkId} className="px-3 py-1 text-xs font-black tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
              {evo.name}
            </div>
          ))}
        </div>
      )}

      {/* Run Timeline */}
      {survivalState.timeline.length > 0 && (
        <div className="max-w-md w-full mb-8 max-h-40 overflow-y-auto">
          <div className="text-[10px] font-black text-zinc-600 tracking-widest uppercase mb-2 text-center">Run Timeline</div>
          <div className="flex flex-col gap-1">
            {survivalState.timeline.slice(-10).map((entry: RunTimelineEntry, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
                <span className="text-zinc-500 font-bold">W{entry.wave}</span>
                <span className="font-bold" style={{ color: entry.color }}>{entry.event}</span>
                <span className="text-zinc-600">{entry.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta stats */}
      <div className="flex gap-6 mb-8 text-xs text-zinc-600 font-bold tracking-widest uppercase">
        <span>Best Wave: {meta.bestWave}</span>
        <span>Best Score: {meta.bestScore.toLocaleString()}</span>
        <span>Total Credits: {meta.credits.toLocaleString()}</span>
      </div>

      <div className="flex flex-col gap-4 items-center transform -skew-x-12">
        <button className="px-12 py-4 bg-white text-black text-2xl font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-[8px_8px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => handleClick(() => useGameStore.getState().startSurvival())} onMouseEnter={handleHover}>ONE MORE RUN</button>
        <button className="text-zinc-400 font-bold hover:text-white transition-colors cursor-pointer mt-4" onClick={() => handleClick(() => useGameStore.setState({ phase: 'main_menu', gameMode: 'campaign', survivalState: null }))} onMouseEnter={handleHover}>RETURN TO BASE</button>
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
  const [perkFlash, setPerkFlash] = useState<{ color: string; name: string } | null>(null);
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

  // Perk fanfare effect
  useEffect(() => {
    if (survivalState?.perkFanfare) {
      setPerkFlash({ color: survivalState.perkFanfare.color, name: survivalState.perkFanfare.name });
      const timer = setTimeout(() => setPerkFlash(null), 800);
      return () => clearTimeout(timer);
    }
  }, [survivalState?.perkFanfare?.time]);

  if (!survivalState) return null;

  const handleClick = (action: () => void) => { SFX.buttonClick(); action(); };
  const handleHover = () => { SFX.buttonHover(); };

  if (phase === 'survival_perk_select') {
    return <PerkSelection />;
  }

  if (phase === 'survival_game_over') {
    return <DeathScreen survivalState={survivalState} />;
  }

  const hasDualWeapons = player && player.secondaryWeapon !== null;
  const isPrimary = player?.activeWeaponSlot === 'primary';
  const isWaveIntro = phase === 'survival_wave_intro';
  const aliveEnemies = useGameStore.getState().enemies.filter(e => e.hp > 0).length;
  const killCombo = survivalState.killCombo;

  // Combo-based screen effects
  const comboIntensity = Math.min(killCombo / 30, 1);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-red-600/20 transition-opacity duration-75 pointer-events-none z-0 ${showDamageFlash ? 'opacity-100' : 'opacity-0'}`} />

      {/* Kill streak screen effects */}
      {killCombo >= 10 && (
        <div className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300" style={{
          boxShadow: `inset 0 0 ${60 + comboIntensity * 100}px rgba(236, 72, 153, ${comboIntensity * 0.3})`,
          background: killCombo >= 20 ? `radial-gradient(circle, transparent 50%, rgba(236, 72, 153, ${comboIntensity * 0.15}) 100%)` : 'none',
        }} />
      )}

      {/* Perk fanfare flash */}
      {perkFlash && (
        <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center animate-countdown" style={{ background: `${perkFlash.color}20` }}>
          <div className="text-4xl font-black italic tracking-tighter" style={{ color: perkFlash.color, textShadow: `0 0 30px ${perkFlash.color}` }}>
            {perkFlash.name}
          </div>
        </div>
      )}

      {/* Mutation weather effects */}
      {survivalState.mutations.includes('darkness') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />
      )}
      {survivalState.mutations.includes('berserker') && (
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle, transparent 60%, rgba(220, 38, 38, 0.15) 100%)' }} />
      )}
      {survivalState.mutations.includes('fast_forward') && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(34, 211, 238, 0.03) 40px, rgba(34, 211, 238, 0.03) 42px)' }} />
      )}

      {/* Wave intro overlay with boss entrance */}
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
          {/* Boss entrance */}
          {survivalState.bossActive && (
            <div className="mt-6" style={{ animation: 'boss-slam 0.8s ease-out forwards' }}>
              <div className="px-8 py-3 bg-red-950/90 border-2 border-red-600">
                <div className="text-[10px] font-black text-red-400 tracking-[0.3em] uppercase text-center">Boss Incoming</div>
                <div className="text-4xl font-black italic text-red-500 tracking-tighter text-center" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }}>
                  {survivalState.bossActive.name}
                </div>
              </div>
            </div>
          )}
          {survivalState.wave >= 5 && !survivalState.bossActive && (
            <div className="mt-3 text-sm font-bold text-zinc-400 tracking-widest uppercase animate-pulse">Arena expanding...</div>
          )}
          {survivalState.mutations.length > 0 && (
            <div className="mt-6 flex gap-3">
              {survivalState.mutations.map((m: string) => (
                <div key={m} className="px-3 py-1 text-sm font-black tracking-widest uppercase" style={{ background: `${getMutationColor(m as any)}30`, color: getMutationColor(m as any), border: `1px solid ${getMutationColor(m as any)}` }}>
                  {getMutationLabel(m as any)}
                </div>
              ))}
            </div>
          )}
          {/* Run modifiers display */}
          {survivalState.runModifiers.length > 0 && survivalState.wave <= 1 && (
            <div className="mt-4 flex gap-2">
              {survivalState.runModifiers.map((m: string) => (
                <div key={m} className="px-2 py-1 text-[10px] font-black tracking-widest uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                  {m.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Boss HP bar */}
      {survivalState.bossActive && phase === 'survival_playing' && (() => {
        const boss = useGameStore.getState().enemies.find(e => e.isBoss && e.hp > 0);
        if (!boss) return null;
        return (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-96">
            <div className="text-center mb-1">
              <span className="text-[10px] font-black text-red-400 tracking-[0.3em] uppercase">Boss</span>
              <div className="text-lg font-black italic text-red-500">{boss.bossName || 'BOSS'}</div>
            </div>
            <div className="w-full h-3 bg-zinc-900 border border-red-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-200" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} />
              {boss.shieldHp !== undefined && boss.shieldMaxHp && boss.shieldHp > 0 && (
                <div className="absolute top-0 left-0 h-full bg-blue-400/50 transition-all duration-200" style={{ width: `${(boss.shieldHp / boss.shieldMaxHp) * 100}%` }} />
              )}
            </div>
          </div>
        );
      })()}

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
              {survivalState.scoreMultiplier > 1 && (
                <div className="text-[8px] font-bold text-yellow-600">x{survivalState.scoreMultiplier.toFixed(1)}</div>
              )}
            </div>
            <div className="bg-zinc-950/80 p-2.5 transform -skew-x-12 border-l-4 border-red-600 shadow-2xl backdrop-blur-sm">
              <div className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">Hostiles</div>
              <div className="text-xl font-black italic text-red-400 tracking-tighter">{aliveEnemies}</div>
            </div>
          </div>

          {killCombo >= 3 && (
            <div className={`bg-zinc-950/80 p-2 transform -skew-x-12 border-l-4 shadow-2xl backdrop-blur-sm ${killCombo >= 10 ? 'border-pink-400' : 'border-pink-500'} ${killCombo >= 10 ? 'animate-pulse' : ''}`}>
              <div className={`font-black italic tracking-tighter ${killCombo >= 20 ? 'text-2xl text-pink-300' : killCombo >= 10 ? 'text-xl text-pink-400' : 'text-lg text-pink-400'}`}>
                {killCombo}x COMBO{killCombo >= 20 ? '!!' : killCombo >= 10 ? '!' : ''}
              </div>
            </div>
          )}

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
        <div className="flex flex-col gap-1.5">
          {survivalState.mutations.length > 0 && (
            <div className="flex gap-1">
              {survivalState.mutations.map((m: string) => (
                <div key={m} className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase" style={{ background: `${getMutationColor(m as any)}20`, color: getMutationColor(m as any) }}>
                  {getMutationLabel(m as any)}
                </div>
              ))}
            </div>
          )}
          {/* Run modifiers */}
          {survivalState.runModifiers.length > 0 && (
            <div className="flex gap-1">
              {survivalState.runModifiers.map((m: string) => (
                <div key={m} className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase bg-yellow-500/10 text-yellow-500">
                  {m.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1 max-w-sm">
            {survivalState.activePerks.map((perkId: string) => {
              const perk = PERKS.find(p => p.id === perkId);
              if (!perk) return null;
              const stacks = survivalState.perkStacks[perkId] || 1;
              const isEvolved = survivalState.evolvedPerks.includes(perkId);
              return (
                <div key={perkId} className={`w-7 h-7 flex items-center justify-center relative ${isEvolved ? 'ring-1 ring-yellow-400' : ''}`} style={{ background: `${perk.color}25`, border: `1px solid ${perk.color}50` }} title={`${perk.name}${stacks > 1 ? ` x${stacks}` : ''}${isEvolved ? ' (EVOLVED)' : ''}`}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: perk.color, boxShadow: `0 0 4px ${perk.color}` }} />
                  {stacks > 1 && <span className="absolute -top-1 -right-1 text-[7px] font-black text-white bg-zinc-900 px-0.5">{stacks}</span>}
                  {isEvolved && <span className="absolute -bottom-1 -right-1 text-[6px] text-yellow-400">★</span>}
                </div>
              );
            })}
          </div>
        </div>

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
                  <div key={ability.name} className="bg-zinc-950/80 p-2.5 transform -skew-x-12 backdrop-blur-sm w-28" style={{ border: ready ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-zinc-400 tracking-widest uppercase">{ability.name}</span>
                      <span className="text-[10px] font-bold text-yellow-400 bg-zinc-800 px-1.5 py-0.5">{ability.key}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 mt-1.5 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full transition-all duration-100 ${ready ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-600'}`} style={{ width: `${progress}%` }} />
                    </div>
                    {ready && <div className="text-[8px] font-bold text-green-400 mt-1 text-center tracking-widest">READY</div>}
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
