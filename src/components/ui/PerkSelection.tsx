import { useState } from 'react';
import { useGameStore } from '../../game/store';
import { PERKS, getTierLabel, getTierBorderColor, getEvolution, WEAPON_EVOLUTIONS } from '../../game/survivalPerks';
import type { PerkId } from '../../game/survivalPerks';
import { SFX } from '../../game/sounds';

export function PerkSelection() {
  const survivalState = useGameStore(s => s.survivalState);
  const selectPerk = useGameStore(s => s.selectPerk);
  const rerollPerks = useGameStore(s => s.rerollPerks);
  const [hoveredPerk, setHoveredPerk] = useState<PerkId | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<PerkId | null>(null);

  if (!survivalState) return null;

  const offeredPerks = survivalState.offeredPerks
    .map(id => PERKS.find(p => p.id === id))
    .filter(Boolean) as typeof PERKS[number][];

  const handleSelect = (perkId: PerkId) => {
    if (selectedPerk) return;
    SFX.buttonClick();
    setSelectedPerk(perkId);
    setTimeout(() => {
      selectPerk(perkId);
      setSelectedPerk(null);
    }, 600);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Wave complete header */}
        <div className="mb-4 transform -skew-x-12">
          <h2 className="text-5xl font-black italic text-white tracking-tighter neon-text">
            WAVE {survivalState.wave} CLEARED
          </h2>
        </div>

        <div className="mb-10 transform -skew-x-12">
          <p className="text-xl font-bold text-zinc-400 tracking-widest uppercase">Select an upgrade</p>
        </div>

        {/* Perk cards */}
        <div className="flex gap-6 items-stretch">
          {offeredPerks.map((perk) => {
            const isHovered = hoveredPerk === perk.id;
            const isSelected = selectedPerk === perk.id;
            const isOther = selectedPerk !== null && selectedPerk !== perk.id;
            const tierColor = getTierBorderColor(perk.tier);
            const stacks = survivalState.perkStacks[perk.id] || 0;

            return (
              <button
                key={perk.id}
                onMouseEnter={() => { setHoveredPerk(perk.id); SFX.buttonHover(); }}
                onMouseLeave={() => setHoveredPerk(null)}
                onClick={() => handleSelect(perk.id)}
                className={`relative flex flex-col items-center p-6 w-56 cursor-pointer transition-all duration-300 transform
                  ${isSelected ? 'scale-110 -translate-y-4' : isOther ? 'scale-75 opacity-20 blur-sm' : isHovered ? 'scale-105 -translate-y-2' : 'scale-100'}
                `}
                style={{
                  background: `linear-gradient(180deg, ${perk.color}15 0%, #0a0a0a 100%)`,
                  border: `2px solid ${isHovered || isSelected ? perk.color : tierColor}`,
                  boxShadow: isHovered || isSelected
                    ? `0 0 30px ${perk.color}60, 0 0 60px ${perk.color}30, inset 0 0 30px ${perk.color}10`
                    : `0 0 10px ${tierColor}20`,
                }}
              >
                {/* Tier badge */}
                <div
                  className="absolute -top-3 px-3 py-0.5 text-[10px] font-black tracking-widest uppercase"
                  style={{ background: tierColor, color: '#000' }}
                >
                  {getTierLabel(perk.tier)}
                </div>

                {/* Perk icon glow */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mt-2"
                  style={{
                    background: `radial-gradient(circle, ${perk.color}40 0%, transparent 70%)`,
                    boxShadow: `0 0 20px ${perk.color}40`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{
                      background: perk.color,
                      boxShadow: `0 0 15px ${perk.color}`,
                    }}
                  />
                </div>

                {/* Perk name */}
                <h3
                  className="text-lg font-black italic tracking-tight mb-2"
                  style={{ color: perk.color }}
                >
                  {perk.name}
                </h3>

                {/* Stacks indicator */}
                {stacks > 0 && (
                  <div className="text-xs font-bold text-zinc-500 mb-1">
                    Level {stacks} → {stacks + 1}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-zinc-400 text-center leading-tight">
                  {perk.description}
                </p>

                {/* Evolution progress */}
                {perk.stackable && perk.evolveAt && (() => {
                  const nextStacks = stacks + 1;
                  const willEvolve = nextStacks >= perk.evolveAt;
                  const evo = getEvolution(perk.id, nextStacks);
                  return (
                    <div className="mt-3 w-full">
                      {willEvolve && evo ? (
                        <div className="text-center animate-pulse">
                          <div className="text-[10px] font-black text-yellow-400 tracking-widest">EVOLVES INTO</div>
                          <div className="text-xs font-black text-yellow-300">{evo.name}</div>
                          <div className="text-[10px] text-yellow-400/70">{evo.description}</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">
                            {stacks + 1}/{perk.evolveAt} to evolve
                          </div>
                          {perk.evolveName && (
                            <div className="text-[10px] text-zinc-700 mt-0.5">{perk.evolveName}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* Stackable indicator (non-evolvable) */}
                {perk.stackable && !perk.evolveAt && (
                  <div className="mt-3 text-[10px] font-bold text-zinc-600 tracking-widest uppercase">
                    Stackable
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Reroll button */}
        {survivalState.rerollsLeft > 0 && !selectedPerk && (
          <button
            onClick={() => rerollPerks()}
            className="mt-6 px-6 py-2 border-2 border-zinc-600 text-zinc-300 font-black tracking-widest uppercase
              hover:border-yellow-400 hover:text-yellow-400 transition-all duration-200 hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onMouseEnter={() => SFX.buttonHover()}
          >
            REROLL ({survivalState.rerollsLeft} left)
          </button>
        )}

        {/* Weapon evolutions display */}
        {survivalState.weaponEvolutions.length > 0 && (
          <div className="mt-4 flex gap-3">
            {survivalState.weaponEvolutions.map(weId => {
              const we = WEAPON_EVOLUTIONS.find(w => w.id === weId);
              if (!we) return null;
              return (
                <div key={weId} className="px-3 py-1 text-[10px] font-black tracking-widest uppercase"
                  style={{ background: `${we.color}30`, border: `1px solid ${we.color}`, color: we.color }}>
                  {we.name}
                </div>
              );
            })}
          </div>
        )}

        {/* Score display */}
        <div className="mt-6 transform -skew-x-12 flex gap-8">
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Score</div>
            <div className="text-3xl font-black italic text-white">{survivalState.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-500 tracking-widest uppercase">Perks</div>
            <div className="text-3xl font-black italic text-purple-400">{survivalState.activePerks.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
