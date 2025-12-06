

import type { Equipment, Stats, GearSlot, Rarity, WeaponType } from '../types';

type ItemTemplate = Omit<Equipment, 'name' | 'stats' | 'rarity' | 'itemLevel'> & {
    name: string;
    possibleStats: (keyof Stats)[];
};

export const ITEM_TEMPLATES: Record<GearSlot, ItemTemplate[]> = {
    MainHand: [
        // Warrior Weapons (Sword, Hammer)
        { name: 'Broadsword', slot: 'MainHand', icon: '⚔️', weaponType: 'Sword', possibleStats: ['str', 'critRate', 'blockChance'] },
        { name: 'Greatsword', slot: 'MainHand', icon: '🗡️', weaponType: 'Sword', isTwoHanded: true, possibleStats: ['str', 'maxHp', 'lifesteal'] },
        { name: 'Longsword', slot: 'MainHand', icon: '⚔️', weaponType: 'Sword', possibleStats: ['str', 'dex', 'defense'] },
        { name: 'Zweihander', slot: 'MainHand', icon: '🗡️', weaponType: 'Sword', isTwoHanded: true, possibleStats: ['str', 'lifesteal', 'blockChance'] },
        { name: 'Falchion', slot: 'MainHand', icon: '🪒', weaponType: 'Sword', possibleStats: ['str', 'evasion', 'dex'] },
        
        { name: 'Warhammer', slot: 'MainHand', icon: '🔨', weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'defense', 'blockChance'] },
        { name: 'Maul', slot: 'MainHand', icon: '⚒️', weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'blockChance'] },
        { name: 'Battle Axe', slot: 'MainHand', icon: '🪓', weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'lifesteal'] }, 
        { name: 'Sledgehammer', slot: 'MainHand', icon: '🔨', weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'maxHp', 'defense'] },
        { name: 'Great Maul', slot: 'MainHand', icon: '⚒️', weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'maxHp'] },
        { name: 'War Axe', slot: 'MainHand', icon: '🪓', weaponType: 'Hammer', possibleStats: ['str', 'dex', 'lifesteal'] },

        // Rogue Weapons (Dagger, Bow)
        { name: 'Dagger', slot: 'MainHand', icon: '🔪', weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'lifesteal'] },
        { name: 'Kris', slot: 'MainHand', icon: '🗡️', weaponType: 'Dagger', possibleStats: ['dex', 'int', 'lifesteal'] },
        { name: 'Stiletto', slot: 'MainHand', icon: '🗡️', weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Dirk', slot: 'MainHand', icon: '🔪', weaponType: 'Dagger', possibleStats: ['dex', 'str', 'evasion'] },
        
        { name: 'Longbow', slot: 'MainHand', icon: '🏹', weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Crossbow', slot: 'MainHand', icon: '🏹', weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'blockChance'] },
        { name: 'Shortbow', slot: 'MainHand', icon: '🏹', weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Composite Bow', slot: 'MainHand', icon: '🏹', weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'critRate'] },
        { name: 'Elven Bow', slot: 'MainHand', icon: '🍃', weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'int', 'evasion'] },
        { name: 'Heavy Crossbow', slot: 'MainHand', icon: '🏹', weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'defense'] },

        // Mage Weapons (Staff, Mace)
        { name: 'Staff', slot: 'MainHand', icon: '🪄', weaponType: 'Staff', isTwoHanded: true, possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Wand', slot: 'MainHand', icon: '🥢', weaponType: 'Staff', possibleStats: ['int', 'critRate', 'lifesteal'] },
        { name: 'Elder Staff', slot: 'MainHand', icon: '🎋', weaponType: 'Staff', isTwoHanded: true, possibleStats: ['int', 'maxHp', 'blockChance'] },
        { name: 'Crystal Wand', slot: 'MainHand', icon: '🪄', weaponType: 'Staff', possibleStats: ['int', 'lifesteal', 'evasion'] },
        
        { name: 'Mace', slot: 'MainHand', icon: '🏺', weaponType: 'Mace', possibleStats: ['int', 'str', 'blockChance'] },
        { name: 'Morningstar', slot: 'MainHand', icon: '✴️', weaponType: 'Mace', possibleStats: ['int', 'defense', 'lifesteal'] },
        { name: 'War Scepter', slot: 'MainHand', icon: '👑', weaponType: 'Mace', possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Flanged Mace', slot: 'MainHand', icon: '🦴', weaponType: 'Mace', possibleStats: ['str', 'blockChance', 'int'] },
        { name: 'Holy Mace', slot: 'MainHand', icon: '✨', weaponType: 'Mace', possibleStats: ['int', 'maxHp', 'defense'] },
    ],
    OffHand: [
        // Warrior Shields
        { name: 'Wooden Shield', slot: 'OffHand', icon: '🛡️', weaponType: 'Shield', possibleStats: ['blockChance', 'defense'] },
        { name: 'Iron Shield', slot: 'OffHand', icon: '🛡️', weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'maxHp'] },
        { name: 'Tower Shield', slot: 'OffHand', icon: '🚪', weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'str'] },
        
        // Rogue Off-hand (Daggers/Bucklers)
        { name: 'Parrying Dagger', slot: 'OffHand', icon: '🔪', weaponType: 'Dagger', possibleStats: ['evasion', 'dex', 'critRate'] },
        { name: 'Buckler', slot: 'OffHand', icon: '🛡️', weaponType: 'Shield', possibleStats: ['blockChance', 'evasion', 'dex'] },
        { name: 'Shadow Blade', slot: 'OffHand', icon: '🗡️', weaponType: 'Dagger', possibleStats: ['dex', 'lifesteal', 'critRate'] },

        // Mage Off-hand (Tomes/Orbs)
        { name: 'Spellbook', slot: 'OffHand', icon: '📖', weaponType: 'Tome', possibleStats: ['int', 'maxHp'] },
        { name: 'Ancient Tome', slot: 'OffHand', icon: '📚', weaponType: 'Tome', possibleStats: ['int', 'lifesteal', 'maxHp'] },
        { name: 'Crystal Orb', slot: 'OffHand', icon: '🔮', weaponType: 'Tome', possibleStats: ['int', 'lifesteal', 'critRate'] },
    ],
    Helmet: [
        { name: 'Iron Helm', slot: 'Helmet', icon: '🪖', possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Great Helm', slot: 'Helmet', icon: '🗿', possibleStats: ['defense', 'blockChance', 'maxHp'] },
        { name: 'Bascinet', slot: 'Helmet', icon: '🛡️', possibleStats: ['defense', 'str'] },
        
        { name: 'Leather Cap', slot: 'Helmet', icon: '🧢', possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Hood', slot: 'Helmet', icon: '👤', possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Bandana', slot: 'Helmet', icon: '🧣', possibleStats: ['dex', 'evasion'] },
        
        { name: 'Circlet', slot: 'Helmet', icon: '👑', possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Wizard Hat', slot: 'Helmet', icon: '🧙', possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Mystic Hood', slot: 'Helmet', icon: '🔮', possibleStats: ['int', 'maxHp', 'evasion'] },
    ],
    Armor: [
        { name: 'Chainmail', slot: 'Armor', icon: '👕', possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Plate Armor', slot: 'Armor', icon: '🛡️', possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Breastplate', slot: 'Armor', icon: '🛡️', possibleStats: ['defense', 'blockChance', 'str'] },
        
        { name: 'Shadow Tunic', slot: 'Armor', icon: '🧥', possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Leather Vest', slot: 'Armor', icon: '🦺', possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Studded Leather', slot: 'Armor', icon: '🦺', possibleStats: ['dex', 'defense', 'maxHp'] },
        
        { name: 'Mage Robe', slot: 'Armor', icon: '👘', possibleStats: ['int', 'defense', 'lifesteal'] },
        { name: 'Arcane Vestment', slot: 'Armor', icon: '🌌', possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Silk Robes', slot: 'Armor', icon: '👘', possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Boots: [
        { name: 'Greaves', slot: 'Boots', icon: '👢', possibleStats: ['defense', 'blockChance', 'maxHp'] },
        { name: 'Iron Sabatons', slot: 'Boots', icon: '🦶', possibleStats: ['defense', 'maxHp'] },
        { name: 'Plated Boots', slot: 'Boots', icon: '🦶', possibleStats: ['defense', 'str', 'blockChance'] },
        
        { name: 'Leather Boots', slot: 'Boots', icon: '👞', possibleStats: ['dex', 'evasion'] },
        { name: 'Light Shoes', slot: 'Boots', icon: '👟', possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Sandals', slot: 'Boots', icon: '🩴', possibleStats: ['dex', 'evasion'] },
        
        { name: 'Silk Slippers', slot: 'Boots', icon: '🥿', possibleStats: ['int', 'lifesteal', 'evasion'] },
        { name: 'Arcane Boots', slot: 'Boots', icon: '👢', possibleStats: ['int', 'defense', 'lifesteal'] },
        { name: 'Soft Boots', slot: 'Boots', icon: '🧦', possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Gloves: [
        { name: 'Gauntlets', slot: 'Gloves', icon: '🧤', possibleStats: ['str', 'defense', 'blockChance'] },
        { name: 'Steel Mitts', slot: 'Gloves', icon: '🥊', possibleStats: ['str', 'lifesteal', 'defense'] },
        { name: 'Iron Gauntlets', slot: 'Gloves', icon: '🧤', possibleStats: ['str', 'defense', 'blockChance'] },
        
        { name: 'Leather Gloves', slot: 'Gloves', icon: '🧤', possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Thief Gloves', slot: 'Gloves', icon: '🤏', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Fingerless Gloves', slot: 'Gloves', icon: '🧤', possibleStats: ['dex', 'lifesteal'] },
        
        { name: 'Cloth Wraps', slot: 'Gloves', icon: '🧣', possibleStats: ['int', 'lifesteal', 'evasion'] },
        { name: 'Spellbinders', slot: 'Gloves', icon: '🔮', possibleStats: ['int', 'maxHp', 'lifesteal'] },
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
    blockChance: 0.5,
    lifesteal: 0.4,
};