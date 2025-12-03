export type GameScreen = 'start' | 'class_selection' | 'main_game' | 'combat' | 'shop' | 'achievements';

export type ClassName = 'Warrior' | 'Rogue' | 'Mage';

export interface Stats {
  str: number;
  dex: number;
  int: number;
  maxHp: number;
  defense: number;
  critRate: number;
}

export interface PlayerClass {
  name: ClassName;
  description: string;
  baseStats: Stats;
  icon: string;
}

export type GearSlot = 'Weapon' | 'Helmet' | 'Armor' | 'Boots' | 'Gloves';
export type EquipmentSlot = GearSlot | 'Potions';

export interface Equipment {
  name: string;
  slot: GearSlot;
  icon: string;
  stats: Partial<Stats>;
  cost?: number;
}

export interface Player {
  level: number; // Account level
  xp: number; // Account XP
  xpToNextLevel: number; // Account XP to next level
  classInfo: PlayerClass;
  baseStats: Stats; // Raw stats from class + flat level ups
  currentStats: Stats; // Final, calculated stats including gear and buffs
  accountBuffs: Partial<Record<keyof Stats, number>>; // Percentage buffs from account level
  currentHp: number; // HP outside of a run
  eternalShards: number;
  potionCount: number;
  equipment: Partial<Record<GearSlot, Equipment>>;
  shopInventory: Equipment[];
  lastShopRefreshLevel: number;
  achievementProgress: Record<string, number>; // key: achievementId, value: progress
  claimedAchievements: string[]; // array of achievementIds
}

export interface Enemy {
  id: string;
  name: string;
  icon: string;
  stats: {
    maxHp: number;
    hp: number;
    attack: number;
    defense: number;
  };
  xpReward: number;
}

export interface RunState {
  floor: number;
  runLevel: number;
  runXp: number;
  runXpToNextLevel: number;
  playerCurrentHpInRun: number;
  currentEnemy: Enemy;
  pendingLoot: Equipment | null;
}

export interface CombatLog {
    id: number;
    message: string;
    color: 'text-green-400' | 'text-yellow-400' | 'text-slate-200' | 'text-purple-400' | 'text-red-400';
}

// --- Achievements ---
export type AchievementType = 'slay' | 'reach_floor' | 'account_level';

export interface Reward {
  shards?: number;
  potions?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  goal: number;
  targetId?: string; // e.g., 'GOBLIN' for slay quests
  rewards: Reward;
  isBuff?: boolean; // True for account level buffs that are displayed here
}