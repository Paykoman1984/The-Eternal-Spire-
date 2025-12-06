

import type { Enemy } from '../types';

type EnemyData = Omit<Enemy, 'stats' | 'id' | 'level'> & { id: string; stats: Omit<Enemy['stats'], 'hp'> };

export const BASE_ENEMIES: Record<string, EnemyData> = {
  SLIME: {
    id: 'SLIME',
    name: 'Slime', 
    icon: '💧', 
    minFloor: 1,
    stats: { maxHp: 20, attack: 4, defense: 0, evasion: 0 }, 
    xpReward: 10 
  },
  BAT: {
    id: 'BAT',
    name: 'Bat',
    icon: '🦇',
    minFloor: 1,
    stats: { maxHp: 15, attack: 5, defense: 0, evasion: 15 },
    xpReward: 12
  },
  GOBLIN: {
    id: 'GOBLIN',
    name: 'Goblin', 
    icon: '👺', 
    minFloor: 2,
    stats: { maxHp: 30, attack: 7, defense: 2, evasion: 5 }, 
    xpReward: 15 
  },
  SKELETON: {
    id: 'SKELETON',
    name: 'Skeleton',
    icon: '💀',
    minFloor: 4,
    stats: { maxHp: 45, attack: 9, defense: 6, evasion: 2 },
    xpReward: 20
  },
  SPIDER: {
    id: 'SPIDER',
    name: 'Giant Spider',
    icon: '🕷️',
    minFloor: 5,
    stats: { maxHp: 35, attack: 11, defense: 2, evasion: 12 },
    xpReward: 25
  },
  ORC: {
    id: 'ORC',
    name: 'Orc',
    icon: '👹',
    minFloor: 7,
    stats: { maxHp: 70, attack: 13, defense: 4, evasion: 0 },
    xpReward: 30
  },
  WRAITH: {
    id: 'WRAITH',
    name: 'Wraith',
    icon: '👻',
    minFloor: 9,
    stats: { maxHp: 40, attack: 12, defense: 5, evasion: 15 },
    xpReward: 35
  },
  // Bosses (minFloor logic handled by specific floor check in combat.ts, but good to have)
  GOBLIN_CHAMPION: {
    id: 'GOBLIN_CHAMPION',
    name: 'Goblin Champion', 
    icon: '👹', 
    minFloor: 10,
    stats: { maxHp: 150, attack: 18, defense: 8, evasion: 5 }, 
    xpReward: 100 
  },
};