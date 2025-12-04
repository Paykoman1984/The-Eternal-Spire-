
import type { Equipment, Stats, GearSlot, Rarity, WeaponType } from '../types';

type ItemTemplate = Omit<Equipment, 'name' | 'stats' | 'rarity'> & {
    name: string;
    possibleStats: (keyof Stats)[];
};

export const ITEM_TEMPLATES: Record<GearSlot, ItemTemplate[]> = {
    Weapon: [
        // Warrior Weapons
        { name: 'Sword', slot: 'Weapon', icon: '⚔️', weaponType: 'Sword', possibleStats: ['str', 'critRate'] },
        { name: 'Warhammer', slot: 'Weapon', icon: '🔨', weaponType: 'Hammer', possibleStats: ['str', 'defense'] },
        
        // Rogue Weapons
        { name: 'Dagger', slot: 'Weapon', icon: '🔪', weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Longbow', slot: 'Weapon', icon: '🏹', weaponType: 'Bow', possibleStats: ['dex', 'critRate'] },
        
        // Mage Weapons
        { name: 'Staff', slot: 'Weapon', icon: '🪄', weaponType: 'Staff', possibleStats: ['int', 'maxHp'] },
        { name: 'Mace', slot: 'Weapon', icon: '🏺', weaponType: 'Mace', possibleStats: ['int', 'str', 'defense'] }, // Battlemage style
    ],
    Helmet: [
        { name: 'Iron Helm', slot: 'Helmet', icon: '🪖', possibleStats: ['defense', 'maxHp'] },
        { name: 'Leather Cap', slot: 'Helmet', icon: '🧢', possibleStats: ['dex', 'defense', 'evasion'] },
    ],
    Armor: [
        { name: 'Chainmail', slot: 'Armor', icon: '👕', possibleStats: ['defense', 'maxHp', 'str'] },
        { name: 'Mage Robe', slot: 'Armor', icon: '👘', possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Shadow Tunic', slot: 'Armor', icon: '🧥', possibleStats: ['dex', 'evasion', 'critRate'] },
    ],
    Boots: [
        { name: 'Greaves', slot: 'Boots', icon: '👢', possibleStats: ['defense', 'str'] },
        { name: 'Leather Boots', slot: 'Boots', icon: '👞', possibleStats: ['dex', 'evasion'] },
    ],
    Gloves: [
        { name: 'Gauntlets', slot: 'Gloves', icon: '🧤', possibleStats: ['str', 'defense'] },
        { name: 'Cloth Wraps', slot: 'Gloves', icon: '🧤', possibleStats: ['int', 'critRate'] },
        { name: 'Leather Gloves', slot: 'Gloves', icon: '🧤', possibleStats: ['dex', 'evasion'] },
    ],
};

export const ITEM_PREFIXES: Record<Rarity, string[]> = {
    Common: ['Common', 'Worn', 'Simple', 'Old', 'Dusty'],
    Uncommon: ['Sturdy', 'Enhanced', 'Adept', 'Polished', 'Sharp'],
    Rare: ['Superior', 'Ornate', 'Masterwork', 'Gleaming', 'Fierce'],
    Epic: ['Legendary', 'Godly', 'Eternal', 'Radiant', 'Chaos'],
    Legendary: ['Mythical', 'Divine', 'Ascended', 'Primordial', 'Infinite'],
};

export const RARITY_COLORS: Record<Rarity, string> = {
    Common: 'text-slate-300',
    Uncommon: 'text-green-400',
    Rare: 'text-blue-400',
    Epic: 'text-purple-400',
    Legendary: 'text-[#D6721C]', // Orange
};

export const STAT_WEIGHTS: Record<keyof Stats, number> = {
    str: 1,
    dex: 1,
    int: 1,
    defense: 1,
    maxHp: 5,
    critRate: 0.5,
    evasion: 0.4,
};
