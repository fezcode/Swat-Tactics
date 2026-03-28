import { create } from 'zustand';
import type { PlayerState, EnemyState, BarrelState, GamePhase, GameMode, Position, Weapon, Particle, ProjectileState, HealthBoxState, AmmoBoxState, LevelTheme, DecorationState, PortalState, TurretState, ButtonState, XPOrbState, FloatingText, BloodDecal } from '../types';
import { LEVELS } from './levels';
import { SFX, Music } from './sounds';
import type { PerkId } from './survivalPerks';
import { positionCache } from './positionCache';

// --- LocalStorage persistence for settings ---
const SETTINGS_KEY = 'swat-tactics-settings';
interface SavedSettings {
  isMuted: boolean;
  musicVolume: number;
  crtEnabled: boolean;
  showWireframe: boolean;
  renderQuality: 'low' | 'medium' | 'high';
}
const defaultSettings: SavedSettings = { isMuted: false, musicVolume: 0.4, crtEnabled: true, showWireframe: false, renderQuality: 'high' };
function loadSettings(): SavedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSettings };
}
function saveSettings(s: Partial<SavedSettings>) {
  try {
    const current = loadSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...s }));
  } catch {}
}

// Helper to get enemy position from cache, falling back to store
function getEnemyPos(e: EnemyState): Position {
  return positionCache.get(e.id) || e.pos;
}
function getPlayerPos(state: { player: PlayerState | null }): Position {
  if (!state.player) return { x: 0, z: 0 };
  return positionCache.get('player') || state.player.pos;
}
import { pickRandomPerks, getEvolution, PERKS } from './survivalPerks';
import type { WaveMutation, SurvivalEnemyDef } from './survivalWaves';
import { generateWave, getSpawnPosition, getMutationsForWave } from './survivalWaves';

interface ExplosionEffect { id: string; pos: Position; radius: number; life: number; }
interface GameStats { kills: number; deaths: number; runs: number; }

interface SpawnQueueItem {
  def: SurvivalEnemyDef;
  spawnPos: Position;
}

// --- Meta-progression persistence ---
const META_KEY = 'swat-tactics-meta';
interface MetaProgression {
  credits: number;
  bestWave: number;
  bestScore: number;
  totalKills: number;
  totalRuns: number;
  unlocks: string[]; // unlocked features
}
const defaultMeta: MetaProgression = { credits: 0, bestWave: 0, bestScore: 0, totalKills: 0, totalRuns: 0, unlocks: [] };
function loadMeta(): MetaProgression {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return { ...defaultMeta, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultMeta };
}
function saveMeta(m: Partial<MetaProgression>) {
  try {
    const current = loadMeta();
    localStorage.setItem(META_KEY, JSON.stringify({ ...current, ...m }));
  } catch {}
}

export type RunModifier = 'double_enemies' | 'no_pickups' | 'glass_cannon' | 'fast_start' | 'elite_only';
interface RunModifierDef { id: RunModifier; name: string; description: string; scoreMultiplier: number; }
export const RUN_MODIFIERS: RunModifierDef[] = [
  { id: 'double_enemies', name: 'HORDE MODE', description: '2x enemy count', scoreMultiplier: 1.5 },
  { id: 'no_pickups', name: 'SCARCITY', description: 'No health/ammo drops', scoreMultiplier: 1.3 },
  { id: 'glass_cannon', name: 'GLASS CANNON', description: '50 HP max, 2x damage', scoreMultiplier: 1.4 },
  { id: 'fast_start', name: 'FAST START', description: 'Start at wave 5', scoreMultiplier: 0.8 },
  { id: 'elite_only', name: 'ELITE FORCES', description: 'All enemies are elite', scoreMultiplier: 2.0 },
];

export interface RunTimelineEntry {
  wave: number;
  event: string;
  detail: string;
  color: string;
  timestamp: number;
}

export interface SurvivalState {
  wave: number;
  score: number;
  killCombo: number;
  comboTimer: number;
  xpOrbs: XPOrbState[];
  floatingTexts: FloatingText[];
  activePerks: PerkId[];
  perkStacks: Record<string, number>;
  offeredPerks: PerkId[];
  waveEnemiesRemaining: number;
  waveEnemiesTotal: number;
  mutations: WaveMutation[];
  arenaSize: number;
  ammoRegenTimer: number;
  orbitalStrikeTimer: number;
  hasPhoenix: boolean;
  phoenixUsed: boolean;
  highScore: number;
  spawnQueue: SpawnQueueItem[];
  spawnTimer: number;
  spawnDelay: number;
  waveIntroTimer: number;
  clonePos: Position | null;
  cloneRotation: number;
  cloneLastFireTime: number;
  timeWarpTimer: number;
  waveStartTime: number;
  regenAccumulator: number;
  runModifiers: RunModifier[];
  scoreMultiplier: number;
  timeline: RunTimelineEntry[];
  perkFanfare: { color: string; name: string; time: number } | null;
  bossActive: { name: string; id: string } | null;
  evolvedPerks: string[];
}

