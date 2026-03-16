export type EntityType = 'player' | 'enemy' | 'barrel' | 'wall' | 'projectile' | 'health_box' | 'ammo_box' | 'portal' | 'turret' | 'button';

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
  color: string;
}

export interface TurretState extends EntityState {
  type: 'turret';
  color: string;
  damage: number;
  fireRate: number;
  lastFireTime: number;
  disabled?: boolean;
}

export interface ButtonState extends EntityState {
  type: 'button';
  targetId: string; // ID of the turret it disables
  active: boolean;
}

export interface PlayerState extends EntityState {
  type: 'player';
  weapon: Weapon;
  secondaryWeapon: Weapon | null;
  activeWeaponSlot: 'primary' | 'secondary';
  lastDodgeTime: number;
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

export interface PortalState {
  id: string;
  posA: Position;
  posB: Position;
  used: boolean;
}

export interface ProjectileState {
  id: string;
  pos: Position;
  velocity: Position;
  damage: number;
  life: number;
  isEnemy: boolean;
  color?: string;
}

export type LevelTheme = 'industrial' | 'garden' | 'skyscraper' | 'desert' | 'space_station' | 'beach' | 'cemetery' | 'airport';

export interface DecorationState {
  id: string;
  type: 'tree' | 'rock' | 'building' | 'cactus' | 'satellite' | 'pipe' | 'panel' | 'sand' | 'umbrella' | 'cold_storage' | 'palm_tree' | 'beach_ball' | 'tombstone' | 'dead_tree' | 'crypt' | 'airplane' | 'luggage_cart' | 'terminal_sign' | 'flight_board' | 'security_gate' | 'luggage_scanner';
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
  enemies: { id: string; pos: Position; hp: number; weapon: Weapon; color?: string }[];
  turrets?: { id: string; pos: Position; hp: number; damage: number; fireRate: number; color?: string }[];
  buttons?: { pos: Position; targetId: string }[];
  barrels?: { id: string; pos: Position }[];
  healthBoxes?: { id: string; pos: Position }[];
  ammoBoxes?: { id: string; pos: Position }[];
  portal?: { id: string; posA: Position; posB: Position };
  exit: Position;
  timeLimit?: number;
}

export type GamePhase = 'main_menu' | 'level_intro' | 'playing' | 'paused' | 'game_over' | 'level_complete' | 'victory';

export interface Particle {
  id: string;
  pos: [number, number, number];
  color: string;
  velocity: [number, number, number];
  life: number;
}
