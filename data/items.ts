import type { Equipment, Stats, GearSlot } from '../types';

type ItemTemplate = Omit<Equipment, 'name' | 'stats'> & {
    name: string;
    possibleStats: (keyof Stats)[];
};

export const ITEM_TEMPLATES: Record<GearSlot, ItemTemplate[]> = {
    Weapon: [
        { name: 'Sword', slot: 'Weapon', icon: '⚔️', possibleStats: ['str', 'critRate'] },
        { name: 'Dagger', slot: 'Weapon', icon: '🔪', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Staff', slot: 'Weapon', icon: '🪄', possibleStats: ['int', 'maxHp'] },
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

export const ITEM_PREFIXES = {
    common: ['Common', 'Worn', 'Simple'],
    uncommon: ['Sturdy', 'Enhanced', 'Adept'],
    rare: ['Superior', 'Ornate', 'Masterwork'],
    epic: ['Legendary', 'Godly', 'Eternal'],
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