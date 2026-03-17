import { create } from 'zustand';
import type { PlayerState, EnemyState, BarrelState, GamePhase, Position, Weapon, Particle, ProjectileState, HealthBoxState, AmmoBoxState, LevelTheme, DecorationState, PortalState, TurretState, ButtonState } from '../types';
import { LEVELS } from './levels';
import { SFX, Music } from './sounds';

interface ExplosionEffect { id: string; pos: Position; radius: number; life: number; }
interface GameStats { kills: number; deaths: number; runs: number; }

interface GameState {
  phase: GamePhase;
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
  projectiles: ProjectileState[];
  explosions: ExplosionEffect[];
  isMuted: boolean;
  crtEnabled: boolean;
  countdown: number | null;
  timeLeft: number | null;
  lastDamageTime: number;
  lastShakeTime: number;
  trainActive: boolean;
  hasTrain: boolean;
  isSlashZooming: boolean;
  timeScale: number;
  currentTrackName: string;
  fps: number;
  stats: GameStats;
  setPhase: (phase: GamePhase) => void;
  loadLevel: (index: number) => void;
  setMuted: (muted: boolean) => void;
  setCrtEnabled: (enabled: boolean) => void;
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
  addParticle: (pos: [number, number, number], color: string) => void;
  tick: (dt: number) => void;
  restartGame: () => void;
  togglePause: () => void;
  updateTurretFireTime: (id: string) => void;
  switchWeapon: () => void;
  dodge: (direction: Position) => void;
  slash: () => void;
  setCurrentTrackName: (name: string) => void;
  setFps: (fps: number) => void;
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
  projectiles: [],
  explosions: [],
  isMuted: false,
  crtEnabled: true,
  countdown: null,
  timeLeft: null,
  lastDamageTime: 0,
  lastShakeTime: 0,
  trainActive: false,
  hasTrain: false,
  isSlashZooming: false,
  timeScale: 1.0,
  currentTrackName: "None",
  fps: 0,
  stats: { kills: 0, deaths: 0, runs: 1 },
  setTrainActive: (active) => set({ trainActive: active }),
  triggerShake: () => set({ lastShakeTime: Date.now() }),
  dodge: (direction: Position) => {
    const state = get();
    const player = state.player;
    if (!player || player.hp <= 0 || state.phase !== 'playing' || state.levelIndex < 70) return;
    const now = Date.now();
    if (now - player.lastDodgeTime < 5000) return;
    const dodgeDistance = 3;
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
    set(s => ({ player: s.player ? { ...s.player, pos: newPos, lastDodgeTime: now } : null }));
    for (let i = 0; i < 10; i++) get().addParticle([player.pos.x, 0.5, player.pos.z], '#ffffff');
    SFX.enemyShoot();
  },
  slash: () => {
    const state = get();
    const player = state.player;
    if (!player || player.hp <= 0 || state.phase !== 'playing' || state.levelIndex < 80) return;
    const now = Date.now();
    if (now - player.lastSlashTime < 10000) return;
    set(s => ({ player: s.player ? { ...s.player, lastSlashTime: now } : null, isSlashZooming: true, timeScale: 0.2 }));
    setTimeout(() => { set({ isSlashZooming: false, timeScale: 1.0 }); }, 500);
    const slashRadius = 4.5;
    const slashDamage = 40;
    state.enemies.forEach(e => {
        if (e.hp > 0) {
            const dx = e.pos.x - player.pos.x;
            const dz = e.pos.z - player.pos.z;
            if (Math.sqrt(dx * dx + dz * dz) <= slashRadius) get().damageEntity(e.id, slashDamage, e.pos);
        }
    });
    state.barrels.forEach(b => {
        if (b.hp > 0) {
            const dx = b.pos.x - player.pos.x;
            const dz = b.pos.z - player.pos.z;
            if (Math.sqrt(dx * dx + dz * dz) <= slashRadius) get().damageEntity(b.id, slashDamage, b.pos);
        }
    });
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const dist = 1 + Math.random() * 2;
      get().addParticle([player.pos.x + Math.cos(angle) * dist, 0.5, player.pos.z + Math.sin(angle) * dist], '#ffffff');
    }
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
  setMuted: (muted) => { set({ isMuted: muted }); Music.setMuted(muted); },
  setCrtEnabled: (enabled) => set({ crtEnabled: enabled }),
  resetStats: () => set({ stats: { kills: 0, deaths: 0, runs: 1 } }),
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
    set({ phase: 'level_intro', levelIndex: index, theme, hasTrain: level.hasTrain || false, trainActive: false, timeLeft: level.timeLimit || null, player: newPlayer, enemies: level.enemies.map(e => { const dx = level.playerSpawn.x - e.pos.x; const dz = level.playerSpawn.z - e.pos.z; const rotation = Math.atan2(dx, dz); const color = e.color && e.color !== '#ff0000' && e.color !== '#3b82f6' ? e.color : getThreatColor(e.hp); return { type: 'enemy', id: e.id, pos: e.pos, rotation, hp: e.hp, maxHp: e.hp, weapon: { ...e.weapon }, color, unkillable: e.unkillable }; }), turrets: (level.turrets || []).map(t => ({ type: 'turret', id: t.id, pos: t.pos, rotation: 0, hp: t.hp, maxHp: t.hp, damage: t.damage, fireRate: t.fireRate, lastFireTime: 0, color: t.color || '#ef4444', disabled: false })), buttons: (level.buttons || []).map(b => ({ type: 'button', id: `button-${b.targetId}`, pos: b.pos, rotation: 0, hp: 1, maxHp: 1, targetId: b.targetId, active: false })), barrels: (level.barrels || []).map(b => ({ type: 'barrel', id: b.id, pos: b.pos, rotation: 0, hp: 1, maxHp: 1 })), healthBoxes: (level.healthBoxes || []).map(h => ({ type: 'health_box', id: h.id, pos: h.pos, rotation: 0, hp: 1, maxHp: 1 })), ammoBoxes: (level.ammoBoxes || []).map(a => ({ type: 'ammo_box', id: a.id, pos: a.pos, rotation: 0, hp: 1, maxHp: 1 })), portal: level.portal ? { ...level.portal, used: false } : null, walls: level.walls, decorations, gridSize: level.gridSize, exitPos: level.exit, particles: [], projectiles: [], explosions: [], countdown: 4, lastDamageTime: 0, lastShakeTime: 0, isSlashZooming: false, timeScale: 1.0 });
    SFX.levelStart();
  },
  damageEntity: (id, amount, pos) => {
    const state = get();
    if (id === 'player') { if (state.player) { const hp = Math.max(0, state.player.hp - amount); set({ player: { ...state.player, hp }, lastDamageTime: Date.now() }); if (pos) get().addParticle([pos.x, 0.5, pos.z], '#ff0000'); if (hp === 0) get().setPhase('game_over'); } return; }
    let hit = false; let killed = false;
    const newEnemies = state.enemies.map(e => { if (e.id === id && e.hp > 0) { hit = true; if (pos) get().addParticle([pos.x, 0.5, pos.z], '#ff0000'); if (e.unkillable) return { ...e, lastHitTime: Date.now() }; const hp = Math.max(0, e.hp - amount); if (hp === 0) killed = true; return { ...e, hp, lastHitTime: Date.now() }; } return e; });
    if (hit) { set({ enemies: newEnemies }); if (killed) set(s => ({ stats: { ...s.stats, kills: s.stats.kills + 1 } })); return; }
    const newTurrets = state.turrets.map(t => { if (t.id === id && t.hp > 0) { hit = true; if (pos) get().addParticle([pos.x, 0.5, pos.z], '#ff0000'); const hp = Math.max(0, t.hp - amount); if (hp === 0) killed = true; return { ...t, hp }; } return t; });
    if (hit) { set({ turrets: newTurrets }); if (killed) set(s => ({ stats: { ...s.stats, kills: s.stats.kills + 1 } })); return; }
    let explodedBarrel: any = null;
    const newBarrels = state.barrels.map(b => { if (b.id === id && b.hp > 0) { hit = true; explodedBarrel = b; return { ...b, hp: 0 }; } return b; });
    if (hit) { set({ barrels: newBarrels }); const exPos = explodedBarrel?.pos || pos; if (exPos) { const explosionRadius = 3; const explosionId = Math.random().toString(36).substr(2, 9); set(s => ({ explosions: [...s.explosions, { id: explosionId, pos: exPos, radius: explosionRadius, life: 1.0 }] })); for (let i = 0; i < 20; i++) { get().addParticle([exPos.x, 0.5, exPos.z], '#ff4400'); get().addParticle([exPos.x, 0.5, exPos.z], '#ffaa00'); } const explosionDamage = 50; if (state.player && state.player.hp > 0) { const dx = state.player.pos.x - exPos.x; const dz = state.player.pos.z - exPos.z; if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) get().damageEntity('player', explosionDamage, state.player.pos); } state.enemies.forEach(e => { if (e.hp > 0) { const dx = e.pos.x - exPos.x; const dz = e.pos.z - exPos.z; if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) get().damageEntity(e.id, explosionDamage, e.pos); } }); state.turrets.forEach(t => { if (t.hp > 0) { const dx = t.pos.x - exPos.x; const dz = t.pos.z - exPos.z; if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) get().damageEntity(t.id, explosionDamage, t.pos); } }); state.barrels.forEach(b => { if (b.hp > 0 && b.id !== id) { const dx = b.pos.x - exPos.x; const dz = b.pos.z - exPos.z; if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) get().damageEntity(b.id, explosionDamage, b.pos); } }); } }
  },
  collectHealth: (id) => { const state = get(); const box = state.healthBoxes.find(h => h.id === id); if (box && state.player) { set({ player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + 50) }, healthBoxes: state.healthBoxes.filter(h => h.id !== id) }); for (let i = 0; i < 10; i++) get().addParticle([box.pos.x, 0.5, box.pos.z], '#22c55e'); } },
  collectAmmo: (id) => { const state = get(); const box = state.ammoBoxes.find(a => a.id === id); if (box && state.player) { set({ player: { ...state.player, weapon: { ...state.player.weapon, ammo: state.player.weapon.maxAmmo }, secondaryWeapon: state.player.secondaryWeapon ? { ...state.player.secondaryWeapon, ammo: state.player.secondaryWeapon.maxAmmo } : null }, ammoBoxes: state.ammoBoxes.filter(a => a.id !== id) }); for (let i = 0; i < 10; i++) get().addParticle([box.pos.x, 0.5, box.pos.z], '#fbbf24'); } },
  usePortal: () => { const state = get(); if (state.portal && !state.portal.used && state.player) { set({ portal: { ...state.portal, used: true } }); for (let i = 0; i < 15; i++) { get().addParticle([state.portal.posA.x, 0.5, state.portal.posA.z], '#3b82f6'); get().addParticle([state.portal.posB.x, 0.5, state.portal.posB.z], '#3b82f6'); } SFX.teleport(); } },
  toggleButton: (id, active) => { const state = get(); const button = state.buttons.find(b => b.id === id); if (!button) return; set(s => ({ buttons: s.buttons.map(b => b.id === id ? { ...b, active } : b), turrets: s.turrets.map(t => t.id === button.targetId ? { ...t, disabled: active } : t) })); },
  playerShoot: (spawnPos, direction) => { const state = get(); if (state.phase !== 'playing' || !state.player || state.player.hp <= 0 || (state.countdown !== null && state.countdown > 0.5)) return; const activeWeapon = state.player.activeWeaponSlot === 'secondary' && state.player.secondaryWeapon ? state.player.secondaryWeapon : state.player.weapon; if (activeWeapon.ammo <= 0) { SFX.gunEmpty(); return; } const updatedWeapon = { ...activeWeapon, ammo: activeWeapon.ammo - 1 }; const newPlayer = state.player.activeWeaponSlot === 'secondary' && state.player.secondaryWeapon ? { ...state.player, secondaryWeapon: updatedWeapon } : { ...state.player, weapon: updatedWeapon }; set({ player: newPlayer }); const isSmg = state.player.activeWeaponSlot === 'secondary' && state.player.secondaryWeapon; get().addProjectile({ pos: spawnPos, velocity: { x: direction.x * 30, z: direction.z * 30 }, damage: activeWeapon.damage, life: 2.0, isEnemy: false, color: isSmg ? '#22ff44' : undefined }); },
  enemyShoot: (spawnPos, direction, damage) => { get().addProjectile({ pos: spawnPos, velocity: { x: direction.x * 20, z: direction.z * 20 }, damage, life: 2.0, isEnemy: true }); },
  addProjectile: (proj) => { const id = Math.random().toString(36).substr(2, 9); set(state => ({ projectiles: [...state.projectiles, { ...proj, id }] })); },
  removeProjectile: (id) => set(state => ({ projectiles: state.projectiles.filter(p => p.id !== id) })),
  addParticle: (pos, color) => { const id = Math.random().toString(36).substr(2, 9); const velocity: [number, number, number] = [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4]; set(state => ({ particles: [...state.particles, { id, pos, color, velocity, life: 1.0 }] })); },
  tick: (dt) => { const state = get(); const effectiveDt = dt * state.timeScale; let newPhase = state.phase; let newCountdown = state.countdown; if (newCountdown !== null) { newCountdown -= dt * 2; if (newCountdown <= 0) { newCountdown = null; newPhase = 'playing'; } } let newTimeLeft = state.timeLeft; if (newTimeLeft !== null && newPhase === 'playing' && newCountdown === null) { newTimeLeft -= effectiveDt; if (newTimeLeft <= 0) { newTimeLeft = 0; newPhase = 'game_over'; SFX.levelEnd(); } } if (newPhase !== state.phase) { set(s => ({ ...s, phase: newPhase, timeLeft: newTimeLeft, stats: { ...s.stats, deaths: s.stats.deaths + 1 } })); return; } set(state => ({ countdown: newCountdown, timeLeft: newTimeLeft, particles: state.particles.map(p => ({ ...p, life: p.life - effectiveDt * 2, pos: [p.pos[0] + p.velocity[0] * effectiveDt, p.pos[1] + p.velocity[1] * effectiveDt, p.pos[2] + p.velocity[2] * effectiveDt] as [number, number, number] })).filter(p => p.life > 0), projectiles: state.projectiles.map(p => ({ ...p, life: p.life - effectiveDt })).filter(p => p.life > 0), explosions: state.explosions.map(e => ({ ...e, life: e.life - effectiveDt * 3 })).filter(e => e.life > 0) })); },
  switchWeapon: () => { const state = get(); if (!state.player || !state.player.secondaryWeapon || state.phase !== 'playing') return; set({ player: { ...state.player, activeWeaponSlot: state.player.activeWeaponSlot === 'primary' ? 'secondary' : 'primary' } }); },
  restartGame: () => { set(s => ({ levelIndex: 0, stats: { ...s.stats, runs: s.stats.runs + 1 } })); get().loadLevel(0); },
  togglePause: () => { const { phase } = get(); if (phase === 'playing') set({ phase: 'paused' }); else if (phase === 'paused') set({ phase: 'playing' }); else if (['game_over', 'level_complete', 'victory', 'level_intro'].includes(phase)) set({ phase: 'main_menu' }); },
  updateTurretFireTime: (id) => set(s => ({ turrets: s.turrets.map(t => t.id === id ? { ...t, lastFireTime: Date.now() } : t) })),
  setCurrentTrackName: (name) => set({ currentTrackName: name }),
  setFps: (fps) => set({ fps })
}));
