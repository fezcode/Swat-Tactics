import type { Weapon } from '../types';

export type SurvivalEnemyType = 'grunt' | 'rusher' | 'sniper' | 'tank' | 'bomber' | 'ghost' | 'splitter';
export type SpawnPattern = 'surround' | 'north_rush' | 'pincer' | 'corners' | 'spiral' | 'rain';
export type WaveMutation = 'fast_forward' | 'armored' | 'vengeful' | 'darkness' | 'berserker';

export interface SurvivalEnemyDef {
  type: SurvivalEnemyType;
  hp: number;
  speed: number;
  damage: number;
  color: string;
  weapon: Weapon;
  scale?: number;
  transparent?: boolean;
  explodesOnDeath?: boolean;
  splitsOnDeath?: boolean;
}

export interface BossConfig {
  id: string;
  name: string;
  hp: number;
  damage: number;
  color: string;
  speed: number;
  weapon: Weapon;
  mechanic: 'warden' | 'phantom' | 'hive' | 'colossus' | 'generic';
}

export interface WaveConfig {
  enemies: { def: SurvivalEnemyDef; count: number }[];
  spawnPattern: SpawnPattern;
  boss: BossConfig | null;
  spawnDelay: number;
}

const ENEMY_COLORS: Record<SurvivalEnemyType, string> = {
  grunt: '#fcd34d',
  rusher: '#ea580c',
  sniper: '#7c3aed',
  tank: '#b91c1c',
  bomber: '#f59e0b',
  ghost: '#94a3b8',
  splitter: '#10b981',
};

const SPAWN_PATTERNS: SpawnPattern[] = ['surround', 'north_rush', 'pincer', 'corners', 'spiral', 'rain'];

function makeWeapon(type: SurvivalEnemyType, wave: number): Weapon {
  const baseDamage = 5 + Math.floor(wave / 3);
  switch (type) {
    case 'grunt': return { name: 'Pistol', ammo: 999, maxAmmo: 999, damage: baseDamage };
    case 'rusher': return { name: 'Knife', ammo: 999, maxAmmo: 999, damage: baseDamage + 5 };
    case 'sniper': return { name: 'Rifle', ammo: 999, maxAmmo: 999, damage: baseDamage + 10 };
    case 'tank': return { name: 'Shotgun', ammo: 999, maxAmmo: 999, damage: baseDamage + 3 };
    case 'bomber': return { name: 'Bomb', ammo: 999, maxAmmo: 999, damage: baseDamage };
    case 'ghost': return { name: 'Pistol', ammo: 999, maxAmmo: 999, damage: baseDamage + 2 };
    case 'splitter': return { name: 'Pistol', ammo: 999, maxAmmo: 999, damage: Math.floor(baseDamage * 0.6) };
  }
}

function getUnlockedTypes(wave: number): SurvivalEnemyType[] {
  const types: SurvivalEnemyType[] = ['grunt'];
  if (wave >= 3) types.push('rusher');
  if (wave >= 5) types.push('sniper');
  if (wave >= 7) types.push('tank');
  if (wave >= 10) types.push('bomber');
  if (wave >= 15) types.push('ghost');
  if (wave >= 20) types.push('splitter');
  return types;
}

const BOSSES: BossConfig[] = [
  { id: 'boss_warden', name: 'THE WARDEN', hp: 500, damage: 20, color: '#991b1b', speed: 2.5, weapon: { name: 'Chaingun', ammo: 999, maxAmmo: 999, damage: 8 }, mechanic: 'warden' },
  { id: 'boss_phantom', name: 'PHANTOM BLADE', hp: 350, damage: 35, color: '#4c1d95', speed: 5.0, weapon: { name: 'Sword', ammo: 999, maxAmmo: 999, damage: 25 }, mechanic: 'phantom' },
  { id: 'boss_hive', name: 'THE HIVE', hp: 800, damage: 10, color: '#064e3b', speed: 1.5, weapon: { name: 'Pistol', ammo: 999, maxAmmo: 999, damage: 10 }, mechanic: 'hive' },
  { id: 'boss_colossus', name: 'IRON COLOSSUS', hp: 1200, damage: 15, color: '#44403c', speed: 1.0, weapon: { name: 'Cannon', ammo: 999, maxAmmo: 999, damage: 30 }, mechanic: 'colossus' },
];

