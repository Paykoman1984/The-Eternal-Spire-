
export type GameScreen = 'start' | 'profile_selection' | 'name_selection' | 'class_selection' | 'main_game' | 'combat' | 'shop' | 'achievements' | 'run_summary' | 'stats' | 'skills';

export type ClassName = 'Warrior' | 'Rogue' | 'Mage';

export interface Stats {
  str: number;
  dex: number;
  int: number;
  maxHp: number;
  maxEnergy: number;
  maxMana: number;
  defense: number;
  critRate: number;
  evasion: number;
  blockChance: number;
  lifesteal: number;
  attackSpeed: number;
  castSpeed: number;
}

export type WeaponType = 'Sword' | 'Hammer' | 'Dagger' | 'Bow' | 'Mace' | 'Staff' | 'Shield' | 'Tome' | 'None';

export interface PlayerClass {
  name: ClassName;
  description: string;
  baseStats: Stats;
  allowedWeaponTypes: WeaponType[];
  icon: string;
}

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
  isTwoHanded?: boolean; 
  cost?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  tier: number;
  maxLevel: number;
  cost: number; // Resource cost (Mana/Energy)
  pointsRequired: number; // Skill points per level
  cooldown?: number; // Base cooldown in seconds
  procChance?: number; // No longer used for active skills, kept for passive triggers if any
  stats?: Partial<Stats>;
  icon: string;
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
  currentEnergy: number;
  currentMana: number;
  skillPoints: number;
  skills: Record<string, number>; // Maps skillId to current level
  unlockedSkills?: string[]; // Deprecated, kept for migration
  eternalShards: number;
  eternalDust: number;
  potionCount: number;
  equipment: Partial<Record<GearSlot, Equipment>>;
  inventory: Equipment[]; 
  shopInventory: Equipment[];
  lastShopRefreshLevel: number;
  shopRefreshes: { level: number; count: number }; 
  achievementProgress: Record<string, number>; 
  claimedAchievements: string[]; 
  maxFloorReached: number;
  
  totalEnemiesKilled: number;
  totalDeaths: number;
  totalAccumulatedXp: number;
  totalLifetimeShards: number;
  totalLifetimeDust: number;
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
  playerCurrentEnergyInRun: number;
  playerCurrentManaInRun: number;
  currentEnemy: Enemy;
  pendingLoot: Equipment[];
  enemiesKilled: number;
  shardsEarned: number;
  isAutoBattling?: boolean; 
  skillCooldowns: Record<string, number>; // Remaining cooldown seconds
  fleePenalty?: {
      xpLost: number;
      shardsLost: number;
  };
  pendingLevelUpHeal?: boolean;
}

export interface CombatLog {
    id: number;
    message: string;
    color: 'text-green-400' | 'text-[#D6721C]' | 'text-slate-200' | 'text-purple-400' | 'text-red-400' | 'text-cyan-400' | 'text-pink-400' | 'text-yellow-400' | 'text-indigo-400';
}

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
  targetId?: string; 
  rewards: Reward;
  isBuff?: boolean; 
}
