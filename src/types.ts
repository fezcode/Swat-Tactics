export type EntityType = 'player' | 'enemy' | 'barrel' | 'wall' | 'projectile' | 'health_box';

export interface Position {
  x: number;
  z: number;
}

export interface Weapon {
  name: string;
  ammo: number;
  maxAmmo: number;
  damage: number;
}

export interface EntityState {
  id: string;
  type: EntityType;
  pos: Position;
  rotation: number;
  hp: number;
  maxHp: number;
}

export interface EnemyState extends EntityState {
  type: 'enemy';
  weapon: Weapon;
}

export interface PlayerState extends EntityState {
  type: 'player';
  weapon: Weapon;
}

export interface BarrelState extends EntityState {
  type: 'barrel';
  hp: number;
  maxHp: number;
}

export interface HealthBoxState extends EntityState {
  type: 'health_box';
}

export interface ProjectileState {
  id: string;
  pos: Position;
  velocity: Position;
  damage: number;
  life: number;
  isEnemy: boolean;
}

export type LevelTheme = 'industrial' | 'garden';

export interface LevelData {
  id: number;
  theme?: LevelTheme;
  gridSize: { width: number; height: number };
  playerSpawn: Position;
  walls: Position[];
  enemies: { id: string; pos: Position; hp: number; weapon: Weapon }[];
  barrels: { id: string; pos: Position }[];
  healthBoxes?: { id: string; pos: Position }[];
  exit: Position;
}

export type GamePhase = 'main_menu' | 'playing' | 'paused' | 'game_over' | 'level_complete' | 'victory';

export interface Particle {
  id: string;
  pos: [number, number, number];
  color: string;
  velocity: [number, number, number];
  life: number;
}
