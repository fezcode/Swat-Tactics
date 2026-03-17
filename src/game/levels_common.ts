import type { Weapon } from '../types';

export const defaultPistol: Weapon = { name: 'Pistol', ammo: 12, maxAmmo: 12, damage: 10 };
export const shotgun: Weapon = { name: 'Shotgun', ammo: 6, maxAmmo: 6, damage: 20 };
export const rifle: Weapon = { name: 'Assault Rifle', ammo: 30, maxAmmo: 30, damage: 15 };
export const smg: Weapon = { name: 'SMG', ammo: 40, maxAmmo: 40, damage: 8 };
export const chaingun: Weapon = { name: 'Chaingun', ammo: 100, maxAmmo: 100, damage: 5 };

export function createBoxRoom(width: number, height: number): { x: number, z: number }[] {
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
