

import type { Equipment, Stats, GearSlot, Rarity, WeaponType } from '../types';

type ItemTemplate = Omit<Equipment, 'name' | 'stats' | 'rarity' | 'itemLevel'> & {
    name: string;
    possibleStats: (keyof Stats)[];
};

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0"; // Slate-200 color

// Using ultra-safe, standard icon names to prevent missing sprite issues
export const ITEM_TEMPLATES: Record<GearSlot, ItemTemplate[]> = {
    MainHand: [
        // Warrior Weapons (Sword, Hammer)
        { name: 'Broadsword', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'critRate', 'blockChance'] },
        { name: 'Greatsword', slot: 'MainHand', icon: `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`, weaponType: 'Sword', isTwoHanded: true, possibleStats: ['str', 'maxHp', 'lifesteal'] },
        { name: 'Longsword', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'dex', 'defense'] },
        { name: 'Zweihander', slot: 'MainHand', icon: `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`, weaponType: 'Sword', isTwoHanded: true, possibleStats: ['str', 'lifesteal', 'blockChance'] },
        { name: 'Falchion', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'evasion', 'dex'] },
        
        { name: 'Warhammer', slot: 'MainHand', icon: `${ICON_BASE}/warhammer.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'defense', 'blockChance'] },
        { name: 'Maul', slot: 'MainHand', icon: `${ICON_BASE}/wood-club.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'blockChance'] },
        { name: 'Battle Axe', slot: 'MainHand', icon: `${ICON_BASE}/battle-axe.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'lifesteal'] }, 
        { name: 'Sledgehammer', slot: 'MainHand', icon: `${ICON_BASE}/warhammer.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'maxHp', 'defense'] },
        { name: 'Great Maul', slot: 'MainHand', icon: `${ICON_BASE}/spiked-mace.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'maxHp'] },
        { name: 'War Axe', slot: 'MainHand', icon: `${ICON_BASE}/battle-axe.svg${COLOR_PARAM}`, weaponType: 'Hammer', possibleStats: ['str', 'dex', 'lifesteal'] },

        // Rogue Weapons (Dagger, Bow)
        { name: 'Dagger', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'lifesteal'] },
        { name: 'Kris', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'int', 'lifesteal'] },
        { name: 'Stiletto', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Dirk', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'str', 'evasion'] },
        
        { name: 'Longbow', slot: 'MainHand', icon: `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Crossbow', slot: 'MainHand', icon: `${ICON_BASE}/crossbow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'blockChance'] },
        { name: 'Shortbow', slot: 'MainHand', icon: `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Composite Bow', slot: 'MainHand', icon: `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'critRate'] },
        { name: 'Elven Bow', slot: 'MainHand', icon: `${ICON_BASE}/bow-arrow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'int', 'evasion'] },
        { name: 'Heavy Crossbow', slot: 'MainHand', icon: `${ICON_BASE}/crossbow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'defense'] },

        // Mage Weapons (Staff, Mace)
        { name: 'Staff', slot: 'MainHand', icon: `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`, weaponType: 'Staff', isTwoHanded: true, possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Wand', slot: 'MainHand', icon: `${ICON_BASE}/fairy-wand.svg${COLOR_PARAM}`, weaponType: 'Staff', possibleStats: ['int', 'critRate', 'lifesteal'] },
        { name: 'Elder Staff', slot: 'MainHand', icon: `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`, weaponType: 'Staff', isTwoHanded: true, possibleStats: ['int', 'maxHp', 'blockChance'] },
        { name: 'Crystal Wand', slot: 'MainHand', icon: `${ICON_BASE}/fairy-wand.svg${COLOR_PARAM}`, weaponType: 'Staff', possibleStats: ['int', 'lifesteal', 'evasion'] },
        
        { name: 'Mace', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'str', 'blockChance'] },
        { name: 'Morningstar', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'defense', 'lifesteal'] },
        { name: 'War Scepter', slot: 'MainHand', icon: `${ICON_BASE}/sceptre-of-power.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Flanged Mace', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['str', 'blockChance', 'int'] },
        { name: 'Holy Mace', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'maxHp', 'defense'] },
    ],
    OffHand: [
        // Warrior Shields
        { name: 'Wooden Shield', slot: 'OffHand', icon: `${ICON_BASE}/round-shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense'] },
        { name: 'Iron Shield', slot: 'OffHand', icon: `${ICON_BASE}/shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'maxHp'] },
        { name: 'Tower Shield', slot: 'OffHand', icon: `${ICON_BASE}/shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'str'] },
        
        // Rogue Off-hand (Daggers/Bucklers)
        { name: 'Parrying Dagger', slot: 'OffHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['evasion', 'dex', 'critRate'] },
        { name: 'Buckler', slot: 'OffHand', icon: `${ICON_BASE}/round-shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'evasion', 'dex'] },
        { name: 'Shadow Blade', slot: 'OffHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'lifesteal', 'critRate'] },

        // Mage Off-hand (Tomes/Orbs)
        { name: 'Spellbook', slot: 'OffHand', icon: `${ICON_BASE}/spell-book.svg${COLOR_PARAM}`, weaponType: 'Tome', possibleStats: ['int', 'maxHp'] },
        { name: 'Ancient Tome', slot: 'OffHand', icon: `${ICON_BASE}/spell-book.svg${COLOR_PARAM}`, weaponType: 'Tome', possibleStats: ['int', 'lifesteal', 'maxHp'] },
        { name: 'Crystal Orb', slot: 'OffHand', icon: `${ICON_BASE}/crystal-ball.svg${COLOR_PARAM}`, weaponType: 'Tome', possibleStats: ['int', 'lifesteal', 'critRate'] },
    ],
    Helmet: [
        { name: 'Iron Helm', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Great Helm', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'maxHp'] },
        { name: 'Bascinet', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['defense', 'str'] },
        
        { name: 'Leather Cap', slot: 'Helmet', icon: `${ICON_BASE}/cowled.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Hood', slot: 'Helmet', icon: `${ICON_BASE}/hood.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Bandana', slot: 'Helmet', icon: `${ICON_BASE}/bandana.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion'] },
        
        { name: 'Circlet', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Wizard Hat', slot: 'Helmet', icon: `${ICON_BASE}/pointy-hat.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Mystic Hood', slot: 'Helmet', icon: `${ICON_BASE}/hood.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'evasion'] },
    ],
    Armor: [
        { name: 'Chainmail', slot: 'Armor', icon: `${ICON_BASE}/chain-mail.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Plate Armor', slot: 'Armor', icon: `${ICON_BASE}/breastplate.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Breastplate', slot: 'Armor', icon: `${ICON_BASE}/breastplate.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'str'] },
        
        { name: 'Shadow Tunic', slot: 'Armor', icon: `${ICON_BASE}/leather-armor.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Leather Vest', slot: 'Armor', icon: `${ICON_BASE}/sleeveless-jacket.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Studded Leather', slot: 'Armor', icon: `${ICON_BASE}/leather-armor.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'maxHp'] },
        
        { name: 'Mage Robe', slot: 'Armor', icon: `${ICON_BASE}/robe.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'lifesteal'] },
        { name: 'Arcane Vestment', slot: 'Armor', icon: `${ICON_BASE}/robe.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Silk Robes', slot: 'Armor', icon: `${ICON_BASE}/shirt.svg${COLOR_PARAM}`, possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Boots: [
        { name: 'Greaves', slot: 'Boots', icon: `${ICON_BASE}/leg-armor.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'maxHp'] },
        { name: 'Iron Sabatons', slot: 'Boots', icon: `${ICON_BASE}/metal-boot.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp'] },
        { name: 'Plated Boots', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['defense', 'str', 'blockChance'] },
        
        { name: 'Leather Boots', slot: 'Boots', icon: `${ICON_BASE}/leather-boot.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion'] },
        { name: 'Light Shoes', slot: 'Boots', icon: `${ICON_BASE}/leather-boot.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Sandals', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion'] },
        
        { name: 'Silk Slippers', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['int', 'lifesteal', 'evasion'] },
        { name: 'Arcane Boots', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'lifesteal'] },
        { name: 'Soft Boots', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Gloves: [
        { name: 'Gauntlets', slot: 'Gloves', icon: `${ICON_BASE}/gauntlet.svg${COLOR_PARAM}`, possibleStats: ['str', 'defense', 'blockChance'] },
        { name: 'Steel Mitts', slot: 'Gloves', icon: `${ICON_BASE}/mailed-fist.svg${COLOR_PARAM}`, possibleStats: ['str', 'lifesteal', 'defense'] },
        { name: 'Iron Gauntlets', slot: 'Gloves', icon: `${ICON_BASE}/mailed-fist.svg${COLOR_PARAM}`, possibleStats: ['str', 'defense', 'blockChance'] },
        
        { name: 'Leather Gloves', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'lifesteal'] },
        { name: 'Thief Gloves', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['dex', 'critRate', 'evasion'] },
        { name: 'Fingerless Gloves', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['dex', 'lifesteal'] },
        
        { name: 'Cloth Wraps', slot: 'Gloves', icon: `${ICON_BASE}/hand-bandage.svg${COLOR_PARAM}`, possibleStats: ['int', 'lifesteal', 'evasion'] },
        { name: 'Spellbinders', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'lifesteal'] },
        { name: 'Mystic Wraps', slot: 'Gloves', icon: `${ICON_BASE}/hand-bandage.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'evasion'] },
    ],
    Necklace: [
        { name: 'Amulet', slot: 'Necklace', icon: `${ICON_BASE}/necklace.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'lifesteal', 'int'] },
        { name: 'Pendant', slot: 'Necklace', icon: `${ICON_BASE}/gem-necklace.svg${COLOR_PARAM}`, possibleStats: ['critRate', 'str', 'dex'] },
        { name: 'Choker', slot: 'Necklace', icon: `${ICON_BASE}/pearl-necklace.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'lifesteal', 'int'] },
        { name: 'Chain', slot: 'Necklace', icon: `${ICON_BASE}/necklace.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'str'] },
    ],
    Ring: [
        { name: 'Iron Band', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['defense', 'str', 'blockChance'] },
        { name: 'Gold Ring', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['critRate', 'int', 'lifesteal'] },
        { name: 'Signet Ring', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'dex', 'str'] },
        { name: 'Ruby Ring', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['str', 'critRate', 'maxHp'] },
    ],
    Earring: [
        { name: 'Stud', slot: 'Earring', icon: `${ICON_BASE}/earrings.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'dex', 'critRate'] },
        { name: 'Hoop', slot: 'Earring', icon: `${ICON_BASE}/earrings.svg${COLOR_PARAM}`, possibleStats: ['lifesteal', 'int', 'maxHp'] },
        { name: 'Charm', slot: 'Earring', icon: `${ICON_BASE}/earrings.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'lifesteal', 'int'] },
    ],
    Belt: [
        { name: 'Leather Belt', slot: 'Belt', icon: `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'defense', 'dex'] },
        { name: 'Sash', slot: 'Belt', icon: `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'evasion', 'lifesteal'] },
        { name: 'Girdle', slot: 'Belt', icon: `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'str'] },
        { name: 'Heavy Belt', slot: 'Belt', icon: `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'str'] },
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
