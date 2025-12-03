export type GameScreen = 'start' | 'class_selection' | 'main_game';

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

export interface Player {
  level: number;
  xp: number;
  xpToNextLevel: number;
  classInfo: PlayerClass;
  currentStats: Stats;
  currentHp: number;
  eternalShards: number;
}

export type EquipmentSlot = 'Weapon' | 'Helmet' | 'Armor' | 'Boots' | 'Gloves' | 'Potions';