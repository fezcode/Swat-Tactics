import { create } from 'zustand';
import type { PlayerState, EnemyState, BarrelState, GamePhase, Position, Weapon, Particle, ProjectileState, HealthBoxState, AmmoBoxState, LevelTheme, DecorationState } from '../types';
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
  theme: LevelTheme;
  player: PlayerState | null;
  enemies: EnemyState[];
  barrels: BarrelState[];
  healthBoxes: HealthBoxState[];
  ammoBoxes: AmmoBoxState[];
  walls: Position[];
  decorations: DecorationState[];
  gridSize: { width: number; height: number };
  exitPos: Position | null;
  particles: Particle[];
  projectiles: ProjectileState[];
  explosions: ExplosionEffect[];
  isMuted: boolean;
  countdown: number | null;
  
  setPhase: (phase: GamePhase) => void;
  loadLevel: (index: number) => void;
  setMuted: (muted: boolean) => void;
  
  // Continuous actions
  damageEntity: (id: string, amount: number, pos?: Position) => void;
  collectHealth: (id: string) => void;
  collectAmmo: (id: string) => void;
  playerShoot: (spawnPos: Position, direction: Position) => void;
  enemyShoot: (spawnPos: Position, direction: Position, damage: number) => void;
  addProjectile: (proj: Omit<ProjectileState, 'id'>) => void;
  removeProjectile: (id: string) => void;
  addParticle: (pos: [number, number, number], color: string) => void;
  tick: (dt: number) => void;
  restartGame: () => void;
  togglePause: () => void;
}

