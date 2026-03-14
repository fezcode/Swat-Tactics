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
    enemies: [{ id: 'e1', pos: { x: 6, z: 6 }, hp: 20, weapon: { ...defaultPistol } }],
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
      { id: 'e1', pos: { x: 8, z: 2 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e2', pos: { x: 7, z: 7 }, hp: 20, weapon: { ...defaultPistol } },
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
      { id: 'e1', pos: { x: 1, z: 8 }, hp: 20, weapon: { ...shotgun } },
      { id: 'e2', pos: { x: 8, z: 8 }, hp: 20, weapon: { ...defaultPistol } },
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
      { id: 'e1', pos: { x: 10, z: 10 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e2', pos: { x: 10, z: 1 }, hp: 20, weapon: { ...shotgun } },
      { id: 'e3', pos: { x: 5, z: 5 }, hp: 20, weapon: { ...defaultPistol } },
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
      { id: 'e1', pos: { x: 6, z: 1 }, hp: 30, weapon: { ...rifle } },
      { id: 'e2', pos: { x: 12, z: 12 }, hp: 20, weapon: { ...shotgun } },
      { id: 'e3', pos: { x: 6, z: 12 }, hp: 20, weapon: { ...defaultPistol } },
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
      { id: 'e1', pos: { x: 8, z: 1 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e2', pos: { x: 1, z: 1 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e3', pos: { x: 8, z: 6 }, hp: 30, weapon: { ...rifle } },
    ],
    barrels: [{ id: 'b1', pos: { x: 4, z: 6 } }, { id: 'b2', pos: { x: 6, z: 6 } }],
    exit: { x: 5, z: 1 },
  },
  // Level 7
  {
    id: 7,
    theme: 'industrial',
    gridSize: { width: 15, height: 15 },
    playerSpawn: { x: 7, z: 13 },
    walls: [...createBoxRoom(15, 15), { x: 7, z: 11 }, { x: 7, z: 10 }, { x: 7, z: 9 }, { x: 6, z: 9 }, { x: 8, z: 9 }],
    enemies: [
      { id: 'e1', pos: { x: 1, z: 1 }, hp: 20, weapon: { ...shotgun } },
      { id: 'e2', pos: { x: 13, z: 1 }, hp: 20, weapon: { ...shotgun } },
      { id: 'e3', pos: { x: 7, z: 1 }, hp: 40, weapon: { ...rifle } },
      { id: 'e4', pos: { x: 4, z: 7 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e5', pos: { x: 10, z: 7 }, hp: 20, weapon: { ...defaultPistol } },
    ],
    barrels: [{ id: 'b1', pos: { x: 2, z: 2 } }, { id: 'b2', pos: { x: 12, z: 2 } }, { id: 'b3', pos: { x: 7, z: 4 } }],
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
      { id: 'e1', pos: { x: 10, z: 10 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e2', pos: { x: 10, z: 1 }, hp: 30, weapon: { ...rifle } },
      { id: 'e3', pos: { x: 1, z: 10 }, hp: 30, weapon: { ...rifle } },
    ],
    barrels: [{ id: 'b1', pos: { x: 4, z: 4 } }, { id: 'b2', pos: { x: 7, z: 7 } }],
    exit: { x: 5, z: 10 },
  },
  // Level 9
  {
    id: 9,
    theme: 'industrial',
    gridSize: { width: 14, height: 10 },
    playerSpawn: { x: 1, z: 4 },
    walls: [...createBoxRoom(14, 10), { x: 7, z: 1 }, { x: 7, z: 2 }, { x: 7, z: 7 }, { x: 7, z: 8 }],
    enemies: [
      { id: 'e1', pos: { x: 12, z: 1 }, hp: 40, weapon: { ...shotgun } },
      { id: 'e2', pos: { x: 12, z: 8 }, hp: 40, weapon: { ...shotgun } },
      { id: 'e3', pos: { x: 8, z: 4 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e4', pos: { x: 8, z: 5 }, hp: 20, weapon: { ...defaultPistol } },
    ],
    barrels: [{ id: 'b1', pos: { x: 11, z: 1 } }, { id: 'b2', pos: { x: 11, z: 8 } }],
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
      { id: 'boss', pos: { x: 8, z: 2 }, hp: 100, weapon: { ...rifle, damage: 25, ammo: 100, maxAmmo: 100 } },
      { id: 'e1', pos: { x: 2, z: 2 }, hp: 30, weapon: { ...shotgun } },
      { id: 'e2', pos: { x: 14, z: 2 }, hp: 30, weapon: { ...shotgun } },
      { id: 'e3', pos: { x: 2, z: 8 }, hp: 20, weapon: { ...defaultPistol } },
      { id: 'e4', pos: { x: 14, z: 8 }, hp: 20, weapon: { ...defaultPistol } },
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
    enemies: [{ id: 'ge1', pos: { x: 8, z: 8 }, hp: 30, weapon: { ...defaultPistol } }],
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
      { id: 'ge1', pos: { x: 10, z: 2 }, hp: 30, weapon: { ...defaultPistol } },
      { id: 'ge2', pos: { x: 10, z: 6 }, hp: 30, weapon: { ...defaultPistol } },
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
      { id: 'ge1', pos: { x: 10, z: 10 }, hp: 40, weapon: { ...shotgun } },
      { id: 'ge2', pos: { x: 1, z: 10 }, hp: 30, weapon: { ...rifle } },
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
      { id: 'ge1', pos: { x: 2, z: 2 }, hp: 30, weapon: { ...defaultPistol } },
      { id: 'ge2', pos: { x: 12, z: 2 }, hp: 30, weapon: { ...defaultPistol } },
      { id: 'ge3', pos: { x: 2, z: 12 }, hp: 30, weapon: { ...defaultPistol } },
      { id: 'ge4', pos: { x: 12, z: 12 }, hp: 30, weapon: { ...defaultPistol } },
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
      { id: 'ge1', pos: { x: 1, z: 1 }, hp: 50, weapon: { ...rifle } },
      { id: 'ge2', pos: { x: 8, z: 1 }, hp: 50, weapon: { ...rifle } },
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
      { id: 'ge1', pos: { x: 1, z: 1 }, hp: 30, weapon: { ...shotgun } },
      { id: 'ge2', pos: { x: 10, z: 1 }, hp: 30, weapon: { ...shotgun } },
      { id: 'ge3', pos: { x: 1, z: 10 }, hp: 30, weapon: { ...shotgun } },
      { id: 'ge4', pos: { x: 10, z: 10 }, hp: 30, weapon: { ...shotgun } },
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
      { id: 'ge1', pos: { x: 14, z: 2 }, hp: 40, weapon: { ...rifle } },
      { id: 'ge2', pos: { x: 14, z: 8 }, hp: 40, weapon: { ...rifle } },
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
      { id: 'ge1', pos: { x: 2, z: 5 }, hp: 30, weapon: { ...defaultPistol } },
      { id: 'ge2', pos: { x: 8, z: 5 }, hp: 30, weapon: { ...defaultPistol } },
      { id: 'ge3', pos: { x: 5, z: 2 }, hp: 60, weapon: { ...rifle } },
    ],
    barrels: [{ id: 'gb1', pos: { x: 5, z: 12 } }],
    exit: { x: 5, z: 1 },
  },
  // Level 19: Floral Defense
  {
    id: 19,
    theme: 'garden',
    gridSize: { width: 14, height: 14 },
    playerSpawn: { x: 1, z: 1 },
    walls: [...createBoxRoom(14, 14), { x: 7, z: 7 }],
    enemies: [
      { id: 'ge1', pos: { x: 12, z: 12 }, hp: 40, weapon: { ...shotgun } },
      { id: 'ge2', pos: { x: 12, z: 1 }, hp: 40, weapon: { ...shotgun } },
      { id: 'ge3', pos: { x: 1, z: 12 }, hp: 40, weapon: { ...shotgun } },
    ],
    barrels: [{ id: 'gb1', pos: { x: 6, z: 6 } }, { id: 'gb2', pos: { x: 8, z: 8 } }],
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
      { id: 'gmaster', pos: { x: 9, z: 2 }, hp: 150, weapon: { ...rifle, damage: 20, ammo: 200, maxAmmo: 200 } },
      { id: 'ge1', pos: { x: 2, z: 2 }, hp: 40, weapon: { ...shotgun } },
      { id: 'ge2', pos: { x: 16, z: 2 }, hp: 40, weapon: { ...shotgun } },
      { id: 'ge3', pos: { x: 2, z: 16 }, hp: 40, weapon: { ...shotgun } },
      { id: 'ge4', pos: { x: 16, z: 16 }, hp: 40, weapon: { ...shotgun } },
    ],
    barrels: [{ id: 'gb1', pos: { x: 5, z: 5 } }, { id: 'gb2', pos: { x: 13, z: 5 } }, { id: 'gb3', pos: { x: 5, z: 13 } }, { id: 'gb4', pos: { x: 13, z: 13 } }],
    exit: { x: 9, z: 1 },
  },
];
