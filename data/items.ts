
import type { Equipment, Stats, GearSlot, Rarity, WeaponType } from '../types';

type ItemTemplate = Omit<Equipment, 'name' | 'stats' | 'rarity'> & {
    name: string;
    possibleStats: (keyof Stats)[];
};

export const ITEM_TEMPLATES: Record<GearSlot, ItemTemplate[]> = {
    Weapon: [
        // Warrior Weapons (Sword, Hammer)
        { name: 'Broadsword', slot: 'Weapon', icon: '⚔️', weaponType: 'Sword', possibleStats: ['str', 'critRate', 'defense'] },
        { name: 'Greatsword', slot: 'Weapon', icon: '🗡️', weaponType: 'Sword', possibleStats: ['str', 'maxHp', 'defense'] },
        { name: 'Longsword', slot: 'Weapon', icon: '⚔️', weaponType: 'Sword', possibleStats: ['str', 'dex', 'defense'] },
        { name: 'Zweihander', slot: 'Weapon', icon: '🗡️', weaponType: 'Sword', possibleStats: ['str', 'maxHp', 'critRate'] },
        { name: 'Falchion', slot: 'Weapon', icon: '🪒', weaponType: 'Sword', possibleStats: ['str', 'evasion', 'dex'] },
        
        { name: 'Warhammer', slot: 'Weapon', icon: '🔨', weaponType: 'Hammer', possibleStats: ['str', 'defense', 'maxHp'] },
        { name: 'Maul', slot: 'Weapon', icon: '⚒️', weaponType: 'Hammer', possibleStats: ['str', 'critRate'] },
        { name: 'Battle Axe', slot: 'Weapon', icon: '🪓', weaponType: 'Hammer', possibleStats: ['str', 'critRate', 'defense'] }, 
        { name: 'Sledgehammer', slot: 'Weapon', icon: '🔨', weaponType: 'Hammer', possibleStats: ['str', 'maxHp', 'defense'] },
        { name: 'Great Maul', slot: 'Weapon', icon: '⚒️', weaponType: 'Hammer', possibleStats: ['str', 'critRate', 'maxHp'] },
        { name: 'War Axe', slot: 'Weapon', icon: '🪓', weaponType: 'Hammer', possibleStats: ['str', 'dex', 'critRate'] },

        // Rogue Weapons (Dagger, Bow)
        { name: 'Dagger', slot: 'Weapon', icon: '🔪', weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Kris', slot: 'Weapon', icon: '🗡️', weaponType: 'Dagger', possibleStats: ['dex', 'int', 'critRate'] },
        { name: 'Stiletto', slot: 'Weapon', icon: '🗡️', weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'int'] },
        { name: 'Dirk', slot: 'Weapon', icon: '🔪', weaponType: 'Dagger', possibleStats: ['dex', 'str', 'evasion'] },
        
        { name: 'Longbow', slot: 'Weapon', icon: '🏹', weaponType: 'Bow', possibleStats: ['dex', 'critRate'] },
        { name: 'Crossbow', slot: 'Weapon', icon: '🏹', weaponType: 'Bow', possibleStats: ['dex', 'str', 'defense'] },
        { name: 'Shortbow', slot: 'Weapon', icon: '🏹', weaponType: 'Bow', possibleStats: ['dex', 'evasion'] },
        { name: 'Composite Bow', slot: 'Weapon', icon: '🏹', weaponType: 'Bow', possibleStats: ['dex', 'str', 'critRate'] },
        { name: 'Elven Bow', slot: 'Weapon', icon: '🍃', weaponType: 'Bow', possibleStats: ['dex', 'int', 'evasion'] },
        { name: 'Heavy Crossbow', slot: 'Weapon', icon: '🏹', weaponType: 'Bow', possibleStats: ['dex', 'str', 'defense'] },

        // Mage Weapons (Staff, Mace)
        { name: 'Staff', slot: 'Weapon', icon: '🪄', weaponType: 'Staff', possibleStats: ['int', 'maxHp', 'evasion'] },
        { name: 'Wand', slot: 'Weapon', icon: '🥢', weaponType: 'Staff', possibleStats: ['int', 'critRate'] },
        { name: 'Elder Staff', slot: 'Weapon', icon: '🎋', weaponType: 'Staff', possibleStats: ['int', 'maxHp', 'defense'] },
        { name: 'Crystal Wand', slot: 'Weapon', icon: '🪄', weaponType: 'Staff', possibleStats: ['int', 'critRate', 'evasion'] },
        
        { name: 'Mace', slot: 'Weapon', icon: '🏺', weaponType: 'Mace', possibleStats: ['int', 'str', 'defense'] },
        { name: 'Morningstar', slot: 'Weapon', icon: '✴️', weaponType: 'Mace', possibleStats: ['int', 'defense', 'critRate'] },
        { name: 'War Scepter', slot: 'Weapon', icon: '👑', weaponType: 'Mace', possibleStats: ['int', 'maxHp'] },
        { name: 'Flanged Mace', slot: 'Weapon', icon: '🦴', weaponType: 'Mace', possibleStats: ['str', 'defense', 'int'] },
        { name: 'Holy Mace', slot: 'Weapon', icon: '✨', weaponType: 'Mace', possibleStats: ['int', 'maxHp', 'defense'] },
    ],
    Helmet: [
        { name: 'Iron Helm', slot: 'Helmet', icon: '🪖', possibleStats: ['defense', 'maxHp', 'str'] },
        { name: 'Great Helm', slot: 'Helmet', icon: '🗿', possibleStats: ['defense', 'str', 'maxHp'] },
        { name: 'Bascinet', slot: 'Helmet', icon: '🛡️', possibleStats: ['defense', 'str'] },
        
        { name: 'Leather Cap', slot: 'Helmet', icon: '🧢', possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Hood', slot: 'Helmet', icon: '👤', possibleStats: ['dex', 'evasion', 'critRate'] },
        { name: 'Bandana', slot: 'Helmet', icon: '🧣', possibleStats: ['dex', 'evasion'] },
        
        { name: 'Circlet', slot: 'Helmet', icon: '👑', possibleStats: ['int', 'maxHp', 'critRate'] },
        { name: 'Wizard Hat', slot: 'Helmet', icon: '🧙', possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Mystic Hood', slot: 'Helmet', icon: '🔮', possibleStats: ['int', 'maxHp'] },
    ],
    Armor: [
        { name: 'Chainmail', slot: 'Armor', icon: '👕', possibleStats: ['defense', 'maxHp', 'str'] },
        { name: 'Plate Armor', slot: 'Armor', icon: '🛡️', possibleStats: ['defense', 'maxHp', 'str'] },
        { name: 'Breastplate', slot: 'Armor', icon: '🛡️', possibleStats: ['defense', 'str', 'dex'] },
        
        { name: 'Shadow Tunic', slot: 'Armor', icon: '🧥', possibleStats: ['dex', 'evasion', 'critRate'] },
        { name: 'Leather Vest', slot: 'Armor', icon: '🦺', possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Studded Leather', slot: 'Armor', icon: '🦺', possibleStats: ['dex', 'defense', 'maxHp'] },
        
        { name: 'Mage Robe', slot: 'Armor', icon: '👘', possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Arcane Vestment', slot: 'Armor', icon: '🌌', possibleStats: ['int', 'maxHp', 'critRate'] },
        { name: 'Silk Robes', slot: 'Armor', icon: '👘', possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Boots: [
        { name: 'Greaves', slot: 'Boots', icon: '👢', possibleStats: ['defense', 'str', 'maxHp'] },
        { name: 'Iron Sabatons', slot: 'Boots', icon: '🦶', possibleStats: ['defense', 'maxHp'] },
        { name: 'Plated Boots', slot: 'Boots', icon: '🦶', possibleStats: ['defense', 'str'] },
        
        { name: 'Leather Boots', slot: 'Boots', icon: '👞', possibleStats: ['dex', 'evasion'] },
        { name: 'Light Shoes', slot: 'Boots', icon: '👟', possibleStats: ['dex', 'evasion', 'critRate'] },
        { name: 'Sandals', slot: 'Boots', icon: '🩴', possibleStats: ['dex', 'evasion'] },
        
        { name: 'Silk Slippers', slot: 'Boots', icon: '🥿', possibleStats: ['int', 'maxHp', 'evasion'] },
        { name: 'Arcane Boots', slot: 'Boots', icon: '👢', possibleStats: ['int', 'defense'] },
        { name: 'Soft Boots', slot: 'Boots', icon: '🧦', possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Gloves: [
        { name: 'Gauntlets', slot: 'Gloves', icon: '🧤', possibleStats: ['str', 'defense', 'maxHp'] },
        { name: 'Steel Mitts', slot: 'Gloves', icon: '🥊', possibleStats: ['str', 'critRate', 'defense'] },
        { name: 'Iron Gauntlets', slot: 'Gloves', icon: '🧤', possibleStats: ['str', 'defense'] },
        
        { name: 'Leather Gloves', slot: 'Gloves', icon: '🧤', possibleStats: ['dex', 'evasion'] },
        { name: 'Thief Gloves', slot: 'Gloves', icon: '🤏', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Fingerless Gloves', slot: 'Gloves', icon: '🧤', possibleStats: ['dex', 'critRate'] },
        
        { name: 'Cloth Wraps', slot: 'Gloves', icon: '🧣', possibleStats: ['int', 'critRate', 'evasion'] },
        { name: 'Spellbinders', slot: 'Gloves', icon: '🔮', possibleStats: ['int', 'maxHp', 'defense'] },
        { name: 'Mystic Wraps', slot: 'Gloves', icon: '🧣', possibleStats: ['int', 'maxHp', 'evasion'] },
    ],
};

export const ITEM_PREFIXES: Record<Rarity, string[]> = {
    Common: ['Common', 'Worn', 'Simple', 'Old', 'Dusty', 'Broken', 'Rusted', 'Crude', 'Plain', 'Dull'],
    Uncommon: ['Sturdy', 'Enhanced', 'Adept', 'Polished', 'Sharp', 'Reinforced', 'Heavy', 'Honed', 'Fine', 'Keen'],
    Rare: ['Superior', 'Ornate', 'Masterwork', 'Gleaming', 'Fierce', 'Cruel', 'Elegant', 'Deadly', 'Radiant', 'Vicious'],
    Epic: ['Legendary', 'Godly', 'Eternal', 'Radiant', 'Chaos', 'Void', 'Astral', 'Infernal', 'Draconic', 'Spectral'],
    Legendary: ['Mythical', 'Divine', 'Ascended', 'Primordial', 'Infinite', 'Omnipotent', 'Celestial', 'Abyssal', 'Cosmic', 'Titan'],
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
