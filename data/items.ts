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
        // Warrior Weapons (Sword, Hammer) - Focus: Str, Crit, AtkSpeed
        { name: 'Broadsword', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'critRate', 'attackSpeed'] },
        { name: 'Greatsword', slot: 'MainHand', icon: `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`, weaponType: 'Sword', isTwoHanded: true, possibleStats: ['str', 'attackSpeed', 'critRate'] },
        { name: 'Longsword', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'attackSpeed', 'dex'] },
        { name: 'Zweihander', slot: 'MainHand', icon: `${ICON_BASE}/two-handed-sword.svg${COLOR_PARAM}`, weaponType: 'Sword', isTwoHanded: true, possibleStats: ['str', 'attackSpeed', 'critRate'] },
        { name: 'Falchion', slot: 'MainHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'attackSpeed', 'dex'] },
        
        { name: 'Warhammer', slot: 'MainHand', icon: `${ICON_BASE}/warhammer.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'attackSpeed'] },
        { name: 'Maul', slot: 'MainHand', icon: `${ICON_BASE}/spiked-club.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'lifesteal'] },
        { name: 'Battle Axe', slot: 'MainHand', icon: `${ICON_BASE}/battle-axe.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'attackSpeed'] }, 
        { name: 'Sledgehammer', slot: 'MainHand', icon: `${ICON_BASE}/large-hammer.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'attackSpeed', 'critRate'] },
        { name: 'Great Maul', slot: 'MainHand', icon: `${ICON_BASE}/spiked-mace.svg${COLOR_PARAM}`, weaponType: 'Hammer', isTwoHanded: true, possibleStats: ['str', 'critRate', 'lifesteal'] },
        { name: 'War Axe', slot: 'MainHand', icon: `${ICON_BASE}/battle-axe.svg${COLOR_PARAM}`, weaponType: 'Hammer', possibleStats: ['str', 'dex', 'attackSpeed'] },

        // Rogue Weapons (Dagger, Bow) - Focus: Dex, Crit, AtkSpeed
        { name: 'Dagger', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'attackSpeed'] },
        { name: 'Kris', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'attackSpeed', 'lifesteal'] },
        { name: 'Stiletto', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'critRate', 'attackSpeed'] },
        { name: 'Dirk', slot: 'MainHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'str', 'attackSpeed'] },
        
        { name: 'Longbow', slot: 'MainHand', icon: `${ICON_BASE}/high-shot.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'critRate', 'attackSpeed'] },
        { name: 'Crossbow', slot: 'MainHand', icon: `${ICON_BASE}/crossbow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'critRate'] },
        { name: 'Shortbow', slot: 'MainHand', icon: `${ICON_BASE}/high-shot.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'attackSpeed', 'lifesteal'] },
        { name: 'Composite Bow', slot: 'MainHand', icon: `${ICON_BASE}/high-shot.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'critRate'] },
        { name: 'Elven Bow', slot: 'MainHand', icon: `${ICON_BASE}/high-shot.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'int', 'attackSpeed'] },
        { name: 'Heavy Crossbow', slot: 'MainHand', icon: `${ICON_BASE}/crossbow.svg${COLOR_PARAM}`, weaponType: 'Bow', isTwoHanded: true, possibleStats: ['dex', 'str', 'critRate'] },

        // Mage Weapons (Staff, Mace) - Focus: Int, Crit, CastSpeed
        { name: 'Staff', slot: 'MainHand', icon: `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`, weaponType: 'Staff', isTwoHanded: true, possibleStats: ['int', 'castSpeed', 'lifesteal'] },
        { name: 'Wand', slot: 'MainHand', icon: `${ICON_BASE}/fairy-wand.svg${COLOR_PARAM}`, weaponType: 'Staff', possibleStats: ['int', 'critRate', 'castSpeed'] },
        { name: 'Elder Staff', slot: 'MainHand', icon: `${ICON_BASE}/wizard-staff.svg${COLOR_PARAM}`, weaponType: 'Staff', isTwoHanded: true, possibleStats: ['int', 'castSpeed', 'critRate'] },
        { name: 'Crystal Wand', slot: 'MainHand', icon: `${ICON_BASE}/fairy-wand.svg${COLOR_PARAM}`, weaponType: 'Staff', possibleStats: ['int', 'lifesteal', 'castSpeed'] },
        
        { name: 'Mace', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'str', 'castSpeed'] },
        { name: 'Morningstar', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'critRate', 'lifesteal'] },
        { name: 'War Scepter', slot: 'MainHand', icon: `${ICON_BASE}/orb-wand.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'castSpeed', 'lifesteal'] },
        { name: 'Flanged Mace', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['str', 'critRate', 'int'] },
        { name: 'Holy Mace', slot: 'MainHand', icon: `${ICON_BASE}/flanged-mace.svg${COLOR_PARAM}`, weaponType: 'Mace', possibleStats: ['int', 'castSpeed', 'str'] },
    ],
    OffHand: [
        // Warrior Shields - Focus: Defense, Block, HP
        { name: 'Wooden Shield', slot: 'OffHand', icon: `${ICON_BASE}/round-shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense'] },
        { name: 'Iron Shield', slot: 'OffHand', icon: `${ICON_BASE}/shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'maxHp'] },
        { name: 'Tower Shield', slot: 'OffHand', icon: `${ICON_BASE}/shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'str'] },
        
        // Warrior Off-hand Swords - Focus: Offensive
        { name: 'Shortsword', slot: 'OffHand', icon: `${ICON_BASE}/gladius.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'dex', 'attackSpeed'] },
        { name: 'Parrying Blade', slot: 'OffHand', icon: `${ICON_BASE}/rapier.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['str', 'critRate', 'attackSpeed'] },
        { name: 'Defender', slot: 'OffHand', icon: `${ICON_BASE}/broadsword.svg${COLOR_PARAM}`, weaponType: 'Sword', possibleStats: ['defense', 'blockChance', 'maxHp'] }, // Defender exception: Defensive sword

        // Rogue Off-hand (Daggers/Bucklers)
        { name: 'Parrying Dagger', slot: 'OffHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['attackSpeed', 'dex', 'critRate'] },
        { name: 'Buckler', slot: 'OffHand', icon: `${ICON_BASE}/round-shield.svg${COLOR_PARAM}`, weaponType: 'Shield', possibleStats: ['blockChance', 'defense', 'dex'] },
        { name: 'Shadow Blade', slot: 'OffHand', icon: `${ICON_BASE}/plain-dagger.svg${COLOR_PARAM}`, weaponType: 'Dagger', possibleStats: ['dex', 'lifesteal', 'attackSpeed'] },

        // Mage Off-hand (Tomes/Orbs)
        { name: 'Spellbook', slot: 'OffHand', icon: `${ICON_BASE}/spell-book.svg${COLOR_PARAM}`, weaponType: 'Tome', possibleStats: ['int', 'maxHp', 'castSpeed'] },
        { name: 'Ancient Tome', slot: 'OffHand', icon: `${ICON_BASE}/spell-book.svg${COLOR_PARAM}`, weaponType: 'Tome', possibleStats: ['int', 'lifesteal', 'castSpeed'] },
        { name: 'Crystal Orb', slot: 'OffHand', icon: `${ICON_BASE}/crystal-ball.svg${COLOR_PARAM}`, weaponType: 'Tome', possibleStats: ['int', 'lifesteal', 'critRate'] },
    ],
    // ARMOR - Focus: Defense, HP, Block, Evasion + Main Stats
    Helmet: [
        { name: 'Iron Helm', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Great Helm', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'maxHp'] },
        { name: 'Bascinet', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['defense', 'str', 'maxHp'] },
        
        { name: 'Leather Cap', slot: 'Helmet', icon: `${ICON_BASE}/cowled.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Hood', slot: 'Helmet', icon: `${ICON_BASE}/hood.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'defense'] },
        { name: 'Bandana', slot: 'Helmet', icon: `${ICON_BASE}/bandana.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'maxHp'] },
        
        { name: 'Circlet', slot: 'Helmet', icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'defense'] },
        { name: 'Wizard Hat', slot: 'Helmet', icon: `${ICON_BASE}/pointy-hat.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Mystic Hood', slot: 'Helmet', icon: `${ICON_BASE}/hood.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'evasion'] },
    ],
    Armor: [
        { name: 'Chainmail', slot: 'Armor', icon: `${ICON_BASE}/chain-mail.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Plate Armor', slot: 'Armor', icon: `${ICON_BASE}/breastplate.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp', 'blockChance'] },
        { name: 'Breastplate', slot: 'Armor', icon: `${ICON_BASE}/breastplate.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'str'] },
        
        { name: 'Shadow Tunic', slot: 'Armor', icon: `${ICON_BASE}/leather-armor.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'defense'] },
        { name: 'Leather Vest', slot: 'Armor', icon: `${ICON_BASE}/sleeveless-jacket.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Studded Leather', slot: 'Armor', icon: `${ICON_BASE}/leather-armor.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'maxHp'] },
        
        { name: 'Mage Robe', slot: 'Armor', icon: `${ICON_BASE}/robe.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Arcane Vestment', slot: 'Armor', icon: `${ICON_BASE}/robe.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'defense'] },
        { name: 'Silk Robes', slot: 'Armor', icon: `${ICON_BASE}/shirt.svg${COLOR_PARAM}`, possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Boots: [
        { name: 'Greaves', slot: 'Boots', icon: `${ICON_BASE}/leg-armor.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'maxHp'] },
        { name: 'Iron Sabatons', slot: 'Boots', icon: `${ICON_BASE}/metal-boot.svg${COLOR_PARAM}`, possibleStats: ['defense', 'maxHp'] },
        { name: 'Plated Boots', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['defense', 'str', 'blockChance'] },
        
        { name: 'Leather Boots', slot: 'Boots', icon: `${ICON_BASE}/leather-boot.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'defense'] },
        { name: 'Light Shoes', slot: 'Boots', icon: `${ICON_BASE}/leather-boot.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'maxHp'] },
        { name: 'Sandals', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion'] },
        
        { name: 'Silk Slippers', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'evasion'] },
        { name: 'Arcane Boots', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'maxHp'] },
        { name: 'Soft Boots', slot: 'Boots', icon: `${ICON_BASE}/boots.svg${COLOR_PARAM}`, possibleStats: ['int', 'evasion', 'maxHp'] },
    ],
    Gloves: [
        { name: 'Gauntlets', slot: 'Gloves', icon: `${ICON_BASE}/gauntlet.svg${COLOR_PARAM}`, possibleStats: ['str', 'defense', 'blockChance'] },
        { name: 'Steel Mitts', slot: 'Gloves', icon: `${ICON_BASE}/mailed-fist.svg${COLOR_PARAM}`, possibleStats: ['str', 'maxHp', 'defense'] },
        { name: 'Iron Gauntlets', slot: 'Gloves', icon: `${ICON_BASE}/mailed-fist.svg${COLOR_PARAM}`, possibleStats: ['str', 'defense', 'blockChance'] },
        
        { name: 'Leather Gloves', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion', 'defense'] },
        { name: 'Thief Gloves', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['dex', 'defense', 'evasion'] },
        { name: 'Fingerless Gloves', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['dex', 'evasion'] },
        
        { name: 'Cloth Wraps', slot: 'Gloves', icon: `${ICON_BASE}/hand-bandage.svg${COLOR_PARAM}`, possibleStats: ['int', 'defense', 'evasion'] },
        { name: 'Spellbinders', slot: 'Gloves', icon: `${ICON_BASE}/gloves.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'defense'] },
        { name: 'Mystic Wraps', slot: 'Gloves', icon: `${ICON_BASE}/hand-bandage.svg${COLOR_PARAM}`, possibleStats: ['int', 'maxHp', 'evasion'] },
    ],
    // JEWELRY - Focus: Defensive Stats (Def, HP, Evasion, Block) + Main Stat
    Necklace: [
        { name: 'Amulet', slot: 'Necklace', icon: `${ICON_BASE}/necklace.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'defense', 'int'] },
        { name: 'Pendant', slot: 'Necklace', icon: `${ICON_BASE}/gem-necklace.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'str', 'dex'] },
        { name: 'Choker', slot: 'Necklace', icon: `${ICON_BASE}/pearl-necklace.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'defense', 'int'] },
        { name: 'Chain', slot: 'Necklace', icon: `${ICON_BASE}/necklace.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'str'] },
    ],
    Ring: [
        { name: 'Iron Band', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['defense', 'str', 'blockChance'] },
        { name: 'Gold Ring', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'int', 'maxHp'] },
        { name: 'Signet Ring', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'dex', 'str'] },
        { name: 'Ruby Ring', slot: 'Ring', icon: `${ICON_BASE}/ring.svg${COLOR_PARAM}`, possibleStats: ['defense', 'blockChance', 'maxHp'] },
    ],
    Earring: [
        { name: 'Stud', slot: 'Earring', icon: `${ICON_BASE}/earrings.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'dex', 'maxHp'] },
        { name: 'Hoop', slot: 'Earring', icon: `${ICON_BASE}/earrings.svg${COLOR_PARAM}`, possibleStats: ['defense', 'int', 'maxHp'] },
        { name: 'Charm', slot: 'Earring', icon: `${ICON_BASE}/earrings.svg${COLOR_PARAM}`, possibleStats: ['evasion', 'defense', 'int'] },
    ],
    Belt: [
        { name: 'Leather Belt', slot: 'Belt', icon: `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'defense', 'dex'] },
        { name: 'Sash', slot: 'Belt', icon: `${ICON_BASE}/belt-buckles.svg${COLOR_PARAM}`, possibleStats: ['maxHp', 'evasion', 'defense'] },
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

// Fixed missing properties maxEnergy and maxMana to satisfy Record<keyof Stats, number>
export const STAT_WEIGHTS: Record<keyof Stats, number> = {
    str: 1,
    dex: 1,
    int: 1,
    defense: 1,
    maxHp: 5,
    maxEnergy: 1,
    maxMana: 1,
    critRate: 0.5,
    evasion: 0.4,
    blockChance: 0.5,
    lifesteal: 0.4,
    attackSpeed: 1,
    castSpeed: 1,
};