const defaultWeapon: Weapon = { name: 'Pistol', ammo: 24, maxAmmo: 24, damage: 10 };

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'main_menu',
  levelIndex: 0,
  theme: 'industrial',
  player: null,
  enemies: [],
  barrels: [],
  healthBoxes: [],
  ammoBoxes: [],
  walls: [],
  decorations: [],
  gridSize: { width: 10, height: 10 },
  exitPos: null,
  particles: [],
  projectiles: [],
  explosions: [],
  isMuted: false,
  countdown: null,

  setPhase: (phase) => {
    set({ phase });
    if (phase === 'level_complete' || phase === 'victory') SFX.levelEnd();
    if (phase === 'game_over') SFX.levelEnd();
  },

  togglePause: () => {
    const { phase } = get();
    if (phase === 'playing') set({ phase: 'paused' });
    else if (phase === 'paused') set({ phase: 'playing' });
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

    const theme = level.theme || 'industrial';
    const decorations: DecorationState[] = [];

    if (theme === 'garden') {
      for (let i = 0; i < 40; i++) {
        const side = Math.floor(Math.random() * 4);
        let x = 0, z = 0;
        const margin = 5;
        if (side === 0) { x = Math.random() * (level.gridSize.width + margin*2) - margin; z = -margin - Math.random() * 10; }
        else if (side === 1) { x = Math.random() * (level.gridSize.width + margin*2) - margin; z = level.gridSize.height + margin + Math.random() * 10; }
        else if (side === 2) { x = -margin - Math.random() * 10; z = Math.random() * (level.gridSize.height + margin*2) - margin; }
        else { x = level.gridSize.width + margin + Math.random() * 10; z = Math.random() * (level.gridSize.height + margin*2) - margin; }
        decorations.push({
          id: `garden-${i}`,
          type: Math.random() > 0.3 ? 'tree' : 'rock',
          pos: { x, z },
          scale: 0.8 + Math.random() * 1.5,
          rotation: Math.random() * Math.PI * 2
        });
      }
    } else if (theme === 'skyscraper') {
      for (let i = 0; i < 30; i++) {
        const side = Math.floor(Math.random() * 4);
        let x = 0, z = 0;
        const margin = 10;
        if (side === 0) { x = Math.random() * (level.gridSize.width + margin*2) - margin; z = -margin - Math.random() * 20; }
        else if (side === 1) { x = Math.random() * (level.gridSize.width + margin*2) - margin; z = level.gridSize.height + margin + Math.random() * 20; }
        else if (side === 2) { x = -margin - Math.random() * 20; z = Math.random() * (level.gridSize.height + margin*2) - margin; }
        else { x = level.gridSize.width + margin + Math.random() * 20; z = Math.random() * (level.gridSize.height + margin*2) - margin; }
        decorations.push({
          id: `sky-${i}`,
          type: 'building',
          pos: { x, z },
          scale: 1,
          rotation: 0,
          w: 2 + Math.random() * 4,
          h: 5 + Math.random() * 30,
          d: 2 + Math.random() * 4,
          color: Math.random() > 0.5 ? "#1a202c" : "#2d3748"
        });
      }
    } else if (theme === 'desert') {
      for (let i = 0; i < 80; i++) {
        const side = Math.floor(Math.random() * 4);
        let x = 0, z = 0;
        const margin = 5;
        if (side === 0) { x = Math.random() * (level.gridSize.width + margin*2) - margin; z = -margin - Math.random() * 15; }
        else if (side === 1) { x = Math.random() * (level.gridSize.width + margin*2) - margin; z = level.gridSize.height + margin + Math.random() * 15; }
        else if (side === 2) { x = -margin - Math.random() * 15; z = Math.random() * (level.gridSize.height + margin*2) - margin; }
        else { x = level.gridSize.width + margin + Math.random() * 15; z = Math.random() * (level.gridSize.height + margin*2) - margin; }
        decorations.push({
          id: `desert-${i}`,
          type: Math.random() > 0.4 ? 'cactus' : 'rock',
          pos: { x, z },
          scale: 0.6 + Math.random() * 1.5,
          rotation: Math.random() * Math.PI * 2
        });
      }
    }

    set({
      phase: 'playing',
      levelIndex: index,
      theme,
      player: newPlayer,
      enemies: level.enemies.map(e => {
        const dx = level.playerSpawn.x - e.pos.x;
        const dz = level.playerSpawn.z - e.pos.z;
        const rotation = Math.atan2(dx, dz);
        return { 
          type: 'enemy', 
          id: e.id, 
          pos: e.pos, 
          rotation, 
          hp: e.hp, 
          maxHp: e.hp, 
          weapon: { ...e.weapon },
          color: e.color || '#ef4444'
        };
      }),
      barrels: level.barrels.map(b => ({ type: 'barrel', id: b.id, pos: b.pos, rotation: 0, hp: 1, maxHp: 1 })),
      healthBoxes: (level.healthBoxes || []).map(h => ({ type: 'health_box', id: h.id, pos: h.pos, rotation: 0, hp: 1, maxHp: 1 })),
      ammoBoxes: (level.ammoBoxes || []).map(a => ({ type: 'ammo_box', id: a.id, pos: a.pos, rotation: 0, hp: 1, maxHp: 1 })),
      walls: level.walls,
      decorations,
      gridSize: level.gridSize,
      exitPos: level.exit,
      particles: [],
      projectiles: [],
      explosions: [],
      countdown: 4, // 3, 2, 1, START
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

    let hit = false;
    const newEnemies = state.enemies.map(e => {
      if (e.id === id && e.hp > 0) {
        hit = true;
        if (pos) get().addParticle([pos.x, 0.5, pos.z], '#ff0000');
        const hp = Math.max(0, e.hp - amount);
        return { ...e, hp };
      }
      return e;
    });
    
    if (hit) {
      set({ enemies: newEnemies });
      return;
    }

    let explodedBarrel: any = null;
    const newBarrels = state.barrels.map(b => {
      if (b.id === id && b.hp > 0) {
        hit = true;
        explodedBarrel = b;
        return { ...b, hp: 0 }; 
      }
      return b;
    });

    if (hit) {
      set({ barrels: newBarrels });
      const exPos = explodedBarrel?.pos || pos;
      if (exPos) {
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

  collectHealth: (id) => {
    const state = get();
    const box = state.healthBoxes.find(h => h.id === id);
    if (box && state.player) {
      set({
        player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + 50) },
        healthBoxes: state.healthBoxes.filter(h => h.id !== id)
      });
      for (let i = 0; i < 10; i++) {
        get().addParticle([box.pos.x, 0.5, box.pos.z], '#22c55e');
      }
    }
  },

  collectAmmo: (id) => {
    const state = get();
    const box = state.ammoBoxes.find(a => a.id === id);
    if (box && state.player) {
      set({
        player: { ...state.player, weapon: { ...state.player.weapon, ammo: state.player.weapon.maxAmmo } },
        ammoBoxes: state.ammoBoxes.filter(a => a.id !== id)
      });
      for (let i = 0; i < 10; i++) {
        get().addParticle([box.pos.x, 0.5, box.pos.z], '#fbbf24');
      }
    }
  },

  playerShoot: (spawnPos, direction) => {
    const state = get();
    if (state.phase !== 'playing' || !state.player || state.player.hp <= 0 || (state.countdown !== null && state.countdown > 0.5)) return;

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
    const state = get();
    let newCountdown = state.countdown;
    if (newCountdown !== null) {
      newCountdown -= dt * 2;
      if (newCountdown <= 0) newCountdown = null;
    }

    set(state => ({
      countdown: newCountdown,
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
