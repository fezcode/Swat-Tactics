export type PerkId =
  | 'iron_skin' | 'rapid_fire' | 'extended_mag' | 'swift_feet'
  | 'scavenger' | 'combat_regen' | 'hollow_points'
  | 'ricochet' | 'explosive_rounds' | 'dodge_master' | 'blade_storm'
  | 'magnetism' | 'dual_wield' | 'adrenaline'
  | 'orbital_strike' | 'shadow_clone' | 'death_aura' | 'time_warp'
  | 'phoenix' | 'bullet_hell'
  | 'chain_lightning' | 'frost_nova' | 'critical_strike'
  | 'black_hole' | 'meteor_shower' | 'lucky_drops';

export type PerkTier = 1 | 2 | 3;

export interface PerkDef {
  id: PerkId;
  name: string;
  description: string;
  tier: PerkTier;
  color: string;
  stackable: boolean;
  maxStacks?: number;
  evolveName?: string;
  evolveDescription?: string;
  evolveAt?: number;
}

// Weapon evolution recipes: combine specific perks to unlock super weapons
export interface WeaponEvolution {
  id: string;
  name: string;
  description: string;
  requires: PerkId[];
  color: string;
}

export const WEAPON_EVOLUTIONS: WeaponEvolution[] = [
  { id: 'thunder_cannon', name: 'THUNDER CANNON', description: 'Bullets chain lightning to 3 nearby enemies', requires: ['chain_lightning', 'hollow_points'], color: '#60a5fa' },
  { id: 'frozen_death', name: 'FROZEN DEATH', description: 'Frost nova triggers on every 5th kill', requires: ['frost_nova', 'death_aura'], color: '#67e8f9' },
  { id: 'lucky_hellfire', name: 'LUCKY HELLFIRE', description: 'Crits cause massive explosions', requires: ['critical_strike', 'explosive_rounds'], color: '#f97316' },
  { id: 'void_reaper', name: 'VOID REAPER', description: 'Black hole pulls enemies then detonates', requires: ['black_hole', 'bullet_hell'], color: '#a855f7' },
  { id: 'galaxy_brain', name: 'GALAXY BRAIN', description: 'Orbital strikes rain down continuously', requires: ['meteor_shower', 'orbital_strike'], color: '#fbbf24' },
];

export function getUnlockedWeaponEvolutions(ownedPerks: PerkId[]): WeaponEvolution[] {
  return WEAPON_EVOLUTIONS.filter(we => we.requires.every(r => ownedPerks.includes(r)));
}

