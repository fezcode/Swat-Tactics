import type { Position } from '../types';

// Non-reactive position cache for entities.
// Enemies write here every frame (zero React cost).
// Readers (minimap, AoE, survival tick) read from here instead of the store.
const cache = new Map<string, Position>();

export const positionCache = {
  set(id: string, pos: Position) { cache.set(id, pos); },
  get(id: string): Position | undefined { return cache.get(id); },
  delete(id: string) { cache.delete(id); },
  getAll(): Map<string, Position> { return cache; },
  clear() { cache.clear(); },
};

// Obstacle AABB cache for bullet collision.
// Static obstacles register once; cleared on wave/level change.
export interface ObstacleAABB {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
}

const obstacles: ObstacleAABB[] = [];

export const obstacleCache = {
  add(aabb: ObstacleAABB) { obstacles.push(aabb); },
  getAll(): ObstacleAABB[] { return obstacles; },
  clear() { obstacles.length = 0; },
};