export function generateWave(wave: number, mutations: WaveMutation[]): WaveConfig {
  const isBossWave = wave % 5 === 0 && wave > 0;
  const baseCount = 3 + Math.floor(wave * 1.4);
  const baseHp = 30 + wave * 5;
  const types = getUnlockedTypes(wave);
  const spawnDelay = Math.max(0.08, 1.5 - wave * 0.04);

  const hpMult = mutations.includes('armored') ? 1.3 : 1.0;
  const speedMult = mutations.includes('fast_forward') ? 1.2 : 1.0;

  const enemies: { def: SurvivalEnemyDef; count: number }[] = [];

  // Distribute enemies among unlocked types
  const mainType = types[Math.floor(Math.random() * types.length)];
  const secondaryType = types.length > 1 ? types.filter(t => t !== mainType)[Math.floor(Math.random() * (types.length - 1))] : mainType;

  const mainCount = Math.ceil(baseCount * 0.6);
  const secondaryCount = baseCount - mainCount;

  const makeDef = (type: SurvivalEnemyType): SurvivalEnemyDef => {
    let hp = baseHp;
    let speed = 3.0;
    let scale = 1.0;
    switch (type) {
      case 'rusher': hp = baseHp * 0.5; speed = 5.5; break;
      case 'sniper': hp = baseHp * 0.7; speed = 1.5; break;
      case 'tank': hp = baseHp * 3; speed = 1.8; scale = 1.4; break;
      case 'bomber': hp = baseHp * 0.6; speed = 4.0; break;
      case 'ghost': hp = baseHp * 0.8; speed = 3.5; break;
      case 'splitter': hp = baseHp * 0.4; speed = 3.0; scale = 0.8; break;
    }
    return {
      type,
      hp: Math.floor(hp * hpMult),
      speed: speed * speedMult,
      damage: makeWeapon(type, wave).damage,
      color: ENEMY_COLORS[type],
      weapon: makeWeapon(type, wave),
      scale,
      transparent: type === 'ghost',
      explodesOnDeath: type === 'bomber',
      splitsOnDeath: type === 'splitter',
    };
  };

  enemies.push({ def: makeDef(mainType), count: mainCount });
  if (secondaryCount > 0) enemies.push({ def: makeDef(secondaryType), count: secondaryCount });

  let boss: BossConfig | null = null;
  if (isBossWave) {
    const bossIndex = (Math.floor(wave / 5) - 1) % BOSSES.length;
    const baseBoss = BOSSES[bossIndex];
    const bossScaling = 1 + Math.floor(wave / 20) * 0.5;
    boss = {
      ...baseBoss,
      id: `${baseBoss.id}_w${wave}`,
      hp: Math.floor(baseBoss.hp * bossScaling * hpMult),
      damage: Math.floor(baseBoss.damage * bossScaling),
      speed: baseBoss.speed * speedMult,
    };
  }

  const pattern = SPAWN_PATTERNS[Math.floor(Math.random() * SPAWN_PATTERNS.length)];

  return { enemies, spawnPattern: pattern, boss, spawnDelay };
}

export function getSpawnPosition(pattern: SpawnPattern, index: number, total: number, arenaSize: number): { x: number; z: number } {
  const margin = 1;
  const w = arenaSize;
  const h = arenaSize;

  switch (pattern) {
    case 'surround': {
      const perimeter = (w + h) * 2;
      const pos = ((index / total) * perimeter) % perimeter;
      if (pos < w) return { x: pos, z: margin };
      if (pos < w + h) return { x: w - margin, z: pos - w };
      if (pos < w * 2 + h) return { x: w - (pos - w - h), z: h - margin };
      return { x: margin, z: h - (pos - w * 2 - h) };
    }
    case 'north_rush':
      return { x: margin + (index / total) * (w - margin * 2), z: margin };
    case 'pincer': {
      if (index % 2 === 0) return { x: margin, z: margin + (index / total) * (h - margin * 2) };
      return { x: w - margin, z: margin + (index / total) * (h - margin * 2) };
    }
    case 'corners': {
      const corner = index % 4;
      const jitter = Math.random() * 2;
      if (corner === 0) return { x: margin + jitter, z: margin + jitter };
      if (corner === 1) return { x: w - margin - jitter, z: margin + jitter };
      if (corner === 2) return { x: margin + jitter, z: h - margin - jitter };
      return { x: w - margin - jitter, z: h - margin - jitter };
    }
    case 'spiral': {
      const angle = (index / total) * Math.PI * 4;
      const cx = w / 2;
      const cz = h / 2;
      const r = Math.min(w, h) / 2 - margin;
      return { x: cx + Math.cos(angle) * r, z: cz + Math.sin(angle) * r };
    }
    case 'rain':
      return { x: margin + Math.random() * (w - margin * 2), z: margin + Math.random() * 2 };
  }
}

export function getMutationsForWave(wave: number): WaveMutation[] {
  const mutations: WaveMutation[] = [];
  if (wave >= 10) mutations.push('fast_forward');
  if (wave >= 20) mutations.push('armored');
  if (wave >= 30) mutations.push('vengeful');
  if (wave >= 40) mutations.push('darkness');
  if (wave >= 50) mutations.push('berserker');
  return mutations;
}

export function getMutationLabel(m: WaveMutation): string {
  switch (m) {
    case 'fast_forward': return 'ACCELERATED';
    case 'armored': return 'ARMORED';
    case 'vengeful': return 'VENGEFUL';
    case 'darkness': return 'DARKNESS';
    case 'berserker': return 'BERSERKER';
  }
}

export function getMutationColor(m: WaveMutation): string {
  switch (m) {
    case 'fast_forward': return '#22d3ee';
    case 'armored': return '#94a3b8';
    case 'vengeful': return '#f97316';
    case 'darkness': return '#6b21a8';
    case 'berserker': return '#dc2626';
  }
}
