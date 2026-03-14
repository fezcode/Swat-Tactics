import { create } from 'zustand';
import type { PlayerState, EnemyState, BarrelState, GamePhase, Position, Weapon, Particle, ProjectileState } from '../types';
import { LEVELS } from './levels';
import { SFX, Music } from './sounds';

interface ExplosionEffect {
  id: string;
  pos: Position;
  radius: number;
  life: number;
}

interface GameState {
  phase: GamePhase;
  levelIndex: number;
  player: PlayerState | null;
  enemies: EnemyState[];
  barrels: BarrelState[];
  walls: Position[];
  gridSize: { width: number; height: number };
  exitPos: Position | null;
  particles: Particle[];
  projectiles: ProjectileState[];
  explosions: ExplosionEffect[];
  isMuted: boolean;
  
  setPhase: (phase: GamePhase) => void;
  loadLevel: (index: number) => void;
  setMuted: (muted: boolean) => void;
  
  // Continuous actions
  damageEntity: (id: string, amount: number, pos?: Position) => void;
  playerShoot: (spawnPos: Position, direction: Position) => void;
  enemyShoot: (spawnPos: Position, direction: Position, damage: number) => void;
  addProjectile: (proj: Omit<ProjectileState, 'id'>) => void;
  removeProjectile: (id: string) => void;
  addParticle: (pos: [number, number, number], color: string) => void;
  tick: (dt: number) => void;
  restartGame: () => void;
}

