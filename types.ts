export type GameScreen = 'start' | 'class_selection' | 'main_game' | 'combat' | 'shop';

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
  currentStats: Stats; // Persistent stats
  currentHp: number; // HP outside of a run
  eternalShards: number;
  potionCount: number;
  equipment: Partial<Record<GearSlot, Equipment>>;
  shopInventory: Equipment[];
  lastShopRefreshLevel: number;
}

export interface Enemy {
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
    color: 'text-green-400' | 'text-red-400' | 'text-yellow-400' | 'text-slate-400' | 'text-purple-400';
}