export const PERKS: PerkDef[] = [
  // TIER 1
  { id: 'iron_skin', name: 'IRON SKIN', description: '+25 Max HP & full heal', tier: 1, color: '#94a3b8', stackable: true, evolveName: 'TITANIUM PLATING', evolveDescription: '+50% damage reduction', evolveAt: 5 },
  { id: 'rapid_fire', name: 'RAPID FIRE', description: '-20% fire interval', tier: 1, color: '#f59e0b', stackable: true, maxStacks: 3, evolveName: 'MINIGUN MODE', evolveDescription: 'No fire interval cap', evolveAt: 3 },
  { id: 'extended_mag', name: 'EXTENDED MAG', description: '+50% max ammo', tier: 1, color: '#3b82f6', stackable: true, evolveName: 'BOTTOMLESS MAG', evolveDescription: 'Infinite ammo', evolveAt: 4 },
  { id: 'swift_feet', name: 'SWIFT FEET', description: '+15% movement speed', tier: 1, color: '#22c55e', stackable: true, maxStacks: 3, evolveName: 'SONIC RUSH', evolveDescription: 'Leave damaging trail', evolveAt: 3 },
  { id: 'scavenger', name: 'SCAVENGER', description: 'Pickups give 50% more', tier: 1, color: '#a855f7', stackable: true, evolveName: 'HOARDER', evolveDescription: 'Enemies drop pickups', evolveAt: 4 },
  { id: 'combat_regen', name: 'COMBAT REGEN', description: 'Regenerate 2 HP/sec', tier: 1, color: '#ef4444', stackable: true, evolveName: 'VAMPIRIC', evolveDescription: 'Heal 5% of damage dealt', evolveAt: 5 },
  { id: 'hollow_points', name: 'HOLLOW POINTS', description: '+25% bullet damage', tier: 1, color: '#dc2626', stackable: true, evolveName: 'ARMOR PIERCING', evolveDescription: 'Bullets pierce enemies', evolveAt: 5 },

  // TIER 2
  { id: 'ricochet', name: 'RICOCHET', description: 'Bullets bounce off arena edges', tier: 2, color: '#06b6d4', stackable: false },
  { id: 'explosive_rounds', name: 'EXPLOSIVE ROUNDS', description: 'Bullets explode on impact', tier: 2, color: '#f97316', stackable: false },
  { id: 'dodge_master', name: 'DODGE MASTER', description: 'Dodge cooldown -50%, range +50%', tier: 2, color: '#e2e8f0', stackable: false },
  { id: 'blade_storm', name: 'BLADE STORM', description: 'Slash cooldown -60%, damage x2', tier: 2, color: '#f472b6', stackable: false },
  { id: 'magnetism', name: 'MAGNETISM', description: 'Pickup radius doubled', tier: 2, color: '#8b5cf6', stackable: true },
  { id: 'dual_wield', name: 'DUAL WIELD', description: 'Unlock SMG secondary weapon', tier: 2, color: '#10b981', stackable: false },
  { id: 'adrenaline', name: 'ADRENALINE', description: 'Below 30% HP: +50% fire rate & speed', tier: 2, color: '#ef4444', stackable: false },

  // TIER 3
  { id: 'orbital_strike', name: 'ORBITAL STRIKE', description: 'Massive explosion every 25 seconds', tier: 3, color: '#fbbf24', stackable: false },
  { id: 'shadow_clone', name: 'SHADOW CLONE', description: 'AI companion fights alongside you', tier: 3, color: '#6366f1', stackable: false },
  { id: 'death_aura', name: 'DEATH AURA', description: 'Nearby enemies take 8 DPS', tier: 3, color: '#dc2626', stackable: true },
  { id: 'time_warp', name: 'TIME WARP', description: '25% chance on kill to slow all enemies', tier: 3, color: '#14b8a6', stackable: false },
  { id: 'phoenix', name: 'PHOENIX', description: 'Revive once with 50% HP + explosion', tier: 3, color: '#f97316', stackable: false },
  { id: 'bullet_hell', name: 'BULLET HELL', description: 'Fire 3 bullets in a spread', tier: 3, color: '#ec4899', stackable: false },

  // NEW PERKS
  { id: 'critical_strike', name: 'CRITICAL STRIKE', description: '15% chance for 3x damage hit', tier: 1, color: '#f43f5e', stackable: true, maxStacks: 4, evolveName: 'ASSASSIN', evolveDescription: '30% crit chance, 5x damage', evolveAt: 4 },
  { id: 'lucky_drops', name: 'LUCKY DROPS', description: '+20% chance for bonus drops', tier: 1, color: '#a3e635', stackable: true, maxStacks: 3, evolveName: 'JACKPOT', evolveDescription: 'Enemies explode into treasure', evolveAt: 3 },
  { id: 'chain_lightning', name: 'CHAIN LIGHTNING', description: 'Kills arc lightning to 2 nearby enemies', tier: 2, color: '#38bdf8', stackable: true, maxStacks: 3 },
  { id: 'frost_nova', name: 'FROST NOVA', description: 'Kills freeze nearby enemies for 2s', tier: 2, color: '#67e8f9', stackable: false },
  { id: 'black_hole', name: 'BLACK HOLE', description: 'Every 20s, pull all enemies toward a point then explode', tier: 3, color: '#7c3aed', stackable: false },
  { id: 'meteor_shower', name: 'METEOR SHOWER', description: '3 random meteors every 15s dealing 60 damage each', tier: 3, color: '#fb923c', stackable: false },
];

export interface PerkEvolution {
  perkId: PerkId;
  name: string;
  description: string;
}

export function getEvolution(perkId: PerkId, stacks: number): PerkEvolution | null {
  const perk = PERKS.find(p => p.id === perkId);
  if (!perk || !perk.evolveAt || !perk.evolveName || stacks < perk.evolveAt) return null;
  return { perkId, name: perk.evolveName, description: perk.evolveDescription || '' };
}

export function getActiveEvolutions(perkStacks: Record<string, number>): PerkEvolution[] {
  const evolutions: PerkEvolution[] = [];
  for (const [id, stacks] of Object.entries(perkStacks)) {
    const evo = getEvolution(id as PerkId, stacks);
    if (evo) evolutions.push(evo);
  }
  return evolutions;
}

export function getAvailablePerks(wave: number, ownedPerks: PerkId[], perkStacks: Record<string, number>): PerkDef[] {
  const maxTier: PerkTier = wave >= 20 ? 3 : wave >= 10 ? 2 : 1;
  return PERKS.filter(p => {
    if (p.tier > maxTier) return false;
    if (!p.stackable && ownedPerks.includes(p.id)) return false;
    if (p.stackable && p.maxStacks && (perkStacks[p.id] || 0) >= p.maxStacks) return false;
    if (p.id === 'phoenix' && ownedPerks.includes('phoenix')) return false;
    return true;
  });
}

export function pickRandomPerks(wave: number, ownedPerks: PerkId[], perkStacks: Record<string, number>, count: number = 3): PerkDef[] {
  const available = getAvailablePerks(wave, ownedPerks, perkStacks);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getTierLabel(tier: PerkTier): string {
  return tier === 1 ? 'STANDARD' : tier === 2 ? 'ADVANCED' : 'LEGENDARY';
}

export function getTierBorderColor(tier: PerkTier): string {
  return tier === 1 ? '#94a3b8' : tier === 2 ? '#a855f7' : '#fbbf24';
}
