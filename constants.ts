
import type { PlayerClass, EquipmentSlot, GearSlot, Skill } from './types';

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

export const CLASSES: PlayerClass[] = [
  {
    name: 'Warrior',
    description: 'A fortress of steel. Relies on blocking and armor to outlast opponents.',
    baseStats: { 
        str: 10, dex: 3, int: 2, maxHp: 110, maxEnergy: 100, maxMana: 0, 
        defense: 8, critRate: 5, evasion: 2, blockChance: 15, lifesteal: 0, 
        attackSpeed: 0, castSpeed: 0 
    },
    allowedWeaponTypes: ['Sword', 'Hammer', 'Shield'],
    icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`,
  },
  {
    name: 'Rogue',
    description: 'A lethal shadow. Avoids damage and strikes critical blows.',
    baseStats: { 
        str: 4, dex: 10, int: 4, maxHp: 85, maxEnergy: 100, maxMana: 0, 
        defense: 4, critRate: 15, evasion: 12, blockChance: 0, lifesteal: 3, 
        attackSpeed: 5, castSpeed: 0 
    },
    allowedWeaponTypes: ['Dagger', 'Bow'],
    icon: `${ICON_BASE}/cowled.svg${COLOR_PARAM}`,
  },
  {
    name: 'Mage',
    description: 'A master of arcane arts. Sustains life by draining it from enemies.',
    baseStats: { 
        str: 2, dex: 3, int: 10, maxHp: 90, maxEnergy: 0, maxMana: 200, 
        defense: 3, critRate: 5, evasion: 5, blockChance: 0, lifesteal: 12, 
        attackSpeed: 0, castSpeed: 5 
    },
    allowedWeaponTypes: ['Mace', 'Staff', 'Tome', 'Shield'],
    icon: `${ICON_BASE}/wizard-face.svg${COLOR_PARAM}`,
  },
];

export const SKILL_TREES: Record<string, Skill[]> = {
    Warrior: [
        { id: 'w_p1', name: 'Iron Skin', description: '+5 Defense per level', type: 'passive', tier: 1, maxLevel: 5, cost: 0, pointsRequired: 1, stats: { defense: 5 }, icon: 'armor-upgrade' },
        { id: 'w_a1', name: 'Shield Bash', description: 'Stun & deal massive STR dmg. Power increases with level. (Cost: 20 Energy)', type: 'active', tier: 1, maxLevel: 5, cost: 20, cooldown: 6, pointsRequired: 1, icon: 'shield-bash' },
        
        { id: 'w_p2', name: 'Juggernaut', description: '+25 Max HP per level', type: 'passive', tier: 2, maxLevel: 3, cost: 0, pointsRequired: 1, stats: { maxHp: 25 }, icon: 'muscle-up' },
        { id: 'w_a2', name: 'Cleave', description: 'Strike for heavy scaling dmg. Power increases with level. (Cost: 35 Energy)', type: 'active', tier: 2, maxLevel: 3, cost: 35, cooldown: 10, pointsRequired: 1, icon: 'battle-axe' },
        
        { id: 'w_p3', name: 'Vanguard', description: '+10% Block Chance', type: 'passive', tier: 3, maxLevel: 1, cost: 0, pointsRequired: 1, stats: { blockChance: 10 }, icon: 'shield-reflect' },
        { id: 'w_a3', name: 'Execute', description: 'Ultimate finishing move for 6x damage. (Cost: 60 Energy)', type: 'active', tier: 3, maxLevel: 1, cost: 60, cooldown: 20, pointsRequired: 1, icon: 'executioner-hood' },
    ],
    Rogue: [
        { id: 'r_p1', name: 'Fleet Foot', description: '+4% Evasion per level', type: 'passive', tier: 1, maxLevel: 5, cost: 0, pointsRequired: 1, stats: { evasion: 4 }, icon: 'running-shoe' },
        { id: 'r_a1', name: 'Twin Strike', description: 'Double strike. Power increases with level. (Cost: 15 Energy)', type: 'active', tier: 1, maxLevel: 5, cost: 15, cooldown: 5, pointsRequired: 1, icon: 'winged-sword' },
        
        { id: 'r_p2', name: 'Lethality', description: '+5% Crit Rate per level', type: 'passive', tier: 2, maxLevel: 3, cost: 0, pointsRequired: 1, stats: { critRate: 5 }, icon: 'crosshair' },
        { id: 'r_a2', name: 'Poison Shiv', description: 'Poisonous strike. Power increases with level. (Cost: 30 Energy)', type: 'active', tier: 2, maxLevel: 3, cost: 30, cooldown: 12, pointsRequired: 1, icon: 'poison-bottle' },
        
        { id: 'r_p3', name: 'Shadow Step', description: '+15% Attack Speed', type: 'passive', tier: 3, maxLevel: 1, cost: 0, pointsRequired: 1, stats: { attackSpeed: 15 }, icon: 'ninja-mask' },
        { id: 'r_a3', name: 'Assassinate', description: 'Deadly 7x Crit strike. (Cost: 55 Energy)', type: 'active', tier: 3, maxLevel: 1, cost: 55, cooldown: 25, pointsRequired: 1, icon: 'backstab' },
    ],
    Mage: [
        { id: 'm_p1', name: 'Arcane Flow', description: '+30 Max Mana per level', type: 'passive', tier: 1, maxLevel: 5, cost: 0, pointsRequired: 1, stats: { maxMana: 30 }, icon: 'energy-breath' },
        { id: 'm_a1', name: 'Fireball', description: 'Blazing INT damage. Power increases with level. (Cost: 25 Mana)', type: 'active', tier: 1, maxLevel: 5, cost: 25, cooldown: 7, pointsRequired: 1, icon: 'fireball' },
        
        { id: 'm_p2', name: 'Soul Siphon', description: '+5% Lifesteal per level', type: 'passive', tier: 2, maxLevel: 3, cost: 0, pointsRequired: 1, stats: { lifesteal: 5 }, icon: 'vampire-dracula' },
        { id: 'm_a2', name: 'Frostbolt', description: 'Freezing INT damage. Power increases with level. (Cost: 40 Mana)', type: 'active', tier: 2, maxLevel: 3, cost: 40, cooldown: 15, pointsRequired: 1, icon: 'ice-bolt' },
        
        { id: 'm_p3', name: 'Meditation', description: '+20% Cast Speed', type: 'passive', tier: 3, maxLevel: 1, cost: 0, pointsRequired: 1, stats: { castSpeed: 20 }, icon: 'brain' },
        { id: 'm_a3', name: 'Meteor', description: 'Ultimate destructive INT damage. (Cost: 90 Mana)', type: 'active', tier: 3, maxLevel: 1, cost: 90, cooldown: 30, pointsRequired: 1, icon: 'meteor-impact' },
    ]
};

export const GEAR_SLOTS: GearSlot[] = [
  'MainHand',
  'OffHand',
  'Helmet',
  'Armor',
  'Gloves',
  'Boots',
  'Necklace',
  'Earring',
  'Ring',
  'Belt',
];


export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'MainHand',
  'OffHand',
  'Helmet',
  'Armor',
  'Gloves',
  'Boots',
  'Necklace',
  'Earring',
  'Ring',
  'Belt',
  'Potions',
];
