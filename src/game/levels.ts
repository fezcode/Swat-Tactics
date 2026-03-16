import type { LevelData, Weapon } from '../types';

const defaultPistol: Weapon = { name: 'Pistol', ammo: 12, maxAmmo: 12, damage: 10 };
const shotgun: Weapon = { name: 'Shotgun', ammo: 6, maxAmmo: 6, damage: 20 };
const rifle: Weapon = { name: 'Assault Rifle', ammo: 30, maxAmmo: 30, damage: 15 };

function createBoxRoom(width: number, height: number): { x: number, z: number }[] {
  const walls = [];
  for (let x = 0; x < width; x++) {
    walls.push({ x, z: 0 });
    walls.push({ x, z: height - 1 });
  }
  for (let z = 1; z < height - 1; z++) {
    walls.push({ x: 0, z });
    walls.push({ x: width - 1, z });
  }
  return walls;
}

export const LEVELS: LevelData[] = [
  // Level 1: Tutorial
  {
    id: 1,
    theme: 'industrial',
    gridSize: { width: 8, height: 8 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(8, 8), { x: 4, z: 4 }, { x: 4, z: 5 }],
    enemies: [{ id: 'e1', pos: { x: 6, z: 6 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' }],
    barrels: [{ id: 'b1', pos: { x: 5, z: 6 } }],
    exit: { x: 6, z: 1 },
  },
  // Level 2: Two enemies
  {
    id: 2,
    theme: 'industrial',
    gridSize: { width: 10, height: 10 },
    playerSpawn: { x: 1, z: 8 },
    walls: [...createBoxRoom(10, 10), { x: 5, z: 1 }, { x: 5, z: 2 }, { x: 5, z: 3 }],
    enemies: [
      { id: 'e1', pos: { x: 8, z: 2 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e2', pos: { x: 7, z: 7 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'b1', pos: { x: 8, z: 5 } }],
    exit: { x: 8, z: 8 },
  },
  // Level 3: The Shotgunner
  {
    id: 3,
    theme: 'industrial',
    gridSize: { width: 10, height: 10 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(10, 10), { x: 3, z: 4 }, { x: 4, z: 4 }, { x: 5, z: 4 }, { x: 6, z: 4 }],
    enemies: [
      { id: 'e1', pos: { x: 1, z: 8 }, hp: 30, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e2', pos: { x: 8, z: 8 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'b1', pos: { x: 5, z: 8 } }],
    exit: { x: 8, z: 1 },
  },
  // Level 4: Barrels galore
  {
    id: 4,
    theme: 'industrial',
    gridSize: { width: 12, height: 12 },
    playerSpawn: { x: 1, z: 10 },
    walls: [...createBoxRoom(12, 12)],
    enemies: [
      { id: 'e1', pos: { x: 10, z: 10 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e2', pos: { x: 10, z: 1 }, hp: 30, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e3', pos: { x: 5, z: 5 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [
      { id: 'b1', pos: { x: 4, z: 5 } },
      { id: 'b2', pos: { x: 6, z: 5 } },
      { id: 'b3', pos: { x: 9, z: 10 } },
    ],
    exit: { x: 10, z: 5 },
  },
  // Level 5: Hallways
  {
    id: 5,
    theme: 'industrial',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 1, z: 1 },
    walls: [
      ...createBoxRoom(14, 14),
      { x: 4, z: 1 }, { x: 4, z: 2 }, { x: 4, z: 3 }, { x: 4, z: 4 }, { x: 4, z: 5 },
      { x: 9, z: 12 }, { x: 9, z: 11 }, { x: 9, z: 10 }, { x: 9, z: 9 }, { x: 9, z: 8 },
    ],
    enemies: [
      { id: 'e1', pos: { x: 6, z: 1 }, hp: 40, weapon: { ...rifle }, color: '#78350f' },
      { id: 'e2', pos: { x: 12, z: 12 }, hp: 30, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e3', pos: { x: 6, z: 12 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'b1', pos: { x: 5, z: 1 } }, { id: 'b2', pos: { x: 11, z: 12 } }],
    exit: { x: 12, z: 1 },
  },
  // Level 6
  {
    id: 6,
    theme: 'industrial',
    gridSize: { width: 10, height: 14 },
    playerSpawn: { x: 1, z: 12 },
    walls: [...createBoxRoom(10, 14), { x: 5, z: 5 }, { x: 5, z: 6 }, { x: 5, z: 7 }],
    enemies: [
      { id: 'e1', pos: { x: 8, z: 1 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e2', pos: { x: 1, z: 1 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e3', pos: { x: 8, z: 6 }, hp: 40, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'b1', pos: { x: 4, z: 6 } }, { id: 'b2', pos: { x: 6, z: 6 } }],
    exit: { x: 5, z: 1 },
  },
  // Level 7
  {
    id: 7,
    theme: 'industrial',
    gridSize: { width: 15, height: 15 },
    playerSpawn: { x: 1, z: 13 },
    walls: [...createBoxRoom(15, 15), { x: 7, z: 11 }, { x: 7, z: 10 }, { x: 7, z: 9 }, { x: 6, z: 9 }, { x: 8, z: 9 }],
    enemies: [
      { id: 'e1', pos: { x: 1, z: 1 }, hp: 30, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e2', pos: { x: 13, z: 1 }, hp: 30, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e3', pos: { x: 7, z: 1 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'e4', pos: { x: 4, z: 7 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e5', pos: { x: 10, z: 7 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'b1', pos: { x: 4, z: 2 } }, { id: 'b2', pos: { x: 10, z: 2 } }, { id: 'b3', pos: { x: 7, z: 6 } }],
    exit: { x: 7, z: 2 },
  },
  // Level 8
  {
    id: 8,
    theme: 'industrial',
    gridSize: { width: 12, height: 12 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(12, 12), { x: 5, z: 5 }, { x: 6, z: 6 }, { x: 5, z: 6 }, { x: 6, z: 5 }],
    enemies: [
      { id: 'e1', pos: { x: 10, z: 10 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e2', pos: { x: 10, z: 1 }, hp: 40, weapon: { ...rifle }, color: '#78350f' },
      { id: 'e3', pos: { x: 1, z: 10 }, hp: 40, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'b1', pos: { x: 4, z: 4 } }, { id: 'b2', pos: { x: 7, z: 7 } }],
    exit: { x: 5, z: 10 },
  },
  // Level 9
  {
    id: 9,
    theme: 'industrial',
    gridSize: { width: 14, height: 10 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(14, 10), { x: 7, z: 1 }, { x: 7, z: 2 }, { x: 7, z: 7 }, { x: 7, z: 8 }],
    enemies: [
      { id: 'e1', pos: { x: 12, z: 1 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e2', pos: { x: 12, z: 8 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e3', pos: { x: 8, z: 4 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e4', pos: { x: 8, z: 5 }, hp: 20, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'b1', pos: { x: 9, z: 1 } }, { id: 'b2', pos: { x: 9, z: 8 } }],
    exit: { x: 12, z: 4 },
  },
  // Level 10: Final Industrial Room
  {
    id: 10,
    theme: 'industrial',
    gridSize: { width: 16, height: 16 },
    playerSpawn: { x: 8, z: 14 },
    walls: [...createBoxRoom(16, 16), { x: 6, z: 8 }, { x: 7, z: 8 }, { x: 8, z: 8 }, { x: 9, z: 8 }],
    enemies: [
      { id: 'boss', pos: { x: 8, z: 2 }, hp: 120, weapon: { ...rifle, damage: 25, ammo: 100, maxAmmo: 100 }, color: '#78350f' },
      { id: 'e1', pos: { x: 2, z: 2 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e2', pos: { x: 14, z: 2 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'e3', pos: { x: 2, z: 8 }, hp: 30, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'e4', pos: { x: 14, z: 8 }, hp: 30, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'b1', pos: { x: 7, z: 4 } }, { id: 'b2', pos: { x: 9, z: 4 } }],
    exit: { x: 8, z: 1 },
  },
  // Level 11: Garden Entrance
  {
    id: 11,
    theme: 'garden',
    gridSize: { width: 10, height: 10 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(10, 10), { x: 5, z: 5 }],
    enemies: [{ id: 'ge1', pos: { x: 8, z: 8 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' }],
    barrels: [],
    healthBoxes: [{ id: 'h11', pos: { x: 8, z: 1 } }],
    exit: { x: 1, z: 8 },
  },
  // Level 12: Garden Path
  {
    id: 12,
    theme: 'garden',
    gridSize: { width: 12, height: 8 },
    playerSpawn: { x: 1, z: 4 },
    walls: [...createBoxRoom(12, 8), { x: 4, z: 3 }, { x: 4, z: 4 }, { x: 4, z: 5 }],
    enemies: [
      { id: 'ge1', pos: { x: 10, z: 2 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'ge2', pos: { x: 10, z: 6 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 6, z: 4 } }],
    exit: { x: 10, z: 4 },
  },
  // Level 13: Garden Maze
  {
    id: 13,
    theme: 'garden',
    gridSize: { width: 12, height: 12 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(12, 12), { x: 3, z: 3 }, { x: 3, z: 4 }, { x: 3, z: 5 }, { x: 8, z: 8 }, { x: 8, z: 7 }, { x: 8, z: 6 }],
    enemies: [
      { id: 'ge1', pos: { x: 10, z: 10 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge2', pos: { x: 1, z: 10 }, hp: 40, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [],
    healthBoxes: [{ id: 'h13', pos: { x: 10, z: 1 } }],
    exit: { x: 6, z: 6 },
  },
  // Level 14: Garden Courtyard
  {
    id: 14,
    theme: 'garden',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 7, z: 1 },
    walls: [...createBoxRoom(14, 14), { x: 4, z: 7 }, { x: 10, z: 7 }, { x: 7, z: 4 }, { x: 7, z: 10 }],
    enemies: [
      { id: 'ge1', pos: { x: 2, z: 2 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'ge2', pos: { x: 12, z: 2 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'ge3', pos: { x: 2, z: 12 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'ge4', pos: { x: 12, z: 12 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 7, z: 7 } }],
    exit: { x: 7, z: 12 },
  },
  // Level 15: Overgrown
  {
    id: 15,
    theme: 'garden',
    gridSize: { width: 10, height: 16 },
    playerSpawn: { x: 1, z: 14 },
    walls: [...createBoxRoom(10, 16), { x: 3, z: 3 }, { x: 4, z: 3 }, { x: 5, z: 3 }, { x: 6, z: 3 }],
    enemies: [
      { id: 'ge1', pos: { x: 1, z: 1 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
      { id: 'ge2', pos: { x: 8, z: 1 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 5, z: 8 } }],
    healthBoxes: [{ id: 'h15', pos: { x: 8, z: 14 } }],
    exit: { x: 5, z: 1 },
  },
  // Level 16: Garden Ambush
  {
    id: 16,
    theme: 'garden',
    gridSize: { width: 12, height: 12 },
    playerSpawn: { x: 6, z: 6 },
    walls: [...createBoxRoom(12, 12)],
    enemies: [
      { id: 'ge1', pos: { x: 1, z: 1 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge2', pos: { x: 10, z: 1 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge3', pos: { x: 1, z: 10 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge4', pos: { x: 10, z: 10 }, hp: 40, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [],
    exit: { x: 6, z: 10 },
  },
  // Level 17: Greenhouse
  {
    id: 17,
    theme: 'garden',
    gridSize: { width: 16, height: 10 },
    playerSpawn: { x: 1, z: 5 },
    walls: [...createBoxRoom(16, 10), { x: 8, z: 1 }, { x: 8, z: 2 }, { x: 8, z: 3 }, { x: 8, z: 7 }, { x: 8, z: 8 }, { x: 8, z: 9 }],
    enemies: [
      { id: 'ge1', pos: { x: 14, z: 2 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'ge2', pos: { x: 14, z: 8 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 10, z: 5 } }],
    healthBoxes: [{ id: 'h17', pos: { x: 4, z: 5 } }],
    exit: { x: 14, z: 5 },
  },
  // Level 18: Garden Gauntlet
  {
    id: 18,
    theme: 'garden',
    gridSize: { width: 10, height: 20 },
    playerSpawn: { x: 5, z: 18 },
    walls: [...createBoxRoom(10, 20), { x: 3, z: 10 }, { x: 4, z: 10 }, { x: 6, z: 10 }, { x: 7, z: 10 }],
    enemies: [
      { id: 'ge1', pos: { x: 2, z: 5 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'ge2', pos: { x: 8, z: 5 }, hp: 40, weapon: { ...defaultPistol }, color: '#ef4444' },
      { id: 'ge3', pos: { x: 5, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 5, z: 12 } }],
    exit: { x: 5, z: 1 },
  },
  // Level 19: Floral Defense
  {
    id: 19,
    theme: 'garden',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 2, z: 2 },
    walls: [...createBoxRoom(14, 14), { x: 7, z: 7 }],
    enemies: [
      { id: 'ge1', pos: { x: 12, z: 12 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge2', pos: { x: 12, z: 1 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge3', pos: { x: 1, z: 12 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 10, z: 6 } }, { id: 'gb2', pos: { x: 6, z: 10 } }],
    healthBoxes: [{ id: 'h19', pos: { x: 7, z: 7 } }],
    exit: { x: 7, z: 1 },
  },
  // Level 20: Garden Master
  {
    id: 20,
    theme: 'garden',
    gridSize: { width: 18, height: 18 },
    playerSpawn: { x: 9, z: 16 },
    walls: [...createBoxRoom(18, 18), { x: 9, z: 9 }],
    enemies: [
      { id: 'gmaster', pos: { x: 9, z: 2 }, hp: 200, weapon: { ...rifle, damage: 20, ammo: 200, maxAmmo: 200 }, color: '#78350f' },
      { id: 'ge1', pos: { x: 2, z: 2 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge2', pos: { x: 16, z: 2 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge3', pos: { x: 2, z: 16 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'ge4', pos: { x: 16, z: 16 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'gb1', pos: { x: 5, z: 5 } }, { id: 'gb2', pos: { x: 13, z: 5 } }, { id: 'gb3', pos: { x: 5, z: 13 } }, { id: 'gb4', pos: { x: 13, z: 13 } }],
    exit: { x: 9, z: 1 },
  },
  // Level 21: Rooftop
  {
    id: 21,
    theme: 'skyscraper',
    gridSize: { width: 10, height: 10 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(10, 10)],
    enemies: [{ id: 'se1', pos: { x: 8, z: 8 }, hp: 60, weapon: { ...rifle }, color: '#78350f' }],
    barrels: [{ id: 'sb1', pos: { x: 5, z: 5 } }],
    healthBoxes: [{ id: 'h21', pos: { x: 8, z: 1 } }],
    exit: { x: 1, z: 8 },
  },
  // Level 22: High-Rise Hall
  {
    id: 22,
    theme: 'skyscraper',
    gridSize: { width: 14, height: 8 },
    playerSpawn: { x: 1, z: 4 },
    walls: [...createBoxRoom(14, 8), { x: 7, z: 1 }, { x: 7, z: 2 }, { x: 7, z: 5 }, { x: 7, z: 6 }],
    enemies: [
      { id: 'se1', pos: { x: 12, z: 2 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 12, z: 5 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [],
    exit: { x: 12, z: 4 },
  },
  // Level 23: Sky Deck
  {
    id: 23,
    theme: 'skyscraper',
    gridSize: { width: 12, height: 12 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(12, 12), { x: 4, z: 4 }, { x: 4, z: 5 }, { x: 4, z: 6 }, { x: 4, z: 7 }, { x: 7, z: 4 }, { x: 7, z: 5 }, { x: 7, z: 6 }, { x: 7, z: 7 }],
    enemies: [
      { id: 'se1', pos: { x: 10, z: 10 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 1, z: 10 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 6, z: 6 } }],
    healthBoxes: [{ id: 'h23', pos: { x: 10, z: 1 } }],
    exit: { x: 6, z: 1 },
  },
  // Level 24: Penthouse
  {
    id: 24,
    theme: 'skyscraper',
    gridSize: { width: 16, height: 16 },
    playerSpawn: { x: 8, z: 14 },
    walls: [...createBoxRoom(16, 16), { x: 4, z: 4 }, { x: 11, z: 4 }, { x: 4, z: 11 }, { x: 11, z: 11 }],
    enemies: [
      { id: 'se1', pos: { x: 2, z: 2 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'se2', pos: { x: 13, z: 2 }, hp: 50, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'se3', pos: { x: 8, z: 8 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 8, z: 4 } }, { id: 'sb2', pos: { x: 8, z: 11 } }],
    exit: { x: 8, z: 1 },
  },
  // Level 25: Crane View
  {
    id: 25,
    theme: 'skyscraper',
    gridSize: { width: 10, height: 18 },
    playerSpawn: { x: 1, z: 16 },
    walls: [...createBoxRoom(10, 18), { x: 5, z: 9 }],
    enemies: [
      { id: 'se1', pos: { x: 8, z: 2 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 1, z: 2 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 5, z: 5 } }],
    healthBoxes: [{ id: 'h25', pos: { x: 8, z: 16 } }],
    exit: { x: 5, z: 1 },
  },
  // Level 26: Sky Bridge
  {
    id: 26,
    theme: 'skyscraper',
    gridSize: { width: 20, height: 8 },
    playerSpawn: { x: 1, z: 4 },
    walls: [...createBoxRoom(20, 8), { x: 5, z: 1 }, { x: 5, z: 2 }, { x: 5, z: 5 }, { x: 5, z: 6 }, { x: 15, z: 1 }, { x: 15, z: 2 }, { x: 15, z: 5 }, { x: 15, z: 6 }],
    enemies: [
      { id: 'se1', pos: { x: 10, z: 2 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 10, z: 5 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se3', pos: { x: 18, z: 4 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 10, z: 4 } }],
    exit: { x: 18, z: 1 },
  },
  // Level 27: Observation Deck
  {
    id: 27,
    theme: 'skyscraper',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(14, 14), { x: 7, z: 7 }, { x: 6, z: 7 }, { x: 8, z: 7 }, { x: 7, z: 6 }, { x: 7, z: 8 }],
    enemies: [
      { id: 'se1', pos: { x: 12, z: 12 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 12, z: 1 }, hp: 60, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'se3', pos: { x: 1, z: 12 }, hp: 60, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [],
    healthBoxes: [{ id: 'h27', pos: { x: 7, z: 7 } }],
    exit: { x: 7, z: 1 },
  },
  // Level 28: Server Room
  {
    id: 28,
    theme: 'skyscraper',
    gridSize: { width: 16, height: 10 },
    playerSpawn: { x: 1, z: 5 },
    walls: [...createBoxRoom(16, 10), { x: 4, z: 3 }, { x: 4, z: 4 }, { x: 4, z: 5 }, { x: 4, z: 6 }, { x: 12, z: 3 }, { x: 12, z: 4 }, { x: 12, z: 5 }, { x: 12, z: 6 }],
    enemies: [
      { id: 'se1', pos: { x: 8, z: 2 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 8, z: 8 }, hp: 50, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se3', pos: { x: 14, z: 5 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 8, z: 5 } }],
    exit: { x: 14, z: 1 },
  },
  // Level 29: Helipad
  {
    id: 29,
    theme: 'skyscraper',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 7, z: 12 },
    walls: [...createBoxRoom(14, 14)],
    enemies: [
      { id: 'se1', pos: { x: 2, z: 2 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 12, z: 2 }, hp: 60, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se3', pos: { x: 7, z: 2 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 4, z: 4 } }, { id: 'sb2', pos: { x: 10, z: 4 } }],
    healthBoxes: [{ id: 'h29', pos: { x: 7, z: 7 } }],
    exit: { x: 7, z: 1 },
  },
  // Level 30: The Pinnacle
  {
    id: 30,
    theme: 'skyscraper',
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 10, z: 18 },
    walls: [...createBoxRoom(20, 20), { x: 10, z: 10 }],
    enemies: [
      { id: 'skymaster', pos: { x: 10, z: 2 }, hp: 300, weapon: { ...rifle, damage: 25, ammo: 500, maxAmmo: 500 }, color: '#78350f' },
      { id: 'se1', pos: { x: 2, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se2', pos: { x: 18, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'se3', pos: { x: 2, z: 18 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'se4', pos: { x: 18, z: 18 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'sb1', pos: { x: 5, z: 5 } }, { id: 'sb2', pos: { x: 15, z: 5 } }, { id: 'sb3', pos: { x: 5, z: 15 } }, { id: 'sb4', pos: { x: 15, z: 15 } }],
    ammoBoxes: [{ id: 'a30', pos: { x: 10, z: 2 } }],
    exit: { x: 10, z: 1 },
  },
  // Level 31: Oasis Outpost
  {
    id: 31,
    theme: 'desert',
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 2, z: 2 },
    walls: [...createBoxRoom(20, 20), { x: 10, z: 10 }, { x: 10, z: 9 }, { x: 10, z: 11 }, { x: 9, z: 10 }, { x: 11, z: 10 }, { x: 5, z: 5 }, { x: 15, z: 15 }, { x: 5, z: 15 }, { x: 15, z: 5 }],
    enemies: [
      { id: 'de1', pos: { x: 15, z: 15 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 15, z: 5 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de3', pos: { x: 5, z: 15 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 18, z: 18 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'db1', pos: { x: 10, z: 12 } }],
    ammoBoxes: [{ id: 'a31', pos: { x: 18, z: 2 } }],
    healthBoxes: [{ id: 'h31', pos: { x: 2, z: 18 } }],
    exit: { x: 18, z: 10 },
  },
  // Level 32: Canyon Pass
  {
    id: 32,
    theme: 'desert',
    gridSize: { width: 24, height: 12 },
    playerSpawn: { x: 2, z: 6 },
    walls: [...createBoxRoom(24, 12), { x: 8, z: 1 }, { x: 8, z: 2 }, { x: 8, z: 3 }, { x: 8, z: 4 }, { x: 16, z: 7 }, { x: 16, z: 8 }, { x: 16, z: 9 }, { x: 16, z: 10 }, { x: 4, z: 4 }, { x: 20, z: 8 }, { x: 12, z: 1 }, { x: 12, z: 10 }],
    enemies: [
      { id: 'de1', pos: { x: 12, z: 3 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 12, z: 9 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 20, z: 6 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 6, z: 2 }, hp: 70, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'db1', pos: { x: 16, z: 4 } }],
    ammoBoxes: [{ id: 'a32', pos: { x: 12, z: 6 } }],
    healthBoxes: [{ id: 'h32', pos: { x: 22, z: 10 } }],
    exit: { x: 22, z: 2 },
  },
  // Level 33: Dune Fort
  {
    id: 33,
    theme: 'desert',
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 10, z: 18 },
    walls: [...createBoxRoom(20, 20), { x: 5, z: 5 }, { x: 6, z: 5 }, { x: 7, z: 5 }, { x: 13, z: 5 }, { x: 14, z: 5 }, { x: 15, z: 5 }, { x: 5, z: 15 }, { x: 6, z: 15 }, { x: 7, z: 15 }, { x: 13, z: 15 }, { x: 14, z: 15 }, { x: 15, z: 15 }, { x: 5, z: 10 }, { x: 15, z: 10 }],
    enemies: [
      { id: 'de1', pos: { x: 2, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 18, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 10, z: 5 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 5, z: 10 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de5', pos: { x: 15, z: 10 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'db1', pos: { x: 10, z: 10 } }],
    ammoBoxes: [{ id: 'a33', pos: { x: 2, z: 18 } }],
    healthBoxes: [{ id: 'h33', pos: { x: 18, z: 18 } }],
    exit: { x: 10, z: 1 },
  },
  // Level 34: Sandstorm Station
  {
    id: 34,
    theme: 'desert',
    gridSize: { width: 18, height: 24 },
    playerSpawn: { x: 9, z: 22 },
    walls: [...createBoxRoom(18, 24), { x: 9, z: 12 }, { x: 8, z: 12 }, { x: 10, z: 12 }, { x: 4, z: 6 }, { x: 14, z: 6 }, { x: 4, z: 18 }, { x: 14, z: 18 }, { x: 1, z: 12 }, { x: 2, z: 12 }, { x: 16, z: 12 }, { x: 17, z: 12 }],
    enemies: [
      { id: 'de1', pos: { x: 2, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 16, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 2, z: 12 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 16, z: 12 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de5', pos: { x: 9, z: 6 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'db1', pos: { x: 9, z: 18 } }],
    ammoBoxes: [{ id: 'a34', pos: { x: 2, z: 22 } }],
    healthBoxes: [{ id: 'h34', pos: { x: 16, z: 22 } }],
    exit: { x: 9, z: 1 },
  },
  // Level 35: Dust Pit
  {
    id: 35,
    theme: 'desert',
    gridSize: { width: 22, height: 14 },
    playerSpawn: { x: 2, z: 7 },
    walls: [...createBoxRoom(22, 14), { x: 11, z: 1 }, { x: 11, z: 2 }, { x: 11, z: 3 }, { x: 11, z: 4 }, { x: 11, z: 10 }, { x: 11, z: 11 }, { x: 11, z: 12 }, { x: 11, z: 13 }, { x: 5, z: 7 }, { x: 17, z: 7 }, { x: 5, z: 3 }, { x: 5, z: 11 }, { x: 17, z: 3 }, { x: 17, z: 11 }],
    enemies: [
      { id: 'de1', pos: { x: 18, z: 3 }, hp: 90, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 18, z: 11 }, hp: 90, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 14, z: 7 }, hp: 90, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de4', pos: { x: 6, z: 3 }, hp: 70, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de5', pos: { x: 6, z: 11 }, hp: 70, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'db1', pos: { x: 11, z: 7 } }],
    ammoBoxes: [{ id: 'a35', pos: { x: 2, z: 2 } }],
    healthBoxes: [{ id: 'h35', pos: { x: 2, z: 12 } }],
    exit: { x: 20, z: 7 },
  },
  // Level 36: Arid Arena
  {
    id: 36,
    theme: 'desert',
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 10, z: 10 },
    walls: [...createBoxRoom(20, 20), { x: 5, z: 5 }, { x: 15, z: 5 }, { x: 5, z: 15 }, { x: 15, z: 15 }, { x: 10, z: 5 }, { x: 10, z: 15 }, { x: 5, z: 10 }, { x: 15, z: 10 }],
    enemies: [
      { id: 'de1', pos: { x: 2, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 18, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 2, z: 18 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 18, z: 18 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de5', pos: { x: 10, z: 2 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de6', pos: { x: 10, z: 18 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'db1', pos: { x: 5, z: 5 } }, { id: 'db2', pos: { x: 15, z: 5 } }, { id: 'db3', pos: { x: 5, z: 15 } }, { id: 'db4', pos: { x: 15, z: 15 } }],
    ammoBoxes: [{ id: 'a36', pos: { x: 2, z: 10 } }],
    healthBoxes: [{ id: 'h36', pos: { x: 18, z: 10 } }],
    exit: { x: 18, z: 18 },
  },
  // Level 37: Scorpion Nest
  {
    id: 37,
    theme: 'desert',
    gridSize: { width: 22, height: 22 },
    playerSpawn: { x: 2, z: 2 },
    walls: [...createBoxRoom(22, 22), { x: 11, z: 11 }, { x: 10, z: 11 }, { x: 12, z: 11 }, { x: 11, z: 10 }, { x: 11, z: 12 }, { x: 5, z: 5 }, { x: 17, z: 5 }, { x: 5, z: 17 }, { x: 17, z: 17 }, { x: 11, z: 3 }, { x: 11, z: 19 }],
    enemies: [
      { id: 'de1', pos: { x: 20, z: 20 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 20, z: 2 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de3', pos: { x: 2, z: 20 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de4', pos: { x: 11, z: 5 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de5', pos: { x: 5, z: 11 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de6', pos: { x: 11, z: 17 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de7', pos: { x: 17, z: 11 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [{ id: 'db1', pos: { x: 11, z: 11 } }],
    ammoBoxes: [{ id: 'a37', pos: { x: 20, z: 11 } }],
    healthBoxes: [{ id: 'h37', pos: { x: 11, z: 20 } }],
    exit: { x: 20, z: 20 },
  },
  // Level 38: Heat Haze
  {
    id: 38,
    theme: 'desert',
    gridSize: { width: 16, height: 28 },
    playerSpawn: { x: 8, z: 26 },
    walls: [...createBoxRoom(16, 28), { x: 1, z: 14 }, { x: 2, z: 14 }, { x: 3, z: 14 }, { x: 4, z: 14 }, { x: 5, z: 14 }, { x: 6, z: 14 }, { x: 10, z: 14 }, { x: 11, z: 14 }, { x: 12, z: 14 }, { x: 13, z: 14 }, { x: 14, z: 14 }, { x: 15, z: 14 }, { x: 8, z: 7 }, { x: 8, z: 21 }, { x: 1, z: 7 }, { x: 15, z: 7 }, { x: 1, z: 21 }, { x: 15, z: 21 }],
    enemies: [
      { id: 'de1', pos: { x: 8, z: 2 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 3, z: 5 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 13, z: 5 }, hp: 80, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 3, z: 20 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de5', pos: { x: 13, z: 20 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de6', pos: { x: 8, z: 10 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
    ],
    barrels: [],
    ammoBoxes: [{ id: 'a38', pos: { x: 8, z: 14 } }],
    healthBoxes: [{ id: 'h38', pos: { x: 8, z: 20 } }],
    exit: { x: 8, z: 1 },
  },
  // Level 39: Mirage Mesa
  {
    id: 39,
    theme: 'desert',
    gridSize: { width: 24, height: 24 },
    playerSpawn: { x: 2, z: 2 },
    walls: [...createBoxRoom(24, 24), { x: 12, z: 12 }, { x: 6, z: 6 }, { x: 18, z: 6 }, { x: 6, z: 18 }, { x: 18, z: 18 }, { x: 12, z: 4 }, { x: 12, z: 20 }, { x: 4, z: 12 }, { x: 20, z: 12 }],
    enemies: [
      { id: 'de1', pos: { x: 22, z: 22 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 22, z: 2 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 2, z: 22 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 12, z: 6 }, hp: 90, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de5', pos: { x: 6, z: 12 }, hp: 90, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de6', pos: { x: 18, z: 12 }, hp: 90, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de7', pos: { x: 12, z: 18 }, hp: 90, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'db1', pos: { x: 15, z: 15 } }, { id: 'db2', pos: { x: 9, z: 9 } }],
    ammoBoxes: [{ id: 'a39', pos: { x: 12, z: 12 } }],
    healthBoxes: [{ id: 'h39', pos: { x: 22, z: 12 } }],
    exit: { x: 22, z: 22 },
  },
  // Level 40: Emperor of the Dunes
  {
    id: 40,
    theme: 'desert',
    gridSize: { width: 26, height: 26 },
    playerSpawn: { x: 13, z: 24 },
    walls: [...createBoxRoom(26, 26), { x: 13, z: 13 }, { x: 6, z: 6 }, { x: 20, z: 6 }, { x: 6, z: 20 }, { x: 20, z: 20 }, { x: 13, z: 6 }, { x: 13, z: 20 }, { x: 6, z: 13 }, { x: 20, z: 13 }],
    enemies: [
      { id: 'desert_boss', pos: { x: 13, z: 3 }, hp: 600, weapon: { ...rifle, damage: 35, ammo: 2000, maxAmmo: 2000 }, color: '#78350f' },
      { id: 'de1', pos: { x: 3, z: 3 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de2', pos: { x: 23, z: 3 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de3', pos: { x: 3, z: 23 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de4', pos: { x: 23, z: 23 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 'de5', pos: { x: 8, z: 8 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de6', pos: { x: 18, z: 8 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de7', pos: { x: 8, z: 18 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
      { id: 'de8', pos: { x: 18, z: 18 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
    ],
    barrels: [{ id: 'db1', pos: { x: 13, z: 8 } }, { id: 'db2', pos: { x: 13, z: 18 } }, { id: 'db3', pos: { x: 8, z: 13 } }, { id: 'db4', pos: { x: 15, z: 11 } }],
    ammoBoxes: [
      { id: 'a40', pos: { x: 11, z: 13 } },
      { id: 'a40_2', pos: { x: 3, z: 13 } },
      { id: 'a40_3', pos: { x: 23, z: 13 } },
      { id: 'a40_4', pos: { x: 13, z: 11 } }
    ],
    healthBoxes: [{ id: 'h40', pos: { x: 15, z: 20 } }],
    exit: { x: 13, z: 1 },
  },
  // Level 41: Airlock
  {
    id: 41,
    theme: 'space_station',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(14, 14), { x: 7, z: 1 }, { x: 7, z: 2 }, { x: 7, z: 3 }, { x: 7, z: 4 }, { x: 7, z: 5 }, { x: 7, z: 6 }, { x: 7, z: 8 }, { x: 7, z: 9 }, { x: 7, z: 10 }, { x: 7, z: 11 }, { x: 7, z: 12 }, { x: 7, z: 13 }],
    enemies: [
      { id: 's1', pos: { x: 12, z: 7 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
    ],
    portal: { id: 'p41', posA: { x: 1, z: 12 }, posB: { x: 12, z: 12 } },
    ammoBoxes: [{ id: 'a41', pos: { x: 12, z: 1 } }],
    exit: { x: 12, z: 2 },
  },
  // Level 42: Decompression
  {
    id: 42,
    theme: 'space_station',
    gridSize: { width: 20, height: 10 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(20, 10), { x: 10, z: 1 }, { x: 10, z: 2 }, { x: 10, z: 3 }, { x: 10, z: 4 }, { x: 10, z: 5 }, { x: 10, z: 6 }, { x: 10, z: 7 }, { x: 10, z: 8 }],
    enemies: [
      { id: 's1', pos: { x: 18, z: 1 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 18, z: 8 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
    ],
    portal: { id: 'p42', posA: { x: 1, z: 8 }, posB: { x: 12, z: 5 } },
    healthBoxes: [{ id: 'h42', pos: { x: 18, z: 5 } }],
    exit: { x: 18, z: 3 },
  },
  // Level 43: Gravity Well
  {
    id: 43,
    theme: 'space_station',
    gridSize: { width: 16, height: 16 },
    playerSpawn: { x: 8, z: 8 },
    walls: [...createBoxRoom(16, 16), { x: 6, z: 6 }, { x: 10, z: 6 }, { x: 6, z: 10 }, { x: 10, z: 10 }],
    enemies: [
      { id: 's1', pos: { x: 2, z: 2 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 13, z: 2 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 2, z: 13 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's4', pos: { x: 13, z: 13 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
    ],
    portal: { id: 'p43', posA: { x: 1, z: 8 }, posB: { x: 14, z: 8 } },
    ammoBoxes: [
      { id: 'a43_1', pos: { x: 8, z: 8 } },
      { id: 'a43_2', pos: { x: 14, z: 1 } },
      { id: 'a43_3', pos: { x: 1, z: 14 } },
      { id: 'a43_4', pos: { x: 14, z: 14 } }
    ],
    exit: { x: 1, z: 1 },
  },
  // Level 44: Lab Access
  {
    id: 44,
    theme: 'space_station',
    gridSize: { width: 24, height: 14 },
    playerSpawn: { x: 2, z: 2 },
    walls: [...createBoxRoom(24, 14), { x: 12, z: 1 }, { x: 12, z: 2 }, { x: 12, z: 3 }, { x: 12, z: 4 }, { x: 12, z: 5 }, { x: 12, z: 9 }, { x: 12, z: 10 }, { x: 12, z: 11 }, { x: 12, z: 12 }],
    enemies: [
      { id: 's1', pos: { x: 20, z: 2 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 20, z: 11 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 14, z: 7 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
    ],
    portal: { id: 'p44', posA: { x: 2, z: 11 }, posB: { x: 14, z: 2 } },
    ammoBoxes: [{ id: 'a44', pos: { x: 22, z: 7 } }],
    exit: { x: 22, z: 12 },
  },
  // Level 45: Zero-G Array
  {
    id: 45,
    theme: 'space_station',
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 10, z: 10 },
    walls: [...createBoxRoom(20, 20), { x: 5, z: 5 }, { x: 15, z: 5 }, { x: 5, z: 15 }, { x: 15, z: 15 }],
    enemies: [
      { id: 's1', pos: { x: 2, z: 2 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 17, z: 2 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 2, z: 17 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
      { id: 's4', pos: { x: 17, z: 17 }, hp: 100, weapon: { ...rifle }, color: '#78350f' },
    ],
    portal: { id: 'p45', posA: { x: 10, z: 1 }, posB: { x: 10, z: 18 } },
    healthBoxes: [{ id: 'h45', pos: { x: 10, z: 10 } }],
    ammoBoxes: [{ id: 'a45', pos: { x: 15, z: 10 } }],
    exit: { x: 18, z: 10 },
  },
  // Level 46: Core Cooling
  {
    id: 46,
    theme: 'space_station',
    gridSize: { width: 26, height: 12 },
    playerSpawn: { x: 2, z: 6 },
    walls: [...createBoxRoom(26, 12), { x: 13, z: 1 }, { x: 13, z: 2 }, { x: 13, z: 3 }, { x: 13, z: 4 }, { x: 13, z: 5 }, { x: 13, z: 7 }, { x: 13, z: 8 }, { x: 13, z: 9 }, { x: 13, z: 10 }],
    enemies: [
      { id: 's1', pos: { x: 20, z: 3 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 20, z: 9 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 8, z: 3 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
      { id: 's4', pos: { x: 8, z: 9 }, hp: 80, weapon: { ...shotgun }, color: '#f97316' },
    ],
    portal: { id: 'p46', posA: { x: 2, z: 2 }, posB: { x: 24, z: 10 } },
    ammoBoxes: [{ id: 'a46', pos: { x: 24, z: 2 } }],
    exit: { x: 24, z: 6 },
  },
  // Level 47: Command Deck
  {
    id: 47,
    theme: 'space_station',
    gridSize: { width: 22, height: 22 },
    playerSpawn: { x: 11, z: 20 },
    walls: [...createBoxRoom(22, 22), { x: 11, z: 11 }, { x: 10, z: 11 }, { x: 12, z: 11 }, { x: 11, z: 10 }, { x: 11, z: 12 }],
    enemies: [
      { id: 's1', pos: { x: 3, z: 3 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 18, z: 3 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 3, z: 18 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
      { id: 's4', pos: { x: 18, z: 18 }, hp: 120, weapon: { ...rifle }, color: '#78350f' },
    ],
    portal: { id: 'p47', posA: { x: 2, z: 11 }, posB: { x: 19, z: 11 } },
    healthBoxes: [{ id: 'h47', pos: { x: 11, z: 8 } }],
    exit: { x: 11, z: 3 },
  },
  // Level 48: Reactor Hall
  {
    id: 48,
    theme: 'space_station',
    gridSize: { width: 18, height: 28 },
    playerSpawn: { x: 9, z: 26 },
    walls: [...createBoxRoom(18, 28), { x: 9, z: 14 }, { x: 8, z: 14 }, { x: 10, z: 14 }, { x: 7, z: 14 }, { x: 11, z: 14 }],
    enemies: [
      { id: 's1', pos: { x: 2, z: 2 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 15, z: 2 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 2, z: 12 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
      { id: 's4', pos: { x: 15, z: 12 }, hp: 100, weapon: { ...shotgun }, color: '#f97316' },
    ],
    portal: { id: 'p48', posA: { x: 9, z: 20 }, posB: { x: 9, z: 4 } },
    ammoBoxes: [{ id: 'a48', pos: { x: 2, z: 26 } }],
    exit: { x: 9, z: 1 },
  },
  // Level 49: Observation Hub
  {
    id: 49,
    theme: 'space_station',
    gridSize: { width: 24, height: 24 },
    playerSpawn: { x: 2, z: 2 },
    walls: [...createBoxRoom(24, 24), { x: 12, z: 12 }],
    enemies: [
      { id: 's1', pos: { x: 21, z: 2 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 21, z: 21 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 2, z: 21 }, hp: 150, weapon: { ...rifle }, color: '#78350f' },
      { id: 's4', pos: { x: 12, z: 12 }, hp: 200, weapon: { ...rifle }, color: '#78350f' },
    ],
    portal: { id: 'p49', posA: { x: 1, z: 12 }, posB: { x: 22, z: 12 } },
    healthBoxes: [{ id: 'h49', pos: { x: 21, z: 12 } }],
    ammoBoxes: [{ id: 'a49', pos: { x: 12, z: 21 } }],
    exit: { x: 22, z: 22 },
  },
  // Level 50: The Singularity
  {
    id: 50,
    theme: 'space_station',
    gridSize: { width: 30, height: 30 },
    playerSpawn: { x: 15, z: 28 },
    walls: [...createBoxRoom(30, 30), { x: 15, z: 15 }],
    enemies: [
      { id: 'overlord', pos: { x: 15, z: 5 }, hp: 1000, weapon: { ...rifle, damage: 40, ammo: 5000, maxAmmo: 5000 }, color: '#78350f' },
      { id: 's1', pos: { x: 5, z: 5 }, hp: 200, weapon: { ...rifle }, color: '#78350f' },
      { id: 's2', pos: { x: 25, z: 5 }, hp: 200, weapon: { ...rifle }, color: '#78350f' },
      { id: 's3', pos: { x: 5, z: 25 }, hp: 200, weapon: { ...rifle }, color: '#78350f' },
      { id: 's4', pos: { x: 25, z: 25 }, hp: 200, weapon: { ...rifle }, color: '#78350f' },
    ],
    portal: { id: 'p50', posA: { x: 2, z: 15 }, posB: { x: 27, z: 15 } },
    ammoBoxes: [{ id: 'a50', pos: { x: 15, z: 10 } }],
    healthBoxes: [{ id: 'h50', pos: { x: 2, z: 28 } }],
    exit: { x: 15, z: 1 },
  },
  // Level 51: Tidal Breach — Intro to dual-weapon era, multiple flanking enemies
  {
    id: 51,
    theme: 'beach',
    gridSize: { width: 16, height: 16 },
    playerSpawn: { x: 1, z: 14 },
    walls: [
      ...createBoxRoom(16, 16),
      { x: 5, z: 5 }, { x: 5, z: 6 }, { x: 5, z: 7 }, { x: 5, z: 8 },
      { x: 10, z: 8 }, { x: 10, z: 9 }, { x: 10, z: 10 }, { x: 10, z: 11 },
      { x: 8, z: 3 }, { x: 8, z: 4 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 14, z: 14 }, hp: 120, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 14, z: 2 }, hp: 120, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 8, z: 8 }, hp: 100, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 3, z: 3 }, hp: 80, weapon: { ...shotgun }, color: '#3b82f6' },
    ],
    turrets: [{ id: 'bt1', pos: { x: 14, z: 8 }, hp: 300, damage: 15, fireRate: 800, color: '#3b82f6' }],
    buttons: [{ pos: { x: 1, z: 1 }, targetId: 'bt1' }],
    barrels: [{ id: 'bb51_1', pos: { x: 7, z: 7 } }, { id: 'bb51_2', pos: { x: 12, z: 12 } }],
    healthBoxes: [{ id: 'bh51', pos: { x: 8, z: 14 } }],
    exit: { x: 14, z: 1 },
  },
  // Level 52: Coral Corridor — Tight hallways with crossfire
  {
    id: 52,
    theme: 'beach',
    gridSize: { width: 22, height: 12 },
    playerSpawn: { x: 1, z: 6 },
    walls: [
      ...createBoxRoom(22, 12),
      { x: 6, z: 1 }, { x: 6, z: 2 }, { x: 6, z: 3 }, { x: 6, z: 4 },
      { x: 6, z: 7 }, { x: 6, z: 8 }, { x: 6, z: 9 }, { x: 6, z: 10 },
      { x: 11, z: 1 }, { x: 11, z: 2 }, { x: 11, z: 9 }, { x: 11, z: 10 },
      { x: 16, z: 3 }, { x: 16, z: 4 }, { x: 16, z: 7 }, { x: 16, z: 8 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 4, z: 2 }, hp: 100, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 4, z: 9 }, hp: 100, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 9, z: 6 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 14, z: 2 }, hp: 120, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 20, z: 6 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 11, z: 6 }, hp: 350, damage: 15, fireRate: 700, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 20, z: 2 }, hp: 300, damage: 20, fireRate: 1200, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 8, z: 6 }, targetId: 'bt1' },
      { pos: { x: 18, z: 10 }, targetId: 'bt2' },
    ],
    barrels: [{ id: 'bb52_1', pos: { x: 9, z: 2 } }, { id: 'bb52_2', pos: { x: 9, z: 9 } }, { id: 'bb52_3', pos: { x: 14, z: 6 } }],
    ammoBoxes: [{ id: 'ba52', pos: { x: 16, z: 6 } }],
    exit: { x: 20, z: 10 },
  },
  // Level 53: Sunken Fortress — Large arena with inner fortress and portal
  {
    id: 53,
    theme: 'beach',
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 1, z: 18 },
    walls: [
      ...createBoxRoom(20, 20),
      { x: 7, z: 7 }, { x: 8, z: 7 }, { x: 9, z: 7 }, { x: 10, z: 7 }, { x: 11, z: 7 }, { x: 12, z: 7 },
      { x: 7, z: 12 }, { x: 8, z: 12 }, { x: 9, z: 12 }, { x: 10, z: 12 }, { x: 11, z: 12 }, { x: 12, z: 12 },
      { x: 7, z: 8 }, { x: 7, z: 9 }, { x: 7, z: 10 }, { x: 7, z: 11 },
      { x: 12, z: 8 }, { x: 12, z: 9 }, { x: 12, z: 10 }, { x: 12, z: 11 },
      { x: 4, z: 4 }, { x: 15, z: 4 }, { x: 4, z: 15 }, { x: 15, z: 15 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 10, z: 10 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 3, z: 3 }, hp: 120, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 17, z: 3 }, hp: 120, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 3, z: 16 }, hp: 120, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 17, z: 16 }, hp: 120, weapon: { ...rifle }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 10, z: 7 }, hp: 400, damage: 20, fireRate: 1000, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 10, z: 12 }, hp: 400, damage: 20, fireRate: 1000, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 18, z: 18 }, targetId: 'bt1' },
      { pos: { x: 1, z: 1 }, targetId: 'bt2' },
    ],
    portal: { id: 'p53', posA: { x: 1, z: 10 }, posB: { x: 18, z: 10 } },
    barrels: [{ id: 'bb53_1', pos: { x: 10, z: 4 } }, { id: 'bb53_2', pos: { x: 10, z: 15 } }, { id: 'bb53_3', pos: { x: 4, z: 10 } }],
    healthBoxes: [{ id: 'bh53', pos: { x: 18, z: 1 } }],
    ammoBoxes: [{ id: 'ba53', pos: { x: 10, z: 18 } }],
    exit: { x: 10, z: 1 },
  },
  // Level 54: Riptide Gauntlet — Long deadly gauntlet with turret crossfire
  {
    id: 54,
    theme: 'beach',
    gridSize: { width: 12, height: 28 },
    playerSpawn: { x: 6, z: 26 },
    walls: [
      ...createBoxRoom(12, 28),
      { x: 4, z: 22 }, { x: 5, z: 22 }, { x: 6, z: 22 }, { x: 7, z: 22 },
      { x: 4, z: 16 }, { x: 5, z: 16 }, { x: 6, z: 16 }, { x: 7, z: 16 },
      { x: 4, z: 10 }, { x: 5, z: 10 }, { x: 6, z: 10 }, { x: 7, z: 10 },
      { x: 3, z: 19 }, { x: 8, z: 19 },
      { x: 3, z: 13 }, { x: 8, z: 13 },
      { x: 3, z: 7 }, { x: 8, z: 7 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 2, z: 24 }, hp: 120, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 9, z: 24 }, hp: 120, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 6, z: 19 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 2, z: 14 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 9, z: 14 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 6, z: 4 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 2, z: 19 }, hp: 350, damage: 15, fireRate: 800, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 9, z: 7 }, hp: 350, damage: 15, fireRate: 800, color: '#3b82f6' },
      { id: 'bt3', pos: { x: 6, z: 2 }, hp: 500, damage: 25, fireRate: 1500, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 9, z: 19 }, targetId: 'bt1' },
      { pos: { x: 2, z: 7 }, targetId: 'bt2' },
      { pos: { x: 6, z: 7 }, targetId: 'bt3' },
    ],
    barrels: [{ id: 'bb54_1', pos: { x: 6, z: 22 } }, { id: 'bb54_2', pos: { x: 6, z: 16 } }, { id: 'bb54_3', pos: { x: 6, z: 10 } }],
    healthBoxes: [{ id: 'bh54', pos: { x: 6, z: 13 } }],
    ammoBoxes: [{ id: 'ba54', pos: { x: 6, z: 19 } }],
    exit: { x: 6, z: 1 },
  },
  // Level 55: Tsunami Arena — Open combat arena with 8 enemies surrounding spawn
  {
    id: 55,
    theme: 'beach',
    gridSize: { width: 22, height: 22 },
    playerSpawn: { x: 11, z: 11 },
    walls: [
      ...createBoxRoom(22, 22),
      { x: 11, z: 9 }, { x: 11, z: 10 }, { x: 11, z: 12 }, { x: 11, z: 13 },
      { x: 9, z: 11 }, { x: 10, z: 11 }, { x: 12, z: 11 }, { x: 13, z: 11 },
      { x: 4, z: 4 }, { x: 5, z: 4 }, { x: 4, z: 5 },
      { x: 17, z: 4 }, { x: 16, z: 4 }, { x: 17, z: 5 },
      { x: 4, z: 17 }, { x: 5, z: 17 }, { x: 4, z: 16 },
      { x: 17, z: 17 }, { x: 16, z: 17 }, { x: 17, z: 16 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 3, z: 3 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 18, z: 3 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 3, z: 18 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 18, z: 18 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 11, z: 3 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 11, z: 18 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be7', pos: { x: 3, z: 11 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be8', pos: { x: 18, z: 11 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 5, z: 5 }, hp: 400, damage: 20, fireRate: 900, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 16, z: 16 }, hp: 400, damage: 20, fireRate: 900, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 16, z: 5 }, targetId: 'bt1' },
      { pos: { x: 5, z: 16 }, targetId: 'bt2' },
    ],
    barrels: [
      { id: 'bb55_1', pos: { x: 8, z: 8 } }, { id: 'bb55_2', pos: { x: 14, z: 8 } },
      { id: 'bb55_3', pos: { x: 8, z: 14 } }, { id: 'bb55_4', pos: { x: 14, z: 14 } },
    ],
    healthBoxes: [{ id: 'bh55', pos: { x: 11, z: 20 } }],
    ammoBoxes: [{ id: 'ba55_1', pos: { x: 1, z: 1 } }, { id: 'ba55_2', pos: { x: 20, z: 20 } }],
    exit: { x: 20, z: 1 },
  },
  // Level 56: Whirlpool Compound — Multi-room compound with portal
  {
    id: 56,
    theme: 'beach',
    gridSize: { width: 26, height: 18 },
    playerSpawn: { x: 2, z: 9 },
    walls: [
      ...createBoxRoom(26, 18),
      { x: 8, z: 1 }, { x: 8, z: 2 }, { x: 8, z: 3 }, { x: 8, z: 4 }, { x: 8, z: 5 }, { x: 8, z: 6 },
      { x: 8, z: 10 }, { x: 8, z: 11 }, { x: 8, z: 12 }, { x: 8, z: 13 }, { x: 8, z: 14 }, { x: 8, z: 15 }, { x: 8, z: 16 },
      { x: 17, z: 1 }, { x: 17, z: 2 }, { x: 17, z: 3 }, { x: 17, z: 4 }, { x: 17, z: 5 },
      { x: 17, z: 11 }, { x: 17, z: 12 }, { x: 17, z: 13 }, { x: 17, z: 14 }, { x: 17, z: 15 }, { x: 17, z: 16 },
      { x: 4, z: 4 }, { x: 4, z: 13 }, { x: 12, z: 4 }, { x: 12, z: 13 }, { x: 21, z: 9 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 4, z: 2 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 4, z: 15 }, hp: 150, weapon: { ...rifle }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 12, z: 2 }, hp: 180, weapon: { ...rifle, damage: 18 }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 12, z: 15 }, hp: 180, weapon: { ...rifle, damage: 18 }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 22, z: 3 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 22, z: 14 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be7', pos: { x: 22, z: 9 }, hp: 250, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 8, z: 9 }, hp: 500, damage: 20, fireRate: 800, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 17, z: 9 }, hp: 500, damage: 20, fireRate: 800, color: '#3b82f6' },
      { id: 'bt3', pos: { x: 24, z: 9 }, hp: 600, damage: 25, fireRate: 1200, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 6, z: 9 }, targetId: 'bt1' },
      { pos: { x: 15, z: 9 }, targetId: 'bt2' },
      { pos: { x: 20, z: 1 }, targetId: 'bt3' },
    ],
    portal: { id: 'p56', posA: { x: 2, z: 2 }, posB: { x: 20, z: 16 } },
    barrels: [{ id: 'bb56_1', pos: { x: 12, z: 9 } }, { id: 'bb56_2', pos: { x: 22, z: 9 } }],
    healthBoxes: [{ id: 'bh56', pos: { x: 15, z: 4 } }],
    ammoBoxes: [{ id: 'ba56', pos: { x: 15, z: 13 } }],
    exit: { x: 24, z: 16 },
  },
  // Level 57: Maelstrom — Circular killzone with heavy turrets
  {
    id: 57,
    theme: 'beach',
    gridSize: { width: 24, height: 24 },
    playerSpawn: { x: 12, z: 22 },
    walls: [
      ...createBoxRoom(24, 24),
      { x: 10, z: 10 }, { x: 11, z: 10 }, { x: 12, z: 10 }, { x: 13, z: 10 },
      { x: 10, z: 13 }, { x: 11, z: 13 }, { x: 12, z: 13 }, { x: 13, z: 13 },
      { x: 10, z: 11 }, { x: 10, z: 12 },
      { x: 13, z: 11 }, { x: 13, z: 12 },
      { x: 6, z: 6 }, { x: 17, z: 6 }, { x: 6, z: 17 }, { x: 17, z: 17 },
      { x: 12, z: 4 }, { x: 12, z: 19 }, { x: 4, z: 12 }, { x: 19, z: 12 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 2, z: 2 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 21, z: 2 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 2, z: 21 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 21, z: 21 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 12, z: 2 }, hp: 180, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 12, z: 21 }, hp: 180, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be7', pos: { x: 2, z: 12 }, hp: 180, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be8', pos: { x: 21, z: 12 }, hp: 180, weapon: { ...shotgun }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 6, z: 12 }, hp: 500, damage: 20, fireRate: 700, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 17, z: 12 }, hp: 500, damage: 20, fireRate: 700, color: '#3b82f6' },
      { id: 'bt3', pos: { x: 12, z: 6 }, hp: 500, damage: 20, fireRate: 700, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 17, z: 6 }, targetId: 'bt1' },
      { pos: { x: 6, z: 17 }, targetId: 'bt2' },
      { pos: { x: 6, z: 6 }, targetId: 'bt3' },
    ],
    portal: { id: 'p57', posA: { x: 1, z: 22 }, posB: { x: 22, z: 1 } },
    barrels: [
      { id: 'bb57_1', pos: { x: 8, z: 8 } }, { id: 'bb57_2', pos: { x: 15, z: 8 } },
      { id: 'bb57_3', pos: { x: 8, z: 15 } }, { id: 'bb57_4', pos: { x: 15, z: 15 } },
    ],
    healthBoxes: [{ id: 'bh57', pos: { x: 12, z: 12 } }],
    ammoBoxes: [{ id: 'ba57', pos: { x: 1, z: 12 } }, { id: 'ba57_2', pos: { x: 22, z: 12 } }],
    exit: { x: 12, z: 1 },
  },
  // Level 58: Scorched Shore — Long beach assault with elite rear guard
  {
    id: 58,
    theme: 'beach',
    gridSize: { width: 28, height: 14 },
    playerSpawn: { x: 2, z: 7 },
    walls: [
      ...createBoxRoom(28, 14),
      { x: 7, z: 3 }, { x: 7, z: 4 }, { x: 7, z: 5 },
      { x: 7, z: 8 }, { x: 7, z: 9 }, { x: 7, z: 10 },
      { x: 14, z: 1 }, { x: 14, z: 2 }, { x: 14, z: 3 },
      { x: 14, z: 10 }, { x: 14, z: 11 }, { x: 14, z: 12 },
      { x: 21, z: 4 }, { x: 21, z: 5 }, { x: 21, z: 8 }, { x: 21, z: 9 },
      { x: 10, z: 7 }, { x: 18, z: 7 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 5, z: 2 }, hp: 120, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 5, z: 11 }, hp: 120, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 11, z: 4 }, hp: 180, weapon: { ...rifle, damage: 18 }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 11, z: 9 }, hp: 180, weapon: { ...rifle, damage: 18 }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 18, z: 2 }, hp: 220, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 18, z: 11 }, hp: 220, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
      { id: 'be7', pos: { x: 25, z: 7 }, hp: 300, weapon: { ...rifle, damage: 25, ammo: 100, maxAmmo: 100 }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 14, z: 7 }, hp: 500, damage: 20, fireRate: 600, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 24, z: 3 }, hp: 400, damage: 25, fireRate: 1000, color: '#3b82f6' },
      { id: 'bt3', pos: { x: 24, z: 10 }, hp: 400, damage: 25, fireRate: 1000, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 12, z: 7 }, targetId: 'bt1' },
      { pos: { x: 22, z: 1 }, targetId: 'bt2' },
      { pos: { x: 22, z: 12 }, targetId: 'bt3' },
    ],
    barrels: [
      { id: 'bb58_1', pos: { x: 10, z: 2 } }, { id: 'bb58_2', pos: { x: 10, z: 11 } },
      { id: 'bb58_3', pos: { x: 18, z: 7 } }, { id: 'bb58_4', pos: { x: 24, z: 7 } },
    ],
    healthBoxes: [{ id: 'bh58', pos: { x: 14, z: 12 } }],
    ammoBoxes: [{ id: 'ba58_1', pos: { x: 7, z: 7 } }, { id: 'ba58_2', pos: { x: 21, z: 7 } }],
    exit: { x: 26, z: 7 },
  },
  // Level 59: Kraken's Lair — Pre-boss maze with heavy resistance and 4 turrets
  {
    id: 59,
    theme: 'beach',
    gridSize: { width: 24, height: 28 },
    playerSpawn: { x: 12, z: 26 },
    walls: [
      ...createBoxRoom(24, 28),
      { x: 6, z: 22 }, { x: 6, z: 21 }, { x: 6, z: 20 }, { x: 6, z: 19 },
      { x: 17, z: 22 }, { x: 17, z: 21 }, { x: 17, z: 20 }, { x: 17, z: 19 },
      { x: 8, z: 15 }, { x: 9, z: 15 }, { x: 10, z: 15 }, { x: 13, z: 15 }, { x: 14, z: 15 }, { x: 15, z: 15 },
      { x: 4, z: 10 }, { x: 5, z: 10 }, { x: 6, z: 10 },
      { x: 17, z: 10 }, { x: 18, z: 10 }, { x: 19, z: 10 },
      { x: 12, z: 8 }, { x: 12, z: 7 }, { x: 12, z: 6 },
      { x: 8, z: 4 }, { x: 9, z: 4 }, { x: 14, z: 4 }, { x: 15, z: 4 },
    ],
    enemies: [
      { id: 'be1', pos: { x: 3, z: 24 }, hp: 150, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 20, z: 24 }, hp: 150, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 12, z: 18 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 3, z: 13 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 20, z: 13 }, hp: 200, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 6, z: 6 }, hp: 250, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
      { id: 'be7', pos: { x: 17, z: 6 }, hp: 250, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
      { id: 'be8', pos: { x: 12, z: 2 }, hp: 350, weapon: { ...rifle, damage: 28, ammo: 200, maxAmmo: 200 }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 12, z: 20 }, hp: 500, damage: 20, fireRate: 700, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 3, z: 7 }, hp: 500, damage: 25, fireRate: 900, color: '#3b82f6' },
      { id: 'bt3', pos: { x: 20, z: 7 }, hp: 500, damage: 25, fireRate: 900, color: '#3b82f6' },
      { id: 'bt4', pos: { x: 12, z: 4 }, hp: 600, damage: 30, fireRate: 1500, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 12, z: 22 }, targetId: 'bt1' },
      { pos: { x: 1, z: 10 }, targetId: 'bt2' },
      { pos: { x: 22, z: 10 }, targetId: 'bt3' },
      { pos: { x: 12, z: 10 }, targetId: 'bt4' },
    ],
    portal: { id: 'p59', posA: { x: 2, z: 26 }, posB: { x: 2, z: 2 } },
    barrels: [
      { id: 'bb59_1', pos: { x: 6, z: 15 } }, { id: 'bb59_2', pos: { x: 17, z: 15 } },
      { id: 'bb59_3', pos: { x: 12, z: 10 } }, { id: 'bb59_4', pos: { x: 8, z: 2 } }, { id: 'bb59_5', pos: { x: 15, z: 2 } },
    ],
    healthBoxes: [{ id: 'bh59_1', pos: { x: 12, z: 15 } }, { id: 'bh59_2', pos: { x: 22, z: 26 } }],
    ammoBoxes: [{ id: 'ba59_1', pos: { x: 1, z: 15 } }, { id: 'ba59_2', pos: { x: 22, z: 15 } }, { id: 'ba59_3', pos: { x: 12, z: 26 } }],
    exit: { x: 12, z: 1 },
  },
  // Level 60: Leviathan — Ultimate boss battle, 30x30, 2000 HP boss, 9 guards, 5 turrets
  {
    id: 60,
    theme: 'beach',
    gridSize: { width: 30, height: 30 },
    playerSpawn: { x: 15, z: 28 },
    walls: [
      ...createBoxRoom(30, 30),
      { x: 13, z: 5 }, { x: 14, z: 5 }, { x: 15, z: 5 }, { x: 16, z: 5 },
      { x: 13, z: 8 }, { x: 14, z: 8 }, { x: 16, z: 8 },
      { x: 13, z: 6 }, { x: 13, z: 7 }, { x: 16, z: 6 }, { x: 16, z: 7 },
      { x: 7, z: 7 }, { x: 22, z: 7 }, { x: 7, z: 22 }, { x: 22, z: 22 },
      { x: 15, z: 15 }, { x: 14, z: 15 }, { x: 16, z: 15 },
      { x: 7, z: 15 }, { x: 22, z: 15 },
      { x: 15, z: 22 }, { x: 15, z: 7 },
    ],
    enemies: [
      { id: 'beach_boss', pos: { x: 15, z: 3 }, hp: 2000, weapon: { ...rifle, damage: 45, ammo: 9999, maxAmmo: 9999 }, color: '#3b82f6' },
      { id: 'be1', pos: { x: 5, z: 5 }, hp: 250, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
      { id: 'be2', pos: { x: 24, z: 5 }, hp: 250, weapon: { ...rifle, damage: 22 }, color: '#3b82f6' },
      { id: 'be3', pos: { x: 5, z: 24 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be4', pos: { x: 24, z: 24 }, hp: 200, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be5', pos: { x: 15, z: 12 }, hp: 250, weapon: { ...rifle, damage: 20 }, color: '#3b82f6' },
      { id: 'be6', pos: { x: 5, z: 15 }, hp: 200, weapon: { ...rifle, damage: 18 }, color: '#3b82f6' },
      { id: 'be7', pos: { x: 24, z: 15 }, hp: 200, weapon: { ...rifle, damage: 18 }, color: '#3b82f6' },
      { id: 'be8', pos: { x: 10, z: 20 }, hp: 180, weapon: { ...shotgun }, color: '#3b82f6' },
      { id: 'be9', pos: { x: 19, z: 20 }, hp: 180, weapon: { ...shotgun }, color: '#3b82f6' },
    ],
    turrets: [
      { id: 'bt1', pos: { x: 5, z: 10 }, hp: 600, damage: 25, fireRate: 800, color: '#3b82f6' },
      { id: 'bt2', pos: { x: 24, z: 10 }, hp: 600, damage: 25, fireRate: 800, color: '#3b82f6' },
      { id: 'bt3', pos: { x: 15, z: 20 }, hp: 600, damage: 25, fireRate: 800, color: '#3b82f6' },
      { id: 'bt4', pos: { x: 10, z: 5 }, hp: 700, damage: 30, fireRate: 1200, color: '#3b82f6' },
      { id: 'bt5', pos: { x: 19, z: 5 }, hp: 700, damage: 30, fireRate: 1200, color: '#3b82f6' },
    ],
    buttons: [
      { pos: { x: 1, z: 15 }, targetId: 'bt1' },
      { pos: { x: 28, z: 15 }, targetId: 'bt2' },
      { pos: { x: 15, z: 25 }, targetId: 'bt3' },
      { pos: { x: 1, z: 1 }, targetId: 'bt4' },
      { pos: { x: 28, z: 1 }, targetId: 'bt5' },
    ],
    portal: { id: 'p60', posA: { x: 2, z: 28 }, posB: { x: 27, z: 2 } },
    barrels: [
      { id: 'bb60_1', pos: { x: 10, z: 10 } }, { id: 'bb60_2', pos: { x: 19, z: 10 } },
      { id: 'bb60_3', pos: { x: 10, z: 15 } }, { id: 'bb60_4', pos: { x: 19, z: 15 } },
      { id: 'bb60_5', pos: { x: 15, z: 8 } }, { id: 'bb60_6', pos: { x: 7, z: 28 } },
      { id: 'bb60_7', pos: { x: 22, z: 28 } },
    ],
    healthBoxes: [{ id: 'bh60_1', pos: { x: 2, z: 15 } }, { id: 'bh60_2', pos: { x: 27, z: 15 } }],
    ammoBoxes: [
      { id: 'ba60_1', pos: { x: 15, z: 28 } }, { id: 'ba60_2', pos: { x: 1, z: 28 } },
      { id: 'ba60_3', pos: { x: 28, z: 28 } }, { id: 'ba60_4', pos: { x: 15, z: 15 } },
    ],
    exit: { x: 15, z: 1 },
  },
  // ============================================
  // ZONE 8: CEMETERY (Time Limits) - Levels 71-80
  // ============================================
  {
    id: 71,
    theme: 'cemetery',
    timeLimit: 45, // 45 seconds to clear
    gridSize: { width: 16, height: 16 },
    playerSpawn: { x: 8, z: 14 },
    walls: [
      ...createBoxRoom(16, 16),
      { x: 4, z: 12 }, { x: 5, z: 12 }, { x: 6, z: 12 }, { x: 7, z: 12 },
      { x: 9, z: 12 }, { x: 10, z: 12 }, { x: 11, z: 12 }, { x: 12, z: 12 },
      { x: 4, z: 8 }, { x: 5, z: 8 }, { x: 11, z: 8 }, { x: 12, z: 8 },
      { x: 4, z: 4 }, { x: 5, z: 4 }, { x: 6, z: 4 }, { x: 7, z: 4 },
      { x: 9, z: 4 }, { x: 10, z: 4 }, { x: 11, z: 4 }, { x: 12, z: 4 },
    ],
    enemies: [
      { id: 'e71_1', pos: { x: 2, z: 10 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
      { id: 'e71_2', pos: { x: 14, z: 10 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
      { id: 'e71_3', pos: { x: 8, z: 6 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e71_4', pos: { x: 2, z: 2 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
      { id: 'e71_5', pos: { x: 14, z: 2 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
    ],
    exit: { x: 8, z: 1 }
  },
  {
    id: 72,
    theme: 'cemetery',
    timeLimit: 60,
    gridSize: { width: 20, height: 20 },
    playerSpawn: { x: 2, z: 18 },
    walls: [
      ...createBoxRoom(20, 20),
      { x: 4, z: 16 }, { x: 6, z: 16 }, { x: 8, z: 16 }, { x: 10, z: 16 }, { x: 12, z: 16 }, { x: 14, z: 16 },
      { x: 4, z: 12 }, { x: 6, z: 12 }, { x: 8, z: 12 }, { x: 10, z: 12 }, { x: 12, z: 12 }, { x: 14, z: 12 },
      { x: 4, z: 8 }, { x: 6, z: 8 }, { x: 8, z: 8 }, { x: 10, z: 8 }, { x: 12, z: 8 }, { x: 14, z: 8 },
      { x: 4, z: 4 }, { x: 6, z: 4 }, { x: 8, z: 4 }, { x: 10, z: 4 }, { x: 12, z: 4 }, { x: 14, z: 4 },
    ],
    enemies: [
      { id: 'e72_1', pos: { x: 18, z: 16 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e72_2', pos: { x: 2, z: 12 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e72_3', pos: { x: 18, z: 8 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e72_4', pos: { x: 2, z: 4 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e72_5', pos: { x: 9, z: 10 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
    ],
    barrels: [{ id: 'b72_1', pos: { x: 10, z: 10 } }, { id: 'b72_2', pos: { x: 10, z: 14 } }, { id: 'b72_3', pos: { x: 10, z: 6 } }],
    exit: { x: 18, z: 2 }
  },
  {
    id: 73,
    theme: 'cemetery',
    timeLimit: 50,
    gridSize: { width: 18, height: 18 },
    playerSpawn: { x: 9, z: 16 },
    walls: [
      ...createBoxRoom(18, 18),
      { x: 7, z: 14 }, { x: 8, z: 14 }, { x: 9, z: 14 }, { x: 10, z: 14 }, { x: 11, z: 14 },
      { x: 5, z: 10 }, { x: 6, z: 10 }, { x: 12, z: 10 }, { x: 13, z: 10 },
      { x: 5, z: 8 }, { x: 6, z: 8 }, { x: 12, z: 8 }, { x: 13, z: 8 },
      { x: 7, z: 4 }, { x: 8, z: 4 }, { x: 9, z: 4 }, { x: 10, z: 4 }, { x: 11, z: 4 },
    ],
    enemies: [
      { id: 'e73_1', pos: { x: 2, z: 9 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e73_2', pos: { x: 16, z: 9 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e73_3', pos: { x: 9, z: 9 }, hp: 300, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e73_4', pos: { x: 5, z: 2 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
      { id: 'e73_5', pos: { x: 13, z: 2 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
    ],
    turrets: [
      { id: 't73_1', pos: { x: 9, z: 6 }, hp: 150, damage: 10, fireRate: 333 },
      { id: 't73_2', pos: { x: 9, z: 12 }, hp: 150, damage: 10, fireRate: 333 }
    ],
    buttons: [
      { pos: { x: 2, z: 2 }, targetId: 't73_1' },
      { pos: { x: 16, z: 2 }, targetId: 't73_2' }
    ],
    exit: { x: 9, z: 2 }
  },
  {
    id: 74,
    theme: 'cemetery',
    timeLimit: 75,
    gridSize: { width: 22, height: 22 },
    playerSpawn: { x: 11, z: 20 },
    walls: [
      ...createBoxRoom(22, 22),
      { x: 11, z: 18 }, { x: 11, z: 17 }, { x: 11, z: 16 }, { x: 11, z: 15 },
      { x: 6, z: 11 }, { x: 7, z: 11 }, { x: 8, z: 11 }, { x: 9, z: 11 }, { x: 10, z: 11 },
      { x: 12, z: 11 }, { x: 13, z: 11 }, { x: 14, z: 11 }, { x: 15, z: 11 }, { x: 16, z: 11 },
      { x: 11, z: 7 }, { x: 11, z: 6 }, { x: 11, z: 5 }, { x: 11, z: 4 },
    ],
    enemies: [
      { id: 'e74_1', pos: { x: 4, z: 18 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e74_2', pos: { x: 18, z: 18 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e74_3', pos: { x: 4, z: 4 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e74_4', pos: { x: 18, z: 4 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e74_5', pos: { x: 7, z: 14 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e74_6', pos: { x: 15, z: 14 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e74_7', pos: { x: 7, z: 8 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e74_8', pos: { x: 15, z: 8 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
    ],
    ammoBoxes: [
      { id: 'a74_1', pos: { x: 2, z: 20 } },
      { id: 'a74_2', pos: { x: 20, z: 20 } }
    ],
    exit: { x: 11, z: 2 }
  },
  {
    id: 75,
    theme: 'cemetery',
    timeLimit: 50, // Updated to 50 seconds
    gridSize: { width: 14, height: 30 }, // Long narrow strip
    playerSpawn: { x: 7, z: 28 },
    walls: [
      ...createBoxRoom(14, 30),
      { x: 5, z: 24 }, { x: 6, z: 24 }, { x: 8, z: 24 }, { x: 9, z: 24 },
      { x: 3, z: 19 }, { x: 4, z: 19 }, { x: 10, z: 19 }, { x: 11, z: 19 },
      { x: 5, z: 14 }, { x: 6, z: 14 }, { x: 8, z: 14 }, { x: 9, z: 14 },
      { x: 3, z: 9 }, { x: 4, z: 9 }, { x: 10, z: 9 }, { x: 11, z: 9 },
      { x: 5, z: 4 }, { x: 6, z: 4 }, { x: 8, z: 4 }, { x: 9, z: 4 },
    ],
    enemies: [
      { id: 'e75_1', pos: { x: 7, z: 22 }, hp: 100, weapon: { name: 'Pistol', ammo: 20, maxAmmo: 20, damage: 10 } },
      { id: 'e75_2', pos: { x: 7, z: 17 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e75_3', pos: { x: 7, z: 12 }, hp: 200, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e75_4', pos: { x: 7, z: 7 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e75_5', pos: { x: 7, z: 2 }, hp: 400, weapon: { name: 'Chaingun', ammo: 100, maxAmmo: 100, damage: 5 } },
    ],
    exit: { x: 7, z: 1 }
  },
  {
    id: 76,
    theme: 'cemetery',
    timeLimit: 90,
    gridSize: { width: 24, height: 24 },
    playerSpawn: { x: 12, z: 22 },
    walls: [
      ...createBoxRoom(24, 24),
      { x: 8, z: 18 }, { x: 9, z: 18 }, { x: 10, z: 18 }, { x: 14, z: 18 }, { x: 15, z: 18 }, { x: 16, z: 18 },
      { x: 8, z: 17 }, { x: 16, z: 17 },
      { x: 8, z: 16 }, { x: 16, z: 16 },
      // Portal chambers
      { x: 4, z: 12 }, { x: 5, z: 12 }, { x: 6, z: 12 },
      { x: 18, z: 12 }, { x: 19, z: 12 }, { x: 20, z: 12 },
      { x: 8, z: 8 }, { x: 9, z: 8 }, { x: 10, z: 8 }, { x: 14, z: 8 }, { x: 15, z: 8 }, { x: 16, z: 8 },
      { x: 8, z: 5 }, { x: 16, z: 5 },
    ],
    portal: { id: 'p76', posA: { x: 12, z: 15 }, posB: { x: 12, z: 6 } }, // Skip the middle via portal, or walk around
    enemies: [
      { id: 'e76_1', pos: { x: 4, z: 18 }, hp: 200, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e76_2', pos: { x: 20, z: 18 }, hp: 200, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e76_3', pos: { x: 12, z: 12 }, hp: 500, weapon: { name: 'Shotgun', ammo: 20, maxAmmo: 20, damage: 20 } }, // Guards portal A
      { id: 'e76_4', pos: { x: 4, z: 6 }, hp: 200, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e76_5', pos: { x: 20, z: 6 }, hp: 200, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e76_6', pos: { x: 12, z: 3 }, hp: 400, weapon: { name: 'Chaingun', ammo: 100, maxAmmo: 100, damage: 5 } }, // Guards exit
    ],
    turrets: [
      { id: 't76_1', pos: { x: 2, z: 12 }, hp: 200, damage: 15, fireRate: 333 },
      { id: 't76_2', pos: { x: 22, z: 12 }, hp: 200, damage: 15, fireRate: 333 }
    ],
    buttons: [
      { pos: { x: 8, z: 12 }, targetId: 't76_1' },
      { pos: { x: 16, z: 12 }, targetId: 't76_2' }
    ],
    healthBoxes: [{ id: 'h76_1', pos: { x: 4, z: 2 } }, { id: 'h76_2', pos: { x: 20, z: 2 } }],
    ammoBoxes: [{ id: 'a76_1', pos: { x: 4, z: 22 } }, { id: 'a76_2', pos: { x: 20, z: 22 } }],
    exit: { x: 12, z: 1 }
  },
  {
    id: 77,
    theme: 'cemetery',
    timeLimit: 60,
    gridSize: { width: 18, height: 18 },
    playerSpawn: { x: 2, z: 16 },
    walls: [
      { x: 6, z: 16 }, { x: 6, z: 15 }, { x: 6, z: 14 }, { x: 6, z: 13 }, { x: 6, z: 12 },
      { x: 12, z: 6 }, { x: 12, z: 5 }, { x: 12, z: 4 }, { x: 12, z: 3 }, { x: 12, z: 2 },
      { x: 8, z: 8 }, { x: 9, z: 8 }, { x: 10, z: 8 },
      { x: 8, z: 9 }, { x: 10, z: 9 },
      { x: 8, z: 10 }, { x: 9, z: 10 }, { x: 10, z: 10 },
    ],
    enemies: [
      { id: 'e77_1', pos: { x: 9, z: 16 }, hp: 200, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e77_2', pos: { x: 16, z: 16 }, hp: 200, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e77_3', pos: { x: 2, z: 8 }, hp: 300, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e77_4', pos: { x: 16, z: 8 }, hp: 300, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e77_5', pos: { x: 9, z: 2 }, hp: 200, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
    ],
    barrels: [
      { id: 'b77_1', pos: { x: 4, z: 14 } }, { id: 'b77_2', pos: { x: 8, z: 14 } },
      { id: 'b77_3', pos: { x: 14, z: 4 } }, { id: 'b77_4', pos: { x: 10, z: 4 } }
    ],
    exit: { x: 16, z: 2 }
  },
  {
    id: 78,
    theme: 'cemetery',
    timeLimit: 120, // Huge level with time pressure
    gridSize: { width: 30, height: 30 },
    playerSpawn: { x: 15, z: 28 },
    walls: [
      ...createBoxRoom(30, 30),
      // Outer ring
      { x: 5, z: 25 }, { x: 6, z: 25 }, { x: 24, z: 25 }, { x: 25, z: 25 },
      { x: 5, z: 5 }, { x: 6, z: 5 }, { x: 24, z: 5 }, { x: 25, z: 5 },
      { x: 5, z: 6 }, { x: 5, z: 7 }, { x: 5, z: 23 }, { x: 5, z: 24 },
      { x: 25, z: 6 }, { x: 25, z: 7 }, { x: 25, z: 23 }, { x: 25, z: 24 },
      // Inner cross
      { x: 15, z: 10 }, { x: 15, z: 11 }, { x: 15, z: 12 }, { x: 15, z: 18 }, { x: 15, z: 19 }, { x: 15, z: 20 },
      { x: 10, z: 15 }, { x: 11, z: 15 }, { x: 12, z: 15 }, { x: 18, z: 15 }, { x: 19, z: 15 }, { x: 20, z: 15 },
    ],
    enemies: [
      { id: 'e78_1', pos: { x: 10, z: 25 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e78_2', pos: { x: 20, z: 25 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e78_3', pos: { x: 5, z: 15 }, hp: 300, weapon: { name: 'Shotgun', ammo: 15, maxAmmo: 15, damage: 20 } },
      { id: 'e78_4', pos: { x: 25, z: 15 }, hp: 300, weapon: { name: 'Shotgun', ammo: 15, maxAmmo: 15, damage: 20 } },
      { id: 'e78_5', pos: { x: 10, z: 5 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e78_6', pos: { x: 20, z: 5 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e78_7', pos: { x: 15, z: 15 }, hp: 500, weapon: { name: 'Chaingun', ammo: 200, maxAmmo: 200, damage: 6 } }, // Center guard
    ],
    turrets: [
      { id: 't78_1', pos: { x: 8, z: 8 }, hp: 250, damage: 20, fireRate: 333 },
      { id: 't78_2', pos: { x: 22, z: 8 }, hp: 250, damage: 20, fireRate: 333 },
      { id: 't78_3', pos: { x: 8, z: 22 }, hp: 250, damage: 20, fireRate: 333 },
      { id: 't78_4', pos: { x: 22, z: 22 }, hp: 250, damage: 20, fireRate: 333 }
    ],
    ammoBoxes: [
      { id: 'a78_1', pos: { x: 15, z: 25 } }
    ],
    exit: { x: 15, z: 2 }
  },
  {
    id: 79,
    theme: 'cemetery',
    timeLimit: 50,
    gridSize: { width: 16, height: 16 },
    playerSpawn: { x: 8, z: 14 },
    walls: [
      ...createBoxRoom(16, 16),
      { x: 3, z: 12 }, { x: 4, z: 12 }, { x: 12, z: 12 }, { x: 13, z: 12 },
      { x: 3, z: 8 }, { x: 4, z: 8 }, { x: 7, z: 8 }, { x: 8, z: 8 }, { x: 9, z: 8 }, { x: 12, z: 8 }, { x: 13, z: 8 },
      { x: 3, z: 4 }, { x: 4, z: 4 }, { x: 12, z: 4 }, { x: 13, z: 4 },
    ],
    enemies: [
      { id: 'e79_1', pos: { x: 2, z: 14 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e79_2', pos: { x: 14, z: 14 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e79_3', pos: { x: 2, z: 8 }, hp: 250, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e79_4', pos: { x: 14, z: 8 }, hp: 250, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e79_5', pos: { x: 8, z: 5 }, hp: 400, weapon: { name: 'Rifle', ammo: 50, maxAmmo: 50, damage: 15 } },
      { id: 'e79_6', pos: { x: 2, z: 2 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
      { id: 'e79_7', pos: { x: 14, z: 2 }, hp: 150, weapon: { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 } },
    ],
    barrels: [
      { id: 'b79_1', pos: { x: 6, z: 10 } },
      { id: 'b79_2', pos: { x: 10, z: 6 } }
    ],
    exit: { x: 8, z: 1 }
  },
  {
    id: 80,
    theme: 'cemetery',
    timeLimit: 120, // Boss level
    gridSize: { width: 28, height: 28 },
    playerSpawn: { x: 14, z: 26 },
    walls: [
      ...createBoxRoom(28, 28),
      { x: 10, z: 20 }, { x: 11, z: 20 }, { x: 17, z: 20 }, { x: 18, z: 20 },
      { x: 6, z: 14 }, { x: 7, z: 14 }, { x: 21, z: 14 }, { x: 22, z: 14 },
      { x: 10, z: 8 }, { x: 11, z: 8 }, { x: 17, z: 8 }, { x: 18, z: 8 },
    ],
    enemies: [
      { id: 'e80_boss_CRYPT_KEEPER', pos: { x: 14, z: 14 }, hp: 3000, weapon: { name: 'Dual Chainguns', ammo: 999, maxAmmo: 999, damage: 10 } },
      { id: 'e80_1', pos: { x: 4, z: 24 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e80_2', pos: { x: 24, z: 24 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e80_3', pos: { x: 4, z: 4 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e80_4', pos: { x: 24, z: 4 }, hp: 250, weapon: { name: 'Rifle', ammo: 30, maxAmmo: 30, damage: 15 } },
      { id: 'e80_5', pos: { x: 14, z: 20 }, hp: 300, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
      { id: 'e80_6', pos: { x: 14, z: 8 }, hp: 300, weapon: { name: 'Shotgun', ammo: 10, maxAmmo: 10, damage: 20 } },
    ],
    turrets: [
      { id: 't80_1', pos: { x: 8, z: 14 }, hp: 300, damage: 25, fireRate: 333 },
      { id: 't80_2', pos: { x: 20, z: 14 }, hp: 300, damage: 25, fireRate: 333 }
    ],
    buttons: [
      { pos: { x: 2, z: 14 }, targetId: 't80_1' },
      { pos: { x: 26, z: 14 }, targetId: 't80_2' }
    ],
    healthBoxes: [{ id: 'h80_1', pos: { x: 14, z: 22 } }, { id: 'h80_2', pos: { x: 14, z: 6 } }],
    ammoBoxes: [{ id: 'a80_1', pos: { x: 12, z: 14 } }, { id: 'a80_2', pos: { x: 16, z: 14 } }],
    exit: { x: 14, z: 2 }
  }
];