const defaultWeapon: Weapon = { name: 'Pistol', ammo: 24, maxAmmo: 24, damage: 10 };

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'main_menu',
  levelIndex: 0,
  player: null,
  enemies: [],
  barrels: [],
  walls: [],
  gridSize: { width: 10, height: 10 },
  exitPos: null,
  particles: [],
  projectiles: [],
  explosions: [],
  isMuted: false,

  setPhase: (phase) => {
    set({ phase });
    if (phase === 'level_complete' || phase === 'victory') SFX.levelEnd();
    if (phase === 'game_over') SFX.levelEnd();
  },

  setMuted: (muted) => {
    set({ isMuted: muted });
    Music.setMuted(muted);
  },

  loadLevel: (index) => {
    if (index >= LEVELS.length) {
      get().setPhase('victory');
      return;
    }
    const level = LEVELS[index];
    const player = get().player;
    // Keep player stats if moving to next level, else reset
    const newPlayer: PlayerState = player && index > 0 && player.hp > 0
      ? { 
          ...player, 
          pos: level.playerSpawn, 
          rotation: 0, 
          hp: Math.min(player.maxHp, player.hp + 20),
          weapon: { ...player.weapon, ammo: player.weapon.maxAmmo } 
        }
      : { id: 'player', type: 'player', pos: level.playerSpawn, rotation: 0, hp: 100, maxHp: 100, weapon: { ...defaultWeapon } };

    set({
      phase: 'playing',
      levelIndex: index,
      player: newPlayer,
      enemies: level.enemies.map(e => {
        const dx = level.playerSpawn.x - e.pos.x;
        const dz = level.playerSpawn.z - e.pos.z;
        const rotation = Math.atan2(dx, dz);
        return { type: 'enemy', id: e.id, pos: e.pos, rotation, hp: e.hp, maxHp: e.hp, weapon: { ...e.weapon } };
      }),
      barrels: level.barrels.map(b => ({ type: 'barrel', id: b.id, pos: b.pos, rotation: 0, hp: 1, maxHp: 1 })),
      walls: level.walls,
      gridSize: level.gridSize,
      exitPos: level.exit,
      particles: [],
      projectiles: [],
      explosions: [],
    });
    SFX.levelStart();
  },

  damageEntity: (id, amount, pos) => {
    const state = get();
    if (id === 'player') {
      if (state.player) {
        const hp = Math.max(0, state.player.hp - amount);
        set({ player: { ...state.player, hp } });
        if (pos) get().addParticle([pos.x, 0.5, pos.z], '#ff0000');
        if (hp === 0) get().setPhase('game_over');
      }
      return;
    }

    // Try enemies
    let hit = false;
    const newEnemies = state.enemies.map(e => {
      if (e.id === id && e.hp > 0) {
        hit = true;
        if (pos) get().addParticle([pos.x, 0.5, pos.z], '#ff0000');
        const hp = Math.max(0, e.hp - amount);
        // Check if all enemies dead after this
        return { ...e, hp };
      }
      return e;
    });
    
    if (hit) {
      set({ enemies: newEnemies });
      return;
    }

    // Try barrels
    let explodedBarrel: any = null;
    const newBarrels = state.barrels.map(b => {
      if (b.id === id && b.hp > 0) {
        hit = true;
        explodedBarrel = b;
        return { ...b, hp: 0 }; // Explode
      }
      return b;
    });

    if (hit) {
      set({ barrels: newBarrels });
      const exPos = pos || explodedBarrel?.pos;
      if (exPos) {
        // Create AoE visual
        const explosionRadius = 3;
        const explosionId = Math.random().toString(36).substr(2, 9);
        set(s => ({
          explosions: [...s.explosions, { id: explosionId, pos: exPos, radius: explosionRadius, life: 1.0 }]
        }));

        for (let i = 0; i < 20; i++) {
          get().addParticle([exPos.x, 0.5, exPos.z], '#ff4400');
          get().addParticle([exPos.x, 0.5, exPos.z], '#ffaa00');
        }
        
        const explosionDamage = 50;

        if (state.player && state.player.hp > 0) {
          const dx = state.player.pos.x - exPos.x;
          const dz = state.player.pos.z - exPos.z;
          if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) {
            get().damageEntity('player', explosionDamage, state.player.pos);
          }
        }

        state.enemies.forEach(e => {
          if (e.hp > 0) {
            const dx = e.pos.x - exPos.x;
            const dz = e.pos.z - exPos.z;
            if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) {
              get().damageEntity(e.id, explosionDamage, e.pos);
            }
          }
        });

        state.barrels.forEach(b => {
          if (b.hp > 0 && b.id !== id) {
            const dx = b.pos.x - exPos.x;
            const dz = b.pos.z - exPos.z;
            if (Math.sqrt(dx * dx + dz * dz) <= explosionRadius) {
              get().damageEntity(b.id, explosionDamage, b.pos);
            }
          }
        });
      }
    }
  },

  playerShoot: (spawnPos, direction) => {
    const state = get();
    if (state.phase !== 'playing' || !state.player || state.player.hp <= 0) return;

    if (state.player.weapon.ammo <= 0) {
        return;
    }

    const newPlayer = { ...state.player, weapon: { ...state.player.weapon, ammo: state.player.weapon.ammo - 1 } };
    set({ player: newPlayer });

    get().addProjectile({
      pos: spawnPos,
      velocity: { x: direction.x * 30, z: direction.z * 30 },
      damage: state.player.weapon.damage,
      life: 2.0,
      isEnemy: false
    });
  },

  enemyShoot: (spawnPos, direction, damage) => {
    get().addProjectile({
      pos: spawnPos,
      velocity: { x: direction.x * 20, z: direction.z * 20 },
      damage,
      life: 2.0,
      isEnemy: true
    });
  },

  addProjectile: (proj) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(state => ({
      projectiles: [...state.projectiles, { ...proj, id }]
    }));
  },

  removeProjectile: (id) => {
    set(state => ({
      projectiles: state.projectiles.filter(p => p.id !== id)
    }));
  },

  addParticle: (pos, color) => {
    const id = Math.random().toString(36).substr(2, 9);
    const velocity: [number, number, number] = [(Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4];
    set(state => ({
      particles: [...state.particles, { id, pos, color, velocity, life: 1.0 }]
    }));
  },

  tick: (dt) => {
    set(state => ({
      particles: state.particles.map(p => ({
        ...p,
        life: p.life - dt * 2,
        pos: [p.pos[0] + p.velocity[0] * dt, p.pos[1] + p.velocity[1] * dt, p.pos[2] + p.velocity[2] * dt] as [number, number, number]
      })).filter(p => p.life > 0),
      projectiles: state.projectiles.map(p => ({
        ...p,
        life: p.life - dt,
      })).filter(p => p.life > 0),
      explosions: state.explosions.map(e => ({
        ...e,
        life: e.life - dt * 3
      })).filter(e => e.life > 0)
    }));
  },

  restartGame: () => {
    set({ levelIndex: 0 });
    get().loadLevel(0);
  }
}));