interface GameState {
  phase: GamePhase;
  gameMode: GameMode;
  levelIndex: number;
  theme: LevelTheme;
  player: PlayerState | null;
  enemies: EnemyState[];
  turrets: TurretState[];
  buttons: ButtonState[];
  barrels: BarrelState[];
  healthBoxes: HealthBoxState[];
  ammoBoxes: AmmoBoxState[];
  portal: PortalState | null;
  walls: Position[];
  decorations: DecorationState[];
  gridSize: { width: number; height: number };
  exitPos: Position | null;
  particles: Particle[];
  bloodDecals: BloodDecal[];
  projectiles: ProjectileState[];
  explosions: ExplosionEffect[];
  isMuted: boolean;
  musicVolume: number;
  crtEnabled: boolean;
  showWireframe: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  countdown: number | null;
  timeLeft: number | null;
  lastDamageTime: number;
  lastShakeTime: number;
  trainActive: boolean;
  hasTrain: boolean;
  isSlashZooming: boolean;
  isDodging: boolean;
  timeScale: number;
  currentTrackName: string;
  fps: number;
  stats: GameStats;
  survivalState: SurvivalState | null;
  meta: MetaProgression;
  setPhase: (phase: GamePhase) => void;
  loadLevel: (index: number) => void;
  setMuted: (muted: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setCrtEnabled: (enabled: boolean) => void;
  setShowWireframe: (enabled: boolean) => void;
  setRenderQuality: (quality: 'low' | 'medium' | 'high') => void;
  resetStats: () => void;
  setTrainActive: (active: boolean) => void;
  triggerShake: () => void;
  damageEntity: (id: string, amount: number, pos?: Position) => void;
  collectHealth: (id: string) => void;
  collectAmmo: (id: string) => void;
  toggleButton: (id: string, active: boolean) => void;
  usePortal: () => void;
  playerShoot: (spawnPos: Position, direction: Position) => void;
  enemyShoot: (spawnPos: Position, direction: Position, damage: number) => void;
  addProjectile: (proj: Omit<ProjectileState, 'id'>) => void;
  removeProjectile: (id: string) => void;
  addParticle: (pos: [number, number, number], color: string, count?: number) => void;
  addBloodDecal: (pos: Position) => void;
  tick: (dt: number) => void;
  restartGame: () => void;
  togglePause: () => void;
  updateTurretFireTime: (id: string) => void;
  switchWeapon: () => void;
  dodge: (direction: Position) => void;
  slash: () => void;
  setCurrentTrackName: (name: string) => void;
  setFps: (fps: number) => void;
  startSurvival: () => void;
  startSurvivalWave: () => void;
  selectPerk: (perkId: PerkId) => void;
  survivalTick: (dt: number) => void;
  addXPOrb: (pos: Position, value: number) => void;
  addFloatingText: (text: string, pos: Position, color: string) => void;
  startSurvivalWithModifiers: (modifiers: RunModifier[]) => void;
}

const defaultWeapon: Weapon = { name: 'Pistol', ammo: 24, maxAmmo: 24, damage: 10 };
const secondarySmg: Weapon = { name: 'SMG', ammo: 80, maxAmmo: 80, damage: 8 };

function getThreatColor(hp: number): string {
  if (hp <= 80) return "#fcd34d";
  if (hp <= 150) return "#ea580c";
  if (hp <= 300) return "#b91c1c";
  if (hp <= 800) return "#7f1d1d";
  return "#4c1d95";
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'main_menu',
  gameMode: 'campaign',
  levelIndex: 0,
  theme: 'industrial',
  player: null,
  enemies: [],
  turrets: [],
  buttons: [],
  barrels: [],
  healthBoxes: [],
  ammoBoxes: [],
  portal: null,
  walls: [],
  decorations: [],
  gridSize: { width: 10, height: 10 },
  exitPos: null,
  particles: [],
  bloodDecals: [],
  projectiles: [],
  explosions: [],
  isMuted: loadSettings().isMuted,
  musicVolume: loadSettings().musicVolume,
  crtEnabled: loadSettings().crtEnabled,
  showWireframe: loadSettings().showWireframe,
  renderQuality: loadSettings().renderQuality,
  countdown: null,
  timeLeft: null,
  lastDamageTime: 0,
  lastShakeTime: 0,
  trainActive: false,
  hasTrain: false,
  isSlashZooming: false,
  isDodging: false,
  timeScale: 1.0,
  currentTrackName: "None",
  fps: 0,
  stats: { kills: 0, deaths: 0, runs: 1 },
  survivalState: null,
  meta: loadMeta(),
  setTrainActive: (active) => set({ trainActive: active }),
  triggerShake: () => set({ lastShakeTime: Date.now() }),
  dodge: (direction: Position) => {
    const state = get();
    const player = state.player;
    const isSurvival = state.gameMode === 'survival';
    const playingPhase = isSurvival ? 'survival_playing' : 'playing';
    if (!player || player.hp <= 0 || state.phase !== playingPhase || (!isSurvival && state.levelIndex < 70)) return;
    const now = Date.now();
    const hasDodgeMaster = isSurvival && state.survivalState?.activePerks.includes('dodge_master');
    const cooldown = hasDodgeMaster ? 2500 : 5000;
    if (now - player.lastDodgeTime < cooldown) return;
    const dodgeDistance = hasDodgeMaster ? 4.5 : 3;
    let targetX = player.pos.x + direction.x * dodgeDistance;
    let targetZ = player.pos.z + direction.z * dodgeDistance;
    targetX = Math.max(0.5, Math.min(state.gridSize.width - 0.5, targetX));
    targetZ = Math.max(0.5, Math.min(state.gridSize.height - 0.5, targetZ));
    let finalX = player.pos.x;
    let finalZ = player.pos.z;
    for (let i = 1; i <= 10; i++) {
        const stepX = player.pos.x + (targetX - player.pos.x) * (i / 10);
        const stepZ = player.pos.z + (targetZ - player.pos.z) * (i / 10);
        const isWall = state.walls.some(w => Math.abs(w.x - Math.round(stepX)) < 0.6 && Math.abs(w.z - Math.round(stepZ)) < 0.6);
        if (isWall) break;
        finalX = stepX;
        finalZ = stepZ;
    }
    const newPos = { x: finalX, z: finalZ };
    set(s => ({ player: s.player ? { ...s.player, pos: newPos, lastDodgeTime: now } : null, isDodging: true }));
    setTimeout(() => set({ isDodging: false }), 200);
    for (let i = 0; i < 10; i++) get().addParticle([player.pos.x, 0.5, player.pos.z], '#ffffff');
    SFX.enemyShoot();
  },
  slash: () => {
    const state = get();
    const player = state.player;
    const isSurvival = state.gameMode === 'survival';
    const playingPhase = isSurvival ? 'survival_playing' : 'playing';
    if (!player || player.hp <= 0 || state.phase !== playingPhase || (!isSurvival && state.levelIndex < 80)) return;
    const now = Date.now();
    const hasBladeStorm = isSurvival && state.survivalState?.activePerks.includes('blade_storm');
    const cooldown = hasBladeStorm ? 4000 : 10000;
    if (now - player.lastSlashTime < cooldown) return;
    set(s => ({ player: s.player ? { ...s.player, lastSlashTime: now } : null, isSlashZooming: true, timeScale: 0.2 }));
    setTimeout(() => { set({ isSlashZooming: false, timeScale: 1.0 }); }, 500);
    const slashRadius = 4.5;
    const slashDamage = hasBladeStorm ? 80 : 40;
    const playerPos = getPlayerPos(state);
    state.enemies.forEach(e => {
        if (e.hp > 0) {
            const ePos = getEnemyPos(e);
            const dx = ePos.x - playerPos.x;
            const dz = ePos.z - playerPos.z;
            if (Math.sqrt(dx * dx + dz * dz) <= slashRadius) get().damageEntity(e.id, slashDamage, ePos);
        }
    });
    state.barrels.forEach(b => {
        if (b.hp > 0) {
            const dx = b.pos.x - playerPos.x;
            const dz = b.pos.z - playerPos.z;
            if (Math.sqrt(dx * dx + dz * dz) <= slashRadius) get().damageEntity(b.id, slashDamage, b.pos);
        }
    });
    const slashParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const dist = 1 + Math.random() * 2;
      slashParticles.push({
        id: Math.random().toString(36).substr(2, 9),
        pos: [playerPos.x + Math.cos(angle) * dist, 0.5, playerPos.z + Math.sin(angle) * dist],
        color: '#ffffff',
        velocity: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4],
        life: 1.0,
      });
    }
    set(s => ({ particles: [...s.particles, ...slashParticles] }));
    SFX.playerShoot();
  },
  setPhase: (phase) => {
    set({ phase });
    if (phase === 'level_complete' || phase === 'victory') SFX.levelEnd();
    if (phase === 'game_over') {
      SFX.levelEnd();
      set(s => ({ stats: { ...s.stats, deaths: s.stats.deaths + 1 } }));
    }
  },
  setMuted: (muted) => { set({ isMuted: muted }); Music.setMuted(muted); saveSettings({ isMuted: muted }); },
  setMusicVolume: (volume) => { set({ musicVolume: volume }); Music.setVolume(volume); saveSettings({ musicVolume: volume }); },
  setCrtEnabled: (enabled) => { set({ crtEnabled: enabled }); saveSettings({ crtEnabled: enabled }); },
  setShowWireframe: (enabled) => { set({ showWireframe: enabled }); saveSettings({ showWireframe: enabled }); },
  setRenderQuality: (quality) => { set({ renderQuality: quality }); saveSettings({ renderQuality: quality }); },
  resetStats: () => {
    set({ stats: { kills: 0, deaths: 0, runs: 1 }, ...defaultSettings });
    Music.setMuted(defaultSettings.isMuted);
    Music.setVolume(defaultSettings.musicVolume);
    try { localStorage.removeItem(SETTINGS_KEY); } catch {}
  },
  loadLevel: (index) => {
    if (index >= LEVELS.length) { get().setPhase('victory'); return; }
    const level = LEVELS[index];
    const player = get().player;
    const hasDualWeapon = index >= 50;
    const newPlayer: PlayerState = player && index > 0 && player.hp > 0
      ? { ...player, pos: level.playerSpawn, rotation: 0, hp: Math.min(player.maxHp, player.hp + 20), weapon: { ...player.weapon, ammo: player.weapon.maxAmmo }, secondaryWeapon: hasDualWeapon ? (player.secondaryWeapon ? { ...player.secondaryWeapon, ammo: player.secondaryWeapon.maxAmmo } : { ...secondarySmg }) : null, activeWeaponSlot: player.activeWeaponSlot || 'primary', lastDodgeTime: player.lastDodgeTime || 0, lastSlashTime: player.lastSlashTime || 0, }
      : { id: 'player', type: 'player', pos: level.playerSpawn, rotation: 0, hp: 100, maxHp: 100, weapon: { ...defaultWeapon }, secondaryWeapon: hasDualWeapon ? { ...secondarySmg } : null, activeWeaponSlot: 'primary', lastDodgeTime: 0, lastSlashTime: 0 };
    const theme = level.theme || 'industrial';
    const decorations: DecorationState[] = [];
    let seed = index * 1234.567;
    const nextRandom = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    if (theme === 'metro') { for (let i = 0; i < 20; i++) { let x = nextRandom() * (level.gridSize.width + 30) - 15; let z = nextRandom() * (level.gridSize.height + 30) - 15; if (x >= -1 && x <= level.gridSize.width + 1 && z >= -1 && z <= level.gridSize.height + 1) continue; const rand = nextRandom(); let type: DecorationState['type'] = 'bench'; if (rand > 0.7) type = 'metro_sign'; else if (rand > 0.4) type = 'pipe'; decorations.push({ id: `metro-prop-${i}`, type, pos: { x, z }, scale: 1 + nextRandom() * 0.5, rotation: nextRandom() * Math.PI * 2 }); } }
    else if (theme === 'garden') { for (let i = 0; i < 40; i++) { const side = Math.floor(nextRandom() * 4); let x = 0, z = 0; const margin = 5; if (side === 0) { x = nextRandom() * (level.gridSize.width + margin*2) - margin; z = -margin - nextRandom() * 10; } else if (side === 1) { x = nextRandom() * (level.gridSize.width + margin*2) - margin; z = level.gridSize.height + margin + nextRandom() * 10; } else if (side === 2) { x = -margin - nextRandom() * 10; z = nextRandom() * (level.gridSize.height + margin*2) - margin; } else { x = level.gridSize.width + margin + nextRandom() * 10; z = nextRandom() * (level.gridSize.height + margin*2) - margin; } decorations.push({ id: `garden-${i}`, type: nextRandom() > 0.3 ? 'tree' : 'rock', pos: { x, z }, scale: 0.8 + nextRandom() * 1.5, rotation: nextRandom() * Math.PI * 2 }); } }
    else if (theme === 'skyscraper') { for (let i = 0; i < 30; i++) { const side = Math.floor(nextRandom() * 4); let x = 0, z = 0; const margin = 10; if (side === 0) { x = nextRandom() * (level.gridSize.width + margin*2) - margin; z = -margin - nextRandom() * 20; } else if (side === 1) { x = nextRandom() * (level.gridSize.width + margin*2) - margin; z = level.gridSize.height + margin + nextRandom() * 20; } else if (side === 2) { x = -margin - nextRandom() * 20; z = nextRandom() * (level.gridSize.height + margin*2) - margin; } else { x = level.gridSize.width + margin + nextRandom() * 20; z = nextRandom() * (level.gridSize.height + margin*2) - margin; } decorations.push({ id: `sky-${i}`, type: 'building', pos: { x, z }, scale: 1, rotation: 0, w: 2 + nextRandom() * 4, h: 5 + nextRandom() * 30, d: 2 + nextRandom() * 4, color: nextRandom() > 0.5 ? "#1a202c" : "#2d3748" }); } }
    set({ phase: 'level_intro', levelIndex: index, theme, hasTrain: level.hasTrain || false, trainActive: false, timeLeft: level.timeLimit || null, player: newPlayer, enemies: level.enemies.map(e => { const dx = level.playerSpawn.x - e.pos.x; const dz = level.playerSpawn.z - e.pos.z; const rotation = Math.atan2(dx, dz); const color = e.color && e.color !== '#ff0000' && e.color !== '#3b82f6' ? e.color : getThreatColor(e.hp); return { type: 'enemy', id: e.id, pos: e.pos, rotation, hp: e.hp, maxHp: e.hp, weapon: { ...e.weapon }, color, unkillable: e.unkillable }; }), turrets: (level.turrets || []).map(t => ({ type: 'turret', id: t.id, pos: t.pos, rotation: 0, hp: t.hp, maxHp: t.hp, damage: t.damage, fireRate: t.fireRate, lastFireTime: 0, color: t.color || '#ef4444', disabled: false })), buttons: (level.buttons || []).map(b => ({ type: 'button', id: `button-${b.targetId}`, pos: b.pos, rotation: 0, hp: 1, maxHp: 1, targetId: b.targetId, active: false })), barrels: (level.barrels || []).map(b => ({ type: 'barrel', id: b.id, pos: b.pos, rotation: 0, hp: 1, maxHp: 1 })), healthBoxes: (level.healthBoxes || []).map(h => ({ type: 'health_box', id: h.id, pos: h.pos, rotation: 0, hp: 1, maxHp: 1 })), ammoBoxes: (level.ammoBoxes || []).map(a => ({ type: 'ammo_box', id: a.id, pos: a.pos, rotation: 0, hp: 1, maxHp: 1 })), portal: level.portal ? { ...level.portal, used: false } : null, walls: level.walls, decorations, gridSize: level.gridSize, exitPos: level.exit, particles: [], projectiles: [], explosions: [], bloodDecals: [], countdown: 4, lastDamageTime: 0, lastShakeTime: 0, isSlashZooming: false, timeScale: 1.0 });
    SFX.levelStart();
  },
  damageEntity: (id, amount, pos) => {
    const state = get();
    // Collect all changes, apply once
    const newParticles: Particle[] = [];
    const newExplosions: { id: string; pos: Position; radius: number; life: number }[] = [];
    const mkParticle = (p: [number, number, number], color: string) => {
      newParticles.push({ id: Math.random().toString(36).substr(2, 9), pos: [...p], color, velocity: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4], life: 1.0 });
    };

    if (id === 'player') {
      if (!state.player) return;
      // Titanium Plating evolution: +50% damage reduction
      let finalAmount = amount;
      if (state.gameMode === 'survival' && state.survivalState?.evolvedPerks.includes('iron_skin')) {
        finalAmount = Math.floor(amount * 0.5);
      }
      const hp = Math.max(0, state.player.hp - finalAmount);
      if (pos) mkParticle([pos.x, 0.5, pos.z], '#ff0000');

      if (hp === 0) {
        // Phoenix revive
        if (state.gameMode === 'survival' && state.survivalState?.hasPhoenix && !state.survivalState?.phoenixUsed) {
          const maxHp = state.player.maxHp;
          const pPos = getPlayerPos(state);
          const explosionId = Math.random().toString(36).substr(2, 9);
          newExplosions.push({ id: explosionId, pos: pPos, radius: 5, life: 1.0 });
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            mkParticle([pPos.x + Math.cos(angle) * 2, 1, pPos.z + Math.sin(angle) * 2], '#f97316');
          }
          // Damage enemies in radius directly
          const updatedEnemies = state.enemies.map(e => {
            if (e.hp > 0) {
              const e2Pos = getEnemyPos(e);
              const edx = e2Pos.x - pPos.x;
              const edz = e2Pos.z - pPos.z;
              if (Math.sqrt(edx * edx + edz * edz) <= 5) return { ...e, hp: Math.max(0, e.hp - 100) };
            }
            return e;
          });
          set({
            player: { ...state.player, hp: Math.floor(maxHp * 0.5) },
            survivalState: state.survivalState ? { ...state.survivalState, phoenixUsed: true, floatingTexts: [...state.survivalState.floatingTexts, { id: Math.random().toString(36).substr(2, 9), text: 'PHOENIX!', pos: { ...pPos }, color: '#f97316', life: 1.0 }] } : null,
            enemies: updatedEnemies,
            explosions: [...state.explosions, ...newExplosions],
            particles: [...state.particles, ...newParticles],
            lastDamageTime: Date.now(), lastShakeTime: Date.now(),
          });
          return;
        }
        // Death
        if (state.gameMode === 'survival') {
          const sv = state.survivalState;
          const finalScore = sv ? Math.floor(sv.score * sv.scoreMultiplier) : 0;
          // Save meta-progression
          if (sv) {
            const meta = loadMeta();
            const creditsEarned = Math.floor(finalScore / 10) + sv.wave * 5;
            saveMeta({
              credits: meta.credits + creditsEarned,
              bestWave: Math.max(meta.bestWave, sv.wave),
              bestScore: Math.max(meta.bestScore, finalScore),
              totalKills: meta.totalKills + state.stats.kills,
              totalRuns: meta.totalRuns + 1,
            });
            set({ meta: loadMeta() });
          }
          set({ player: { ...state.player, hp: 0 }, lastDamageTime: Date.now(), phase: 'survival_game_over', survivalState: sv ? { ...sv, score: finalScore, highScore: Math.max(sv.highScore, finalScore), timeline: [...sv.timeline, { wave: sv.wave, event: 'Terminated', detail: `Final score: ${finalScore}`, color: '#ef4444', timestamp: Date.now() }] } : null, particles: [...state.particles, ...newParticles] });
        } else {
          set({ player: { ...state.player, hp: 0 }, lastDamageTime: Date.now(), phase: 'game_over', particles: [...state.particles, ...newParticles] });
        }
        return;
      }
      set({ player: { ...state.player, hp }, lastDamageTime: Date.now(), particles: [...state.particles, ...newParticles] });
      return;
    }

    // --- Enemy damage ---
    let hit = false; let killed = false; const killedRef: { enemy: EnemyState | null } = { enemy: null };
    const newBloodDecals: BloodDecal[] = [];
    // Check for shield (Colossus boss)
    let shieldBlocked = false;
    let enemies = state.enemies.map(e => {
      if (e.id === id && e.hp > 0) {
        hit = true;
        if (pos) {
          mkParticle([pos.x, 0.5, pos.z], '#ff0000');
          if (state.gameMode === 'survival') {
            newBloodDecals.push({ id: Math.random().toString(36).substr(2, 9), pos: { x: pos.x, z: pos.z }, rot: Math.random() * Math.PI * 2, scale: 0.5 + Math.random() * 1.5 });
          }
        }
        // Per-hit damage number
        if (pos && state.gameMode === 'survival' && state.survivalState) {
          const dmgText = e.shieldHp && e.shieldHp > 0 ? 'SHIELD' : `${Math.min(amount, e.hp)}`;
          const dmgColor = e.isElite ? '#fbbf24' : e.shieldHp && e.shieldHp > 0 ? '#60a5fa' : '#ff6666';
          state.survivalState.floatingTexts.push({ id: Math.random().toString(36).substr(2, 9), text: dmgText, pos: { x: pos.x + (Math.random() - 0.5) * 0.5, z: pos.z - 0.3 }, color: dmgColor, life: 0.8 });
        }
        if (e.unkillable) return { ...e, lastHitTime: Date.now() };
        // Shield phase for boss
        if (e.shieldHp && e.shieldHp > 0) {
          const newShield = Math.max(0, e.shieldHp - amount);
          shieldBlocked = true;
          if (pos) mkParticle([pos.x, 0.8, pos.z], '#60a5fa');
          return { ...e, shieldHp: newShield, lastHitTime: Date.now() };
        }
        const hp = Math.max(0, e.hp - amount);
        if (hp === 0) { killed = true; killedRef.enemy = e; }
        // Vampiric evolution: heal 5% of damage dealt
        if (state.gameMode === 'survival' && state.survivalState?.evolvedPerks.includes('combat_regen') && state.player && state.player.hp > 0) {
          const healAmt = Math.ceil(amount * 0.05);
          const newHp = Math.min(state.player.maxHp, state.player.hp + healAmt);
          if (newHp !== state.player.hp) set({ player: { ...state.player, hp: newHp } });
        }
        return { ...e, hp, lastHitTime: Date.now() };
      }
      return e;
    });

    if (hit) {
      let updatedStats = state.stats;
      let updatedSv = state.survivalState;
      const extraEnemies: EnemyState[] = [];

      if (killed) {
        updatedStats = { ...updatedStats, kills: updatedStats.kills + 1 };
        const killedEnemy = killedRef.enemy;

        if (state.gameMode === 'survival' && updatedSv && killedEnemy) {
          const ePos = getEnemyPos(killedEnemy);

          // Death particle burst (8 particles matching enemy color)
          for (let i = 0; i < 8; i++) {
            mkParticle([ePos.x + (Math.random() - 0.5) * 0.5, 0.3 + Math.random() * 0.8, ePos.z + (Math.random() - 0.5) * 0.5], killedEnemy.color);
          }

          // Hoarder evolution: all enemies have 30% drop chance; Elites always drop
          const hasHoarder = updatedSv.evolvedPerks.includes('scavenger');
          if (killedEnemy.isElite || (hasHoarder && Math.random() < 0.3)) {
            const dropType = Math.random() > 0.5 ? 'health' : 'ammo';
            if (dropType === 'health') {
              const hbox: HealthBoxState = { type: 'health_box', id: `elite_h_${Date.now()}`, pos: { x: ePos.x, z: ePos.z }, rotation: 0, hp: 1, maxHp: 1 };
              set(s => ({ healthBoxes: [...s.healthBoxes, hbox] }));
            } else {
              const abox: AmmoBoxState = { type: 'ammo_box', id: `elite_a_${Date.now()}`, pos: { x: ePos.x, z: ePos.z }, rotation: 0, hp: 1, maxHp: 1 };
              set(s => ({ ammoBoxes: [...s.ammoBoxes, abox] }));
            }
            // Extra XP burst for elites
            for (let i = 0; i < 5; i++) mkParticle([ePos.x, 1.0, ePos.z], '#fbbf24');
          }

          // Boss kill: track in timeline
          if (killedEnemy.isBoss && updatedSv) {
            updatedSv = { ...updatedSv, bossActive: null, timeline: [...updatedSv.timeline, { wave: updatedSv.wave, event: 'Boss Killed', detail: killedEnemy.bossName || 'Boss', color: '#fbbf24', timestamp: Date.now() }] };
          }

          // XP orb
          const orbId = Math.random().toString(36).substr(2, 9);
          const xpOrbs = [...updatedSv.xpOrbs, { id: orbId, pos: { ...ePos }, value: 10 + updatedSv.wave * 2, spawnTime: Date.now() }];

          // Combo
          const newCombo = updatedSv.killCombo + 1;
          const scoreGain = Math.floor((10 + updatedSv.wave * 3) * (1 + newCombo * 0.1));
          const floats = [...updatedSv.floatingTexts, { id: Math.random().toString(36).substr(2, 9), text: `+${scoreGain}`, pos: { ...ePos }, color: newCombo >= 5 ? '#fbbf24' : '#ffffff', life: 1.0 }];
          if (newCombo >= 10) floats.push({ id: Math.random().toString(36).substr(2, 9), text: `${newCombo}x COMBO!`, pos: { x: ePos.x, z: ePos.z - 0.5 }, color: '#ec4899', life: 1.0 });

          updatedSv = { ...updatedSv, score: updatedSv.score + scoreGain, killCombo: newCombo, comboTimer: 2.5, waveEnemiesRemaining: updatedSv.waveEnemiesRemaining - 1, xpOrbs, floatingTexts: floats };

          const enemyData = killedEnemy as any;

          // Explodes on death: batch damage nearby enemies
          if (enemyData.explodesOnDeath) {
            newExplosions.push({ id: Math.random().toString(36).substr(2, 9), pos: ePos, radius: 3, life: 1.0 });
            for (let i = 0; i < 8; i++) mkParticle([ePos.x, 0.5, ePos.z], '#ff4400');
            enemies = enemies.map(e2 => {
              if (e2.hp > 0 && e2.id !== id) {
                const e2Pos = getEnemyPos(e2);
                const dx2 = e2Pos.x - ePos.x;
                const dz2 = e2Pos.z - ePos.z;
                if (Math.sqrt(dx2 * dx2 + dz2 * dz2) <= 3) return { ...e2, hp: Math.max(0, e2.hp - 40) };
              }
              return e2;
            });
            const pPos = getPlayerPos(state);
            if (state.player && state.player.hp > 0) {
              const dx2 = pPos.x - ePos.x;
              const dz2 = pPos.z - ePos.z;
              if (Math.sqrt(dx2 * dx2 + dz2 * dz2) <= 3) {
                setTimeout(() => get().damageEntity('player', 30, pPos), 0);
              }
            }
          }

          // Splits on death
          if (enemyData.splitsOnDeath) {
            for (let si = 0; si < 2; si++) {
              const splitId = `split_${id}_${si}_${Date.now()}`;
              const offset = si === 0 ? 0.8 : -0.8;
              const splitEnemy: EnemyState = { type: 'enemy', id: splitId, pos: { x: ePos.x + offset, z: ePos.z }, rotation: 0, hp: Math.floor(killedEnemy.maxHp * 0.4), maxHp: Math.floor(killedEnemy.maxHp * 0.4), weapon: { ...killedEnemy.weapon }, color: '#6ee7b7' };
              (splitEnemy as any).survivalType = 'grunt';
              (splitEnemy as any).survivalSpeed = 4.0;
              (splitEnemy as any).scale = 0.6;
              extraEnemies.push(splitEnemy);
            }
            updatedSv = { ...updatedSv, waveEnemiesRemaining: updatedSv.waveEnemiesRemaining + 2 };
          }

          // Vengeful mutation
          if (updatedSv.mutations.includes('vengeful')) {
            newExplosions.push({ id: Math.random().toString(36).substr(2, 9), pos: ePos, radius: 2, life: 0.8 });
            const pPos = getPlayerPos(state);
            if (state.player && state.player.hp > 0) {
              const dx2 = pPos.x - ePos.x;
              const dz2 = pPos.z - ePos.z;
              if (Math.sqrt(dx2 * dx2 + dz2 * dz2) <= 2) {
                setTimeout(() => get().damageEntity('player', 15, pPos), 0);
              }
            }
          }

          // Explosive rounds
          if (updatedSv.activePerks.includes('explosive_rounds') && pos) {
            newExplosions.push({ id: Math.random().toString(36).substr(2, 9), pos: ePos, radius: 2, life: 0.6 });
            enemies = enemies.map(e2 => {
              if (e2.hp > 0 && e2.id !== id) {
                const e2Pos = getEnemyPos(e2);
                const dx2 = e2Pos.x - ePos.x;
                const dz2 = e2Pos.z - ePos.z;
                if (Math.sqrt(dx2 * dx2 + dz2 * dz2) <= 2) return { ...e2, hp: Math.max(0, e2.hp - 20) };
              }
              return e2;
            });
          }

          // Time warp
          if (updatedSv.activePerks.includes('time_warp') && Math.random() < 0.25) {
            updatedSv = { ...updatedSv, timeWarpTimer: 2.0 };
            updatedSv.floatingTexts.push({ id: Math.random().toString(36).substr(2, 9), text: 'TIME WARP', pos: { ...ePos }, color: '#14b8a6', life: 1.0 });
            setTimeout(() => set({ timeScale: 1.0 }), 2000);
            set({ timeScale: 0.4 });
          }
        }
      }

      const finalEnemies = extraEnemies.length > 0 ? [...enemies, ...extraEnemies] : enemies;
      const bloodDecals = newBloodDecals.length > 0
        ? [...state.bloodDecals, ...newBloodDecals].slice(-60)
        : state.bloodDecals;
      set({
        enemies: finalEnemies,
        stats: updatedStats,
        survivalState: updatedSv,
        particles: [...state.particles, ...newParticles],
        explosions: [...state.explosions, ...newExplosions],
        bloodDecals,
      });
      return;
    }

    // --- Turret damage ---
    hit = false; killed = false;
    const newTurrets = state.turrets.map(t => {
      if (t.id === id && t.hp > 0) {
        hit = true;
        if (pos) mkParticle([pos.x, 0.5, pos.z], '#ff0000');
        const hp = Math.max(0, t.hp - amount);
        if (hp === 0) killed = true;
        return { ...t, hp };
      }
      return t;
    });
    if (hit) {
      set({ turrets: newTurrets, stats: killed ? { ...state.stats, kills: state.stats.kills + 1 } : state.stats, particles: [...state.particles, ...newParticles] });
      return;
    }

    // --- Barrel damage (batched explosion) ---
    let explodedBarrel: any = null;
    const newBarrels = state.barrels.map(b => {
      if (b.id === id && b.hp > 0) { hit = true; explodedBarrel = b; return { ...b, hp: 0 }; }
      return b;
    });
    if (hit) {
      const exPos = explodedBarrel?.pos || pos;
      if (exPos) {
        const explosionRadius = 4.5;
        newExplosions.push({ id: Math.random().toString(36).substr(2, 9), pos: exPos, radius: 3, life: 1.0 });
        for (let i = 0; i < 10; i++) { mkParticle([exPos.x, 0.5, exPos.z], '#ff4400'); mkParticle([exPos.x, 0.5, exPos.z], '#ffaa00'); }
        const explosionDamage = 50;

        // Batch damage all entities in radius directly
        let updatedEnemies = state.enemies.map(e => {
          if (e.hp > 0) {
            const e2Pos = getEnemyPos(e);
            const edx = e2Pos.x - exPos.x;
            const edz = e2Pos.z - exPos.z;
            if (Math.sqrt(edx * edx + edz * edz) <= explosionRadius) return { ...e, hp: Math.max(0, e.hp - explosionDamage) };
          }
          return e;
        });
        let updatedTurrets = state.turrets.map(t => {
          if (t.hp > 0) {
            const tdx = t.pos.x - exPos.x;
            const tdz = t.pos.z - exPos.z;
            if (Math.sqrt(tdx * tdx + tdz * tdz) <= explosionRadius) return { ...t, hp: Math.max(0, t.hp - explosionDamage) };
          }
          return t;
        });
        // Chain barrel explosions: just damage them, let the next hit handle their explosion
        let updatedBarrels = newBarrels.map(b => {
          if (b.hp > 0 && b.id !== id) {
            const bdx = b.pos.x - exPos.x;
            const bdz = b.pos.z - exPos.z;
            if (Math.sqrt(bdx * bdx + bdz * bdz) <= explosionRadius) return { ...b, hp: 0 };
          }
          return b;
        });

        // Player damage via deferred call to avoid recursive set
        if (state.player && state.player.hp > 0) {
          const pPos = getPlayerPos(state);
          const pdx = pPos.x - exPos.x;
          const pdz = pPos.z - exPos.z;
          if (Math.sqrt(pdx * pdx + pdz * pdz) <= explosionRadius) {
            setTimeout(() => get().damageEntity('player', explosionDamage, pPos), 0);
          }
        }

        set({
          barrels: updatedBarrels,
          enemies: updatedEnemies,
          turrets: updatedTurrets,
          explosions: [...state.explosions, ...newExplosions],
          particles: [...state.particles, ...newParticles],
          lastShakeTime: Date.now(),
        });
      } else {
        set({ barrels: newBarrels });
      }
    }
  },
  collectHealth: (id) => {
    const state = get();
    const box = state.healthBoxes.find(h => h.id === id);
    if (box && state.player) {
      const scavengerStacks = state.survivalState?.perkStacks['scavenger'] || 0;
      const healAmount = Math.floor(50 * (1 + scavengerStacks * 0.5));
      set(s => ({
        player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + healAmount) } : null,
        healthBoxes: s.healthBoxes.filter(h => h.id !== id)
      }));
    }
  },
  collectAmmo: (id) => {
    const state = get();
    const box = state.ammoBoxes.find(a => a.id === id);
    if (box && state.player) {
      set(s => ({
        player: s.player ? { ...s.player, weapon: { ...s.player.weapon, ammo: s.player.weapon.maxAmmo }, secondaryWeapon: s.player.secondaryWeapon ? { ...s.player.secondaryWeapon, ammo: s.player.secondaryWeapon.maxAmmo } : null } : null,
        ammoBoxes: s.ammoBoxes.filter(a => a.id !== id)
      }));
    }
  },
  usePortal: () => { const state = get(); if (state.portal && !state.portal.used && state.player) { const ps: Particle[] = []; for (let i = 0; i < 10; i++) { ps.push({ id: Math.random().toString(36).substr(2, 9), pos: [state.portal.posA.x, 0.5, state.portal.posA.z], color: '#3b82f6', velocity: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4], life: 1.0 }); ps.push({ id: Math.random().toString(36).substr(2, 9), pos: [state.portal.posB.x, 0.5, state.portal.posB.z], color: '#3b82f6', velocity: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4], life: 1.0 }); } set({ portal: { ...state.portal, used: true }, particles: [...state.particles, ...ps] }); SFX.teleport(); } },
  toggleButton: (id, active) => { const state = get(); const button = state.buttons.find(b => b.id === id); if (!button) return; set(s => ({ buttons: s.buttons.map(b => b.id === id ? { ...b, active } : b), turrets: s.turrets.map(t => t.id === button.targetId ? { ...t, disabled: active } : t) })); },
  playerShoot: (spawnPos, direction) => { const state = get(); const isSurvival = state.gameMode === 'survival'; const validPhase = isSurvival ? state.phase === 'survival_playing' : state.phase === 'playing'; if (!validPhase || !state.player || state.player.hp <= 0 || (state.countdown !== null && state.countdown > 0.5)) return; const activeWeapon = state.player.activeWeaponSlot === 'secondary' && state.player.secondaryWeapon ? state.player.secondaryWeapon : state.player.weapon; const hasBottomlessMag = isSurvival && state.survivalState?.evolvedPerks.includes('extended_mag'); if (!hasBottomlessMag && activeWeapon.ammo <= 0) { SFX.gunEmpty(); return; } if (!hasBottomlessMag) { const updatedWeapon = { ...activeWeapon, ammo: activeWeapon.ammo - 1 }; const newPlayer = state.player.activeWeaponSlot === 'secondary' && state.player.secondaryWeapon ? { ...state.player, secondaryWeapon: updatedWeapon } : { ...state.player, weapon: updatedWeapon }; set({ player: newPlayer }); } const isSmg = state.player.activeWeaponSlot === 'secondary' && state.player.secondaryWeapon; const hollowStacks = isSurvival ? (state.survivalState?.perkStacks['hollow_points'] || 0) : 0; const glassCannonMult = (isSurvival && state.survivalState?.runModifiers.includes('glass_cannon')) ? 2.0 : 1.0; const dmgMult = (1 + hollowStacks * 0.25) * glassCannonMult; const hasBulletHell = isSurvival && state.survivalState?.activePerks.includes('bullet_hell'); const hasExplosiveRounds = isSurvival && state.survivalState?.activePerks.includes('explosive_rounds'); const bulletDamage = Math.floor(activeWeapon.damage * dmgMult); const bulletColor = hasExplosiveRounds ? '#ff6600' : isSmg ? '#22ff44' : undefined; const hasArmorPiercing = isSurvival && state.survivalState?.evolvedPerks.includes('hollow_points'); if (hasBulletHell) { const angles = [-0.15, 0, 0.15]; angles.forEach(a => { const cos = Math.cos(a); const sin = Math.sin(a); const dx = direction.x * cos - direction.z * sin; const dz = direction.x * sin + direction.z * cos; get().addProjectile({ pos: { ...spawnPos }, velocity: { x: dx * 60, z: dz * 60 }, damage: bulletDamage, life: 2.0, isEnemy: false, color: bulletColor, pierce: hasArmorPiercing || false, hitIds: [] }); }); } else { get().addProjectile({ pos: spawnPos, velocity: { x: direction.x * 60, z: direction.z * 60 }, damage: bulletDamage, life: 2.0, isEnemy: false, color: bulletColor, pierce: hasArmorPiercing || false, hitIds: [] }); } },
  enemyShoot: (spawnPos, direction, damage) => { get().addProjectile({ pos: spawnPos, velocity: { x: direction.x * 40, z: direction.z * 40 }, damage, life: 2.0, isEnemy: true }); },
  addProjectile: (proj) => { const id = Math.random().toString(36).substr(2, 9); set(state => ({ projectiles: [...state.projectiles, { ...proj, id }] })); },
  removeProjectile: (id) => set(state => ({ projectiles: state.projectiles.filter(p => p.id !== id) })),
  addParticle: (pos, color, count?: number) => {
    const n = count || 1;
    const newParticles: Particle[] = [];
    for (let i = 0; i < n; i++) {
      newParticles.push({
        id: Math.random().toString(36).substr(2, 9),
        pos: [pos[0], pos[1], pos[2]] as [number, number, number],
        color,
        velocity: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4],
        life: 1.0
      });
    }
    set(state => {
      const merged = [...state.particles, ...newParticles];
      if (merged.length > 50) merged.splice(0, merged.length - 50);
      return { particles: merged };
    });
  },
  addBloodDecal: (pos) => {
    set(state => {
      const newDecal = {
        id: Math.random().toString(36).substr(2, 9),
        pos: { ...pos },
        rot: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 1.5
      };
      // Keep max 30 blood decals to ensure high performance on all devices
      const newDecals = [...state.bloodDecals, newDecal];
      if (newDecals.length > 30) newDecals.shift();
      return { bloodDecals: newDecals };
    });
  },
  tick: (dt) => { const state = get(); if (state.gameMode === 'survival') { get().survivalTick(dt); return; } const effectiveDt = dt * state.timeScale; let newPhase = state.phase; let newCountdown = state.countdown; if (newCountdown !== null) { newCountdown -= dt * 2; if (newCountdown <= 0) { newCountdown = null; newPhase = 'playing'; } } let newTimeLeft = state.timeLeft; if (newTimeLeft !== null && newPhase === 'playing' && newCountdown === null) { newTimeLeft -= effectiveDt; if (newTimeLeft <= 0) { newTimeLeft = 0; newPhase = 'game_over'; SFX.levelEnd(); } } if (newPhase !== state.phase) { set(s => ({ ...s, phase: newPhase, timeLeft: newTimeLeft, stats: { ...s.stats, deaths: s.stats.deaths + 1 } })); return; } set(state => ({ countdown: newCountdown, timeLeft: newTimeLeft, particles: state.particles.map(p => ({ ...p, life: p.life - effectiveDt * 2, pos: [p.pos[0] + p.velocity[0] * effectiveDt, p.pos[1] + p.velocity[1] * effectiveDt, p.pos[2] + p.velocity[2] * effectiveDt] as [number, number, number] })).filter(p => p.life > 0), projectiles: state.projectiles.map(p => ({ ...p, life: p.life - effectiveDt })).filter(p => p.life > 0), explosions: state.explosions.map(e => ({ ...e, life: e.life - effectiveDt * 3 })).filter(e => e.life > 0) })); },
  switchWeapon: () => { const state = get(); if (!state.player || !state.player.secondaryWeapon || (state.phase !== 'playing' && state.phase !== 'survival_playing')) return; set({ player: { ...state.player, activeWeaponSlot: state.player.activeWeaponSlot === 'primary' ? 'secondary' : 'primary' } }); },
  restartGame: () => { set(s => ({ levelIndex: 0, stats: { ...s.stats, runs: s.stats.runs + 1 } })); get().loadLevel(0); },
  togglePause: () => { const { phase, gameMode } = get(); if (phase === 'playing' || phase === 'survival_playing') set({ phase: 'paused' }); else if (phase === 'paused') set({ phase: gameMode === 'survival' ? 'survival_playing' : 'playing' }); else if (['game_over', 'level_complete', 'victory', 'level_intro', 'survival_game_over'].includes(phase)) set({ phase: 'main_menu', gameMode: 'campaign', survivalState: null }); },
  updateTurretFireTime: (id) => set(s => ({ turrets: s.turrets.map(t => t.id === id ? { ...t, lastFireTime: Date.now() } : t) })),
  setCurrentTrackName: (name) => set({ currentTrackName: name }),
  setFps: (fps) => set({ fps }),

  addXPOrb: (pos, value) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(s => ({
      survivalState: s.survivalState ? {
        ...s.survivalState,
        xpOrbs: [...s.survivalState.xpOrbs, { id, pos: { ...pos }, value, spawnTime: Date.now() }]
      } : null
    }));
  },

  addFloatingText: (text, pos, color) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(s => ({
      survivalState: s.survivalState ? {
        ...s.survivalState,
        floatingTexts: [...s.survivalState.floatingTexts, { id, text, pos: { ...pos }, color, life: 1.0 }]
      } : null
    }));
  },

  startSurvival: () => {
    const arenaSize = 30;
    const cx = arenaSize / 2;
    const cz = arenaSize / 2;
    set({
      phase: 'survival_wave_intro',
      gameMode: 'survival',
      levelIndex: 0,
      theme: 'industrial',
      hasTrain: false,
      trainActive: false,
      timeLeft: null,
      player: {
        id: 'player', type: 'player',
        pos: { x: cx, z: cz }, rotation: 0,
        hp: 100, maxHp: 100,
        weapon: { name: 'Pistol', ammo: 24, maxAmmo: 24, damage: 10 },
        secondaryWeapon: null,
        activeWeaponSlot: 'primary',
        lastDodgeTime: 0, lastSlashTime: 0
      },
      enemies: [],
      turrets: [],
      buttons: [],
      barrels: [],
      healthBoxes: [],
      ammoBoxes: [],
      portal: null,
      walls: [],
      decorations: [],
      gridSize: { width: arenaSize, height: arenaSize },
      exitPos: null,
      particles: [
        { id: 'warmup_p', pos: [0, -50, 0] as [number, number, number], color: '#ff0000', velocity: [0, 0, 0], life: 0.01 },
      ],
      projectiles: [],
      explosions: [
        { id: 'warmup_e', pos: { x: 0, z: 0 }, radius: 3, life: 0.01 },
      ],
      bloodDecals: [],
      countdown: null,
      lastDamageTime: 0,
      lastShakeTime: 0,
      isSlashZooming: false,
      timeScale: 1.0,
      survivalState: {
        wave: 0,
        score: 0,
        killCombo: 0,
        comboTimer: 0,
        xpOrbs: [],
        floatingTexts: [],
        activePerks: [],
        perkStacks: {},
        offeredPerks: [],
        waveEnemiesRemaining: 0,
        waveEnemiesTotal: 0,
        mutations: [],
        arenaSize,
        ammoRegenTimer: 0,
        orbitalStrikeTimer: 25,
        hasPhoenix: false,
        phoenixUsed: false,
        highScore: 0,
        spawnQueue: [],
        spawnTimer: 0,
        spawnDelay: 1.5,
        waveIntroTimer: 3.0,
        clonePos: null,
        cloneRotation: 0,
        cloneLastFireTime: 0,
        timeWarpTimer: 0,
        waveStartTime: Date.now(),
        regenAccumulator: 0,
        runModifiers: [],
        scoreMultiplier: 1.0,
        timeline: [],
        perkFanfare: null,
        bossActive: null,
        evolvedPerks: [],
      }
    });
    SFX.levelStart();
    // Start first wave
    setTimeout(() => get().startSurvivalWave(), 100);
  },

  startSurvivalWithModifiers: (modifiers: RunModifier[]) => {
    // Calculate score multiplier
    let mult = 1.0;
    modifiers.forEach(m => {
      const def = RUN_MODIFIERS.find(r => r.id === m);
      if (def) mult *= def.scoreMultiplier;
    });
    // Start survival normally, then patch in modifiers
    get().startSurvival();
    const sv = get().survivalState;
    if (sv) {
      let player = get().player;
      if (modifiers.includes('glass_cannon') && player) {
        player = { ...player, hp: 50, maxHp: 50 };
        set({ player });
      }
      set({
        survivalState: {
          ...sv,
          runModifiers: modifiers,
          scoreMultiplier: mult,
          timeline: [{ wave: 0, event: 'Run Started', detail: modifiers.length > 0 ? `Modifiers: ${modifiers.join(', ')}` : 'Standard run', color: '#22c55e', timestamp: Date.now() }],
        }
      });
      if (modifiers.includes('fast_start')) {
        // Skip to wave 5
        for (let i = 0; i < 4; i++) {
          const sv2 = get().survivalState;
          if (sv2) set({ survivalState: { ...sv2, wave: sv2.wave + 1 } });
        }
      }
    }
    // Update meta
    const meta = loadMeta();
    saveMeta({ totalRuns: meta.totalRuns + 1 });
    set({ meta: loadMeta() });
  },

  startSurvivalWave: () => {
    const state = get();
    const sv = state.survivalState;
    if (!sv) return;

    const newWave = sv.wave + 1;
    const mutations = getMutationsForWave(newWave);
    const waveConfig = generateWave(newWave, mutations);

    // Build spawn queue
    const spawnQueue: SpawnQueueItem[] = [];
    let totalEnemies = 0;

    waveConfig.enemies.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        const spawnPos = getSpawnPosition(waveConfig.spawnPattern, totalEnemies, waveConfig.enemies.reduce((a, b) => a + b.count, 0), sv.arenaSize);
        spawnQueue.push({ def: group.def, spawnPos });
        totalEnemies++;
      }
    });

    // Double enemies modifier
    if (sv.runModifiers.includes('double_enemies')) {
      const extra: SpawnQueueItem[] = [...spawnQueue];
      extra.forEach(item => {
        const sp = getSpawnPosition(waveConfig.spawnPattern, totalEnemies, totalEnemies + 1, sv.arenaSize);
        spawnQueue.push({ def: item.def, spawnPos: sp });
        totalEnemies++;
      });
    }

    // Add boss to spawn queue
    let bossData: { name: string; id: string; mechanic: string } | null = null;
    if (waveConfig.boss) {
      const bossPos = getSpawnPosition('north_rush', 0, 1, sv.arenaSize);
      const bossDef: SurvivalEnemyDef = {
        type: 'grunt',
        hp: waveConfig.boss.hp,
        speed: waveConfig.boss.speed,
        damage: waveConfig.boss.damage,
        color: waveConfig.boss.color,
        weapon: waveConfig.boss.weapon,
        scale: 1.8,
      };
      (bossDef as any).isBoss = true;
      (bossDef as any).bossName = waveConfig.boss.name;
      (bossDef as any).bossMechanic = waveConfig.boss.mechanic;
      // Colossus gets a shield
      if (waveConfig.boss.mechanic === 'colossus') {
        (bossDef as any).shieldHp = Math.floor(waveConfig.boss.hp * 0.4);
        (bossDef as any).shieldMaxHp = Math.floor(waveConfig.boss.hp * 0.4);
      }
      spawnQueue.push({ def: bossDef, spawnPos: bossPos });
      totalEnemies++;
      bossData = { name: waveConfig.boss.name, id: waveConfig.boss.id, mechanic: waveConfig.boss.mechanic };
    }

    // Cycle themes every 5 waves
    const themes: LevelTheme[] = ['industrial', 'desert', 'space_station', 'cemetery', 'metro', 'garden', 'beach', 'airport'];
    const themeIndex = Math.floor((newWave - 1) / 5) % themes.length;

    set({
      phase: 'survival_wave_intro',
      theme: themes[themeIndex],
      survivalState: {
        ...sv,
        wave: newWave,
        mutations,
        waveEnemiesRemaining: totalEnemies,
        waveEnemiesTotal: totalEnemies,
        spawnQueue,
        spawnTimer: 0,
        spawnDelay: waveConfig.spawnDelay,
        waveIntroTimer: bossData ? 3.5 : 2.5,
        waveStartTime: Date.now(),
        bossActive: bossData ? { name: bossData.name, id: bossData.id } : null,
        timeline: [...sv.timeline, { wave: newWave, event: bossData ? `Boss: ${bossData.name}` : `Wave ${newWave}`, detail: `${totalEnemies} enemies`, color: bossData ? '#ef4444' : '#6366f1', timestamp: Date.now() }],
      }
    });

    // Spawn some barrels on the field
    const newBarrels: BarrelState[] = [];
    for (let i = 0; i < 4 + Math.floor(newWave * 0.3); i++) {
      const bx = 3 + Math.random() * (sv.arenaSize - 6);
      const bz = 3 + Math.random() * (sv.arenaSize - 6);
      newBarrels.push({ type: 'barrel', id: `barrel_w${newWave}_${i}`, pos: { x: bx, z: bz }, rotation: 0, hp: 1, maxHp: 1 });
    }
    set({ barrels: newBarrels, bloodDecals: [] });

    // Spawn health/ammo boxes (unless no_pickups modifier)
    if (!sv.runModifiers.includes('no_pickups')) {
      const newHealthBoxes: HealthBoxState[] = [];
      const newAmmoBoxes: AmmoBoxState[] = [];
      for (let i = 0; i < 2; i++) {
        newHealthBoxes.push({ type: 'health_box', id: `hbox_w${newWave}_${i}`, pos: { x: 4 + Math.random() * (sv.arenaSize - 8), z: 4 + Math.random() * (sv.arenaSize - 8) }, rotation: 0, hp: 1, maxHp: 1 });
        newAmmoBoxes.push({ type: 'ammo_box', id: `abox_w${newWave}_${i}`, pos: { x: 4 + Math.random() * (sv.arenaSize - 8), z: 4 + Math.random() * (sv.arenaSize - 8) }, rotation: 0, hp: 1, maxHp: 1 });
      }
      set({ healthBoxes: newHealthBoxes, ammoBoxes: newAmmoBoxes });
    } else {
      set({ healthBoxes: [], ammoBoxes: [] });
    }
  },

  selectPerk: (perkId: PerkId) => {
    const state = get();
    const sv = state.survivalState;
    if (!sv) return;

    const newPerks = [...sv.activePerks];
    if (!newPerks.includes(perkId)) newPerks.push(perkId);
    const newStacks = { ...sv.perkStacks };
    newStacks[perkId] = (newStacks[perkId] || 0) + 1;

    let newPlayer = state.player ? { ...state.player } : null;

    // Apply immediate perk effects
    switch (perkId) {
      case 'iron_skin':
        if (newPlayer) {
          const bonus = Math.max(10, 25 - (newStacks[perkId] - 1) * 5);
          newPlayer.maxHp += bonus;
          newPlayer.hp = newPlayer.maxHp;
        }
        break;
      case 'extended_mag':
        if (newPlayer) {
          newPlayer.weapon = { ...newPlayer.weapon, maxAmmo: Math.floor(newPlayer.weapon.maxAmmo * 1.5), ammo: Math.floor(newPlayer.weapon.maxAmmo * 1.5) };
          if (newPlayer.secondaryWeapon) {
            newPlayer.secondaryWeapon = { ...newPlayer.secondaryWeapon, maxAmmo: Math.floor(newPlayer.secondaryWeapon.maxAmmo * 1.5), ammo: Math.floor(newPlayer.secondaryWeapon.maxAmmo * 1.5) };
          }
        }
        break;
      case 'dual_wield':
        if (newPlayer && !newPlayer.secondaryWeapon) {
          newPlayer.secondaryWeapon = { name: 'SMG', ammo: 80, maxAmmo: 80, damage: 8 };
        }
        break;
      case 'phoenix':
        break; // Handled in survivalState
    }

    // Add perk activation particles
    if (state.player) {
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const dist = 1 + Math.random() * 1.5;
        get().addParticle([state.player.pos.x + Math.cos(angle) * dist, 0.8, state.player.pos.z + Math.sin(angle) * dist], '#fbbf24');
      }
    }

    // Check for perk evolution
    const perkDef = PERKS.find(p => p.id === perkId);
    const evo = getEvolution(perkId, newStacks[perkId]);
    const evolvedPerks = [...sv.evolvedPerks];
    const timeline = [...sv.timeline, { wave: sv.wave, event: 'Perk Selected', detail: perkDef?.name || perkId, color: perkDef?.color || '#ffffff', timestamp: Date.now() }];
    if (evo && !evolvedPerks.includes(perkId)) {
      evolvedPerks.push(perkId);
      timeline.push({ wave: sv.wave, event: 'EVOLUTION', detail: `${evo.name}: ${evo.description}`, color: '#fbbf24', timestamp: Date.now() });
    }

    set({
      player: newPlayer,
      survivalState: {
        ...sv,
        activePerks: newPerks,
        perkStacks: newStacks,
        hasPhoenix: newPerks.includes('phoenix'),
        perkFanfare: { color: perkDef?.color || '#fbbf24', name: evo ? `EVOLVED: ${evo.name}` : perkDef?.name || '', time: Date.now() },
        evolvedPerks,
        timeline,
      }
    });

    // Start next wave
    get().startSurvivalWave();
  },

  survivalTick: (dt) => {
    const state = get();
    const sv = state.survivalState;
    if (!sv || !state.player) return;

    const effectiveDt = dt * state.timeScale;

    // Wave intro countdown
    if (state.phase === 'survival_wave_intro') {
      const newTimer = sv.waveIntroTimer - dt;
      if (newTimer <= 0) {
        set({ phase: 'survival_playing', survivalState: { ...sv, waveIntroTimer: 0 } });
      } else {
        set({ survivalState: { ...sv, waveIntroTimer: newTimer } });
      }
      // Update particles/projectiles/explosions during intro too
      set(s => ({
        particles: s.particles.map(p => ({ ...p, life: p.life - effectiveDt * 2, pos: [p.pos[0] + p.velocity[0] * effectiveDt, p.pos[1] + p.velocity[1] * effectiveDt, p.pos[2] + p.velocity[2] * effectiveDt] as [number, number, number] })).filter(p => p.life > 0),
        explosions: s.explosions.map(e => ({ ...e, life: e.life - effectiveDt * 3 })).filter(e => e.life > 0),
        survivalState: s.survivalState ? { ...s.survivalState, floatingTexts: s.survivalState.floatingTexts.map(t => ({ ...t, life: t.life - effectiveDt * 2 })).filter(t => t.life > 0) } : null,
      }));
      return;
    }

    if (state.phase !== 'survival_playing') return;

    // --- Spawn enemies from queue ---
    let newSv = { ...sv };
    const spawnedEnemies: EnemyState[] = [];
    if (newSv.spawnQueue.length > 0) {
      newSv.spawnTimer += effectiveDt;
      while (newSv.spawnTimer >= newSv.spawnDelay && newSv.spawnQueue.length > 0) {
        newSv.spawnTimer -= newSv.spawnDelay;
        const item = newSv.spawnQueue[0];
        newSv.spawnQueue = newSv.spawnQueue.slice(1);
        const enemyId = `surv_${newSv.wave}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newEnemy: EnemyState = {
          type: 'enemy', id: enemyId,
          pos: item.spawnPos, rotation: 0,
          hp: item.def.hp, maxHp: item.def.hp,
          weapon: { ...item.def.weapon },
          color: item.def.color,
        };
        (newEnemy as any).survivalType = item.def.type;
        (newEnemy as any).survivalSpeed = item.def.speed;
        (newEnemy as any).scale = item.def.scale || 1.0;
        (newEnemy as any).transparent = item.def.transparent || false;
        (newEnemy as any).explodesOnDeath = item.def.explodesOnDeath || false;
        (newEnemy as any).splitsOnDeath = item.def.splitsOnDeath || false;
        (newEnemy as any).spawnTime = Date.now();
        // Boss properties
        if ((item.def as any).isBoss) {
          newEnemy.isBoss = true;
          newEnemy.bossName = (item.def as any).bossName;
          (newEnemy as any).bossMechanic = (item.def as any).bossMechanic;
          if ((item.def as any).shieldHp) {
            newEnemy.shieldHp = (item.def as any).shieldHp;
            newEnemy.shieldMaxHp = (item.def as any).shieldMaxHp;
          }
        }
        // Elite enemy: 10% chance for regular enemies, or 100% with elite_only modifier
        const isEliteRoll = newSv.runModifiers.includes('elite_only') || (!newEnemy.isBoss && Math.random() < 0.10);
        if (isEliteRoll && !newEnemy.isBoss) {
          newEnemy.isElite = true;
          newEnemy.hp = Math.floor(newEnemy.hp * 3);
          newEnemy.maxHp = newEnemy.hp;
        }
        spawnedEnemies.push(newEnemy);
      }
    }

    // --- Ammo regen (1 ammo per 1.5 sec) ---
    let ammoRegen = false;
    newSv.ammoRegenTimer += effectiveDt;
    if (newSv.ammoRegenTimer >= 1.5) {
      newSv.ammoRegenTimer -= 1.5;
      ammoRegen = true;
    }

    // --- Combat regen (accumulate fractional HP, flush whole units to avoid per-frame player updates) ---
    const regenStacks = newSv.perkStacks['combat_regen'] || 0;
    const regenPerSec = regenStacks > 0 && state.player.hp > 0 && state.player.hp < state.player.maxHp ? regenStacks * 2 : 0;
    let regenToApply = 0;
    if (regenPerSec > 0) {
      newSv.regenAccumulator += regenPerSec * effectiveDt;
      if (newSv.regenAccumulator >= 1) {
        regenToApply = Math.floor(newSv.regenAccumulator);
        newSv.regenAccumulator -= regenToApply;
      }
    } else {
      newSv.regenAccumulator = 0;
    }

    // --- Combo decay ---
    if (newSv.comboTimer > 0) {
      newSv.comboTimer -= effectiveDt;
      if (newSv.comboTimer <= 0) {
        newSv.killCombo = 0;
        newSv.comboTimer = 0;
      }
    }

    // --- Sonic Rush trail (swift_feet evolution: damage enemies near player) ---
    if (newSv.evolvedPerks.includes('swift_feet') && state.player.hp > 0) {
      const trailDps = 15;
      const trailDmg = trailDps * effectiveDt;
      const trailRadius = 1.5;
      const updatedEnemies = state.enemies.map(e => {
        if (e.hp > 0) {
          const ep = getEnemyPos(e);
          const dx = ep.x - pPos.x;
          const dz = ep.z - pPos.z;
          if (Math.sqrt(dx * dx + dz * dz) <= trailRadius) {
            return { ...e, hp: Math.max(0, e.hp - trailDmg) };
          }
        }
        return e;
      });
      set({ enemies: updatedEnemies });
    }

    // --- Death aura (batch damage into enemies array directly) ---
    const pPos = getPlayerPos(state);
    const deathAuraStacks = newSv.perkStacks['death_aura'] || 0;
    let auraParticles: [number, number, number][] = [];
    if (deathAuraStacks > 0 && state.player.hp > 0) {
      const auraDps = deathAuraStacks * 8;
      const auraDmg = auraDps * effectiveDt;
      const auraRadius = 3;
      const updatedEnemies = state.enemies.map(e => {
        if (e.hp > 0) {
          const ep = getEnemyPos(e);
          const dx = ep.x - pPos.x;
          const dz = ep.z - pPos.z;
          if (Math.sqrt(dx * dx + dz * dz) <= auraRadius) {
            const newHp = Math.max(0, e.hp - auraDmg);
            if (newHp !== e.hp) {
              auraParticles.push([ep.x, 0.5, ep.z]);
              return { ...e, hp: newHp };
            }
          }
        }
        return e;
      });
      if (auraParticles.length > 0) {
        set({ enemies: updatedEnemies });
      }
    }

    // --- Orbital strike ---
    let orbitalExplosion: { id: string; pos: Position; radius: number; life: number } | null = null;
    let orbitalParticlePos: Position | null = null;
    if (newSv.activePerks.includes('orbital_strike')) {
      newSv.orbitalStrikeTimer -= effectiveDt;
      if (newSv.orbitalStrikeTimer <= 0) {
        newSv.orbitalStrikeTimer = 25;
        const aliveEnemies = state.enemies.filter(e => e.hp > 0);
        if (aliveEnemies.length > 0) {
          const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          const tPos = getEnemyPos(target);
          orbitalExplosion = { id: Math.random().toString(36).substr(2, 9), pos: tPos, radius: 5, life: 1.0 };
          orbitalParticlePos = tPos;
          const updatedEnemies = get().enemies.map(e => {
            if (e.hp > 0) {
              const ep = getEnemyPos(e);
              const dx = ep.x - tPos.x;
              const dz = ep.z - tPos.z;
              if (Math.sqrt(dx * dx + dz * dz) <= 5) {
                return { ...e, hp: Math.max(0, e.hp - 80) };
              }
            }
            return e;
          });
          set({ enemies: updatedEnemies });
          get().triggerShake();
          get().addFloatingText('ORBITAL STRIKE!', tPos, '#fbbf24');
        }
      }
    }

    // --- Shadow clone AI ---
    if (newSv.activePerks.includes('shadow_clone') && state.player.hp > 0) {
      const cloneSpeed = 6;
      let cPos = newSv.clonePos || { x: pPos.x + 2, z: pPos.z + 2 };
      let nearestEnemy: EnemyState | null = null;
      let nearestDist = Infinity;
      state.enemies.forEach(e => {
        if (e.hp > 0) {
          const ep = getEnemyPos(e);
          const dx = ep.x - cPos.x;
          const dz = ep.z - cPos.z;
          const d = Math.sqrt(dx * dx + dz * dz);
          if (d < nearestDist) { nearestDist = d; nearestEnemy = e; }
        }
      });
      if (nearestEnemy) {
        const nep = getEnemyPos(nearestEnemy);
        const dx = nep.x - cPos.x;
        const dz = nep.z - cPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 5) {
          cPos = { x: cPos.x + (dx / dist) * cloneSpeed * effectiveDt, z: cPos.z + (dz / dist) * cloneSpeed * effectiveDt };
        }
        newSv.cloneRotation = Math.atan2(-dx, -dz);
        const now = Date.now();
        if (now - newSv.cloneLastFireTime > 500 && dist < 12) {
          newSv.cloneLastFireTime = now;
          const dir = { x: dx / dist, z: dz / dist };
          get().addProjectile({ pos: { x: cPos.x + dir.x * 0.6, z: cPos.z + dir.z * 0.6 }, velocity: { x: dir.x * 55, z: dir.z * 55 }, damage: 8, life: 2.0, isEnemy: false, color: '#818cf8' });
        }
      } else {
        const dx = pPos.x + 2 - cPos.x;
        const dz = pPos.z + 2 - cPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 1) {
          cPos = { x: cPos.x + (dx / dist) * cloneSpeed * effectiveDt, z: cPos.z + (dz / dist) * cloneSpeed * effectiveDt };
        }
      }
      newSv.clonePos = cPos;
    }

    // --- XP Orb magnetism ---
    const magnetismRadius = newSv.activePerks.includes('magnetism') ? 6 : 3;
    const collectedOrbs: string[] = [];
    const newOrbs = newSv.xpOrbs.map(orb => {
      const dx = pPos.x - orb.pos.x;
      const dz = pPos.z - orb.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 0.5) { collectedOrbs.push(orb.id); return orb; }
      if (dist < magnetismRadius) {
        const speed = 10;
        return { ...orb, pos: { x: orb.pos.x + (dx / dist) * speed * effectiveDt, z: orb.pos.z + (dz / dist) * speed * effectiveDt } };
      }
      return orb;
    }).filter(orb => !collectedOrbs.includes(orb.id));

    if (collectedOrbs.length > 0) {
      newSv.score += collectedOrbs.length * 5;
    }
    newSv.xpOrbs = newOrbs;

    // --- Floating text decay ---
    newSv.floatingTexts = newSv.floatingTexts.map(t => ({ ...t, life: t.life - effectiveDt * 2 })).filter(t => t.life > 0);

    // --- Arena expansion (grows over time) ---
    if (newSv.wave >= 5) {
      const targetSize = Math.min(60, 30 + (newSv.wave - 5) * 1.5);
      if (newSv.arenaSize < targetSize) {
        newSv.arenaSize = Math.min(targetSize, newSv.arenaSize + effectiveDt * 2);
        set({ gridSize: { width: Math.floor(newSv.arenaSize), height: Math.floor(newSv.arenaSize) } });
      }
    }

    // --- Adrenaline check (applied in Player.tsx via store read) ---

    // --- Check wave completion ---
    const currentEnemies = get().enemies;
    const allSpawned = newSv.spawnQueue.length === 0;
    const allDead = currentEnemies.filter(e => e.hp > 0).length === 0 && spawnedEnemies.length === 0;
    if (allSpawned && allDead && newSv.waveEnemiesTotal > 0) {
      const offered = pickRandomPerks(newSv.wave, newSv.activePerks, newSv.perkStacks, 3);
      newSv.offeredPerks = offered.map(p => p.id);
      set({ phase: 'survival_perk_select' });
    }

    // --- Single batched state update ---
    set(s => {
      let updatedPlayer = s.player;
      if (updatedPlayer) {
        // Ammo regen
        if (ammoRegen) {
          updatedPlayer = {
            ...updatedPlayer,
            weapon: { ...updatedPlayer.weapon, ammo: Math.min(updatedPlayer.weapon.maxAmmo, updatedPlayer.weapon.ammo + 1) },
            secondaryWeapon: updatedPlayer.secondaryWeapon ? { ...updatedPlayer.secondaryWeapon, ammo: Math.min(updatedPlayer.secondaryWeapon.maxAmmo, updatedPlayer.secondaryWeapon.ammo + 1) } : null,
          };
        }
        // Combat regen - only apply whole HP units (accumulated above)
        if (regenToApply > 0) {
          const newHp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + regenToApply);
          updatedPlayer = { ...updatedPlayer, hp: newHp };
        }
      }

      // Build particles - include aura and orbital particles
      let newParticles = s.particles.map(p => ({ ...p, life: p.life - effectiveDt * 2, pos: [p.pos[0] + p.velocity[0] * effectiveDt, p.pos[1] + p.velocity[1] * effectiveDt, p.pos[2] + p.velocity[2] * effectiveDt] as [number, number, number] })).filter(p => p.life > 0);
      // Add orbital strike particles
      if (orbitalParticlePos) {
        for (let i = 0; i < 30; i++) {
          newParticles.push({ id: Math.random().toString(36).substr(2, 9), pos: [orbitalParticlePos.x, 1, orbitalParticlePos.z], color: '#fbbf24', velocity: [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4], life: 1.0 });
        }
      }

      // Build explosions
      let newExplosions = s.explosions.map(e => ({ ...e, life: e.life - effectiveDt * 3 })).filter(e => e.life > 0);
      if (orbitalExplosion) newExplosions.push(orbitalExplosion);

      // Merge spawned enemies
      const mergedEnemies = spawnedEnemies.length > 0 ? [...s.enemies, ...spawnedEnemies] : s.enemies;

      return {
        player: updatedPlayer,
        survivalState: newSv,
        enemies: mergedEnemies,
        particles: newParticles,
        projectiles: s.projectiles.map(p => ({ ...p, life: p.life - effectiveDt })).filter(p => p.life > 0),
        explosions: newExplosions,
      };
    });
  },
}));
