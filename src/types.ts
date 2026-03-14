export type EntityType = 'player' | 'enemy' | 'barrel' | 'wall' | 'projectile' | 'health_box' | 'ammo_box';

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

export interface AmmoBoxState extends EntityState {
  type: 'ammo_box';
}

export interface ProjectileState {
  id: string;
  pos: Position;
  velocity: Position;
  damage: number;
  life: number;
  isEnemy: boolean;
}

export type LevelTheme = 'industrial' | 'garden' | 'skyscraper' | 'desert';

export interface DecorationState {
  id: string;
  type: 'tree' | 'rock' | 'building' | 'cactus';
  pos: Position;
  scale: number;
  rotation: number;
  color?: string;
  w?: number;
  h?: number;
  d?: number;
}

export interface LevelData {
  id: number;
  theme?: LevelTheme;
  gridSize: { width: number; height: number };
  playerSpawn: Position;
  walls: Position[];
  enemies: { id: string; pos: Position; hp: number; weapon: Weapon }[];
  barrels: { id: string; pos: Position }[];
  healthBoxes?: { id: string; pos: Position }[];
  ammoBoxes?: { id: string; pos: Position }[];
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
