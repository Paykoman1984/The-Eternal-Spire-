import type { Enemy } from '../types';

type EnemyData = Omit<Enemy, 'stats'> & { stats: Omit<Enemy['stats'], 'hp'> };

export const BASE_ENEMIES: Record<string, EnemyData> = {
  // Tier 1
  SLIME: { 
    name: 'Slime', 
    icon: '💧', 
    stats: { maxHp: 20, attack: 5, defense: 2 }, 
    xpReward: 10 
  },
  GOBLIN: { 
    name: 'Goblin', 
    icon: '👺', 
    stats: { maxHp: 30, attack: 8, defense: 3 }, 
    xpReward: 15 
  },
  BAT: {
    name: 'Bat',
    icon: '🦇',
    stats: { maxHp: 15, attack: 10, defense: 1 },
    xpReward: 12
  },
  // Mini-boss
  GOBLIN_CHAMPION: { 
    name: 'Goblin Champion', 
    icon: '👹', 
    stats: { maxHp: 150, attack: 20, defense: 8 }, 
    xpReward: 100 
  },
};
