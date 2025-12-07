

export type GameScreen = 'start' | 'profile_selection' | 'name_selection' | 'class_selection' | 'main_game' | 'combat' | 'shop' | 'achievements' | 'run_summary' | 'stats';

export type ClassName = 'Warrior' | 'Rogue' | 'Mage';

export interface Stats {
  str: number;
  dex: number;
  int: number;
  maxHp: number;
  defense: number;
  critRate: number;
  evasion: number;
  blockChance: number;
  lifesteal: number;
}

export type WeaponType = 'Sword' | 'Hammer' | 'Dagger' | 'Bow' | 'Mace' | 'Staff' | 'Shield' | 'Tome' | 'None';

export interface PlayerClass {
  name: ClassName;
  description: string;
  baseStats: Stats;
  allowedWeaponTypes: WeaponType[];
  icon: string;
}

// Updated Slots with Accessories
export type GearSlot = 
  | 'MainHand' 
  | 'OffHand' 
  | 'Helmet' 
  | 'Armor' 
  | 'Gloves' 
  | 'Boots' 
  | 'Necklace' 
  | 'Earring' 
  | 'Ring' 
  | 'Belt';

export type EquipmentSlot = GearSlot | 'Potions';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Equipment {
  name: string;
  slot: GearSlot;
  icon: string;
  stats: Partial<Stats>;
  rarity: Rarity;
  itemLevel: number;
  weaponType?: WeaponType; 
  isTwoHanded?: boolean; // New property for 2H weapons
  cost?: number;
}

export interface Player {
  name: string; 
  level: number; 
  xp: number; 
  xpToNextLevel: number; 
  classInfo: PlayerClass;
  baseStats: Stats; 
  currentStats: Stats; 
  accountBuffs: Partial<Record<keyof Stats, number>>; 
  currentHp: number; 
  eternalShards: number;
  potionCount: number;
  equipment: Partial<Record<GearSlot, Equipment>>;
  shopInventory: Equipment[];
  lastShopRefreshLevel: number;
  shopRefreshes: { level: number; count: number }; 
  achievementProgress: Record<string, number>; 
  claimedAchievements: string[]; 
  maxFloorReached: number;
  
  // Lifetime Stats
  totalEnemiesKilled: number;
  totalDeaths: number;
  totalAccumulatedXp: number;
  totalLifetimeShards: number;
  totalFlees: number;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  icon: string;
  minFloor: number; 
  isElite?: boolean;
  stats: {
    maxHp: number;
    hp: number;
    attack: number;
    defense: number;
    evasion: number;
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
  enemiesKilled: number;
  shardsEarned: number;
  fleePenalty?: {
      xpLost: number;
      shardsLost: number;
  };
}

export interface CombatLog {
    id: number;
    message: string;
    color: 'text-green-400' | 'text-[#D6721C]' | 'text-slate-200' | 'text-purple-400' | 'text-red-400' | 'text-cyan-400' | 'text-pink-400' | 'text-yellow-400';
}

// --- Achievements ---
export type AchievementType = 'slay' | 'reach_floor' | 'account_level';

export interface Reward {
  shards?: number;
  potions?: number;
}

export interface Achievement {
  id:string;
  title: string;
  description: string;
  type: AchievementType;
  goal: number;
  targetId?: string; // e.g., 'GOBLIN' for slay quests
  rewards: Reward;
  isBuff?: boolean; 
}