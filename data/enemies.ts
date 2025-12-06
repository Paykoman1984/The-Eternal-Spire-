
import type { Enemy } from '../types';

type EnemyData = Omit<Enemy, 'stats' | 'id' | 'level'> & { id: string; stats: Omit<Enemy['stats'], 'hp'> };

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

export const BASE_ENEMIES: Record<string, EnemyData> = {
  SLIME: {
    id: 'SLIME',
    name: 'Slime', 
    icon: `${ICON_BASE}/slime.svg${COLOR_PARAM}`, 
    minFloor: 1,
    stats: { maxHp: 20, attack: 4, defense: 0, evasion: 0 }, 
    xpReward: 10 
  },
  BAT: {
    id: 'BAT',
    name: 'Bat',
    icon: `${ICON_BASE}/bat.svg${COLOR_PARAM}`,
    minFloor: 1,
    stats: { maxHp: 15, attack: 5, defense: 0, evasion: 15 },
    xpReward: 12
  },
  GOBLIN: {
    id: 'GOBLIN',
    name: 'Goblin', 
    icon: `${ICON_BASE}/goblin-head.svg${COLOR_PARAM}`, 
    minFloor: 2,
    stats: { maxHp: 30, attack: 7, defense: 2, evasion: 5 }, 
    xpReward: 15 
  },
  SKELETON: {
    id: 'SKELETON',
    name: 'Skeleton',
    icon: `${ICON_BASE}/skeleton.svg${COLOR_PARAM}`,
    minFloor: 4,
    stats: { maxHp: 45, attack: 9, defense: 6, evasion: 2 },
    xpReward: 20
  },
  SPIDER: {
    id: 'SPIDER',
    name: 'Giant Spider',
    icon: `${ICON_BASE}/spider-face.svg${COLOR_PARAM}`,
    minFloor: 5,
    stats: { maxHp: 35, attack: 11, defense: 2, evasion: 12 },
    xpReward: 25
  },
  ORC: {
    id: 'ORC',
    name: 'Orc',
    icon: `${ICON_BASE}/orc-head.svg${COLOR_PARAM}`,
    minFloor: 7,
    stats: { maxHp: 70, attack: 13, defense: 4, evasion: 0 },
    xpReward: 30
  },
  WRAITH: {
    id: 'WRAITH',
    name: 'Wraith',
    icon: `${ICON_BASE}/spectre.svg${COLOR_PARAM}`,
    minFloor: 9,
    stats: { maxHp: 40, attack: 12, defense: 5, evasion: 15 },
    xpReward: 35
  },
  // Bosses
  GOBLIN_CHAMPION: {
    id: 'GOBLIN_CHAMPION',
    name: 'Goblin Champion', 
    icon: `${ICON_BASE}/troll.svg${COLOR_PARAM}`, 
    minFloor: 10,
    stats: { maxHp: 150, attack: 18, defense: 8, evasion: 5 }, 
    xpReward: 100 
  },
};
