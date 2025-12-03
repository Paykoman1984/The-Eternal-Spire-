import type { Enemy } from '../types';

type EnemyData = Omit<Enemy, 'stats' | 'id'> & { id: string; stats: Omit<Enemy['stats'], 'hp'> };

export const BASE_ENEMIES: Record<string, EnemyData> = {
  SLIME: {
    id: 'SLIME',
    name: 'Slime', 
    icon: '💧', 
    stats: { maxHp: 20, attack: 5, defense: 2, evasion: 0 }, 
    xpReward: 10 
  },
  GOBLIN: {
    id: 'GOBLIN',
    name: 'Goblin', 
    icon: '👺', 
    stats: { maxHp: 30, attack: 8, defense: 3, evasion: 5 }, 
    xpReward: 15 
  },
  BAT: {
    id: 'BAT',
    name: 'Bat',
    icon: '🦇',
    stats: { maxHp: 15, attack: 10, defense: 1, evasion: 15 },
    xpReward: 12
  },
  GOBLIN_CHAMPION: {
    id: 'GOBLIN_CHAMPION',
    name: 'Goblin Champion', 
    icon: '👹', 
    stats: { maxHp: 150, attack: 20, defense: 8, evasion: 8 }, 
    xpReward: 100 
  },
};