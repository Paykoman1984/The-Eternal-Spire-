
import type { PlayerClass, EquipmentSlot, GearSlot } from './types';

const ICON_BASE = "https://api.iconify.design/game-icons";
const COLOR_PARAM = "?color=%23e2e8f0";

export const CLASSES: PlayerClass[] = [
  {
    name: 'Warrior',
    description: 'A fortress of steel. Relies on blocking and armor to outlast opponents.',
    baseStats: { str: 10, dex: 3, int: 2, maxHp: 110, defense: 8, critRate: 5, evasion: 2, blockChance: 15, lifesteal: 0 },
    allowedWeaponTypes: ['Sword', 'Hammer', 'Shield'],
    icon: `${ICON_BASE}/visored-helm.svg${COLOR_PARAM}`,
  },
  {
    name: 'Rogue',
    description: 'A lethal shadow. Avoids damage and strikes critical blows.',
    baseStats: { str: 4, dex: 10, int: 4, maxHp: 85, defense: 4, critRate: 15, evasion: 12, blockChance: 0, lifesteal: 3 },
    allowedWeaponTypes: ['Dagger', 'Bow'], // Rogues can dual wield daggers (OffHand dagger uses Dagger type)
    icon: `${ICON_BASE}/cowled.svg${COLOR_PARAM}`,
  },
  {
    name: 'Mage',
    description: 'A master of arcane arts. Sustains life by draining it from enemies.',
    baseStats: { str: 2, dex: 3, int: 10, maxHp: 90, defense: 3, critRate: 5, evasion: 5, blockChance: 0, lifesteal: 12 },
    allowedWeaponTypes: ['Mace', 'Staff', 'Tome'],
    icon: `${ICON_BASE}/wizard-face.svg${COLOR_PARAM}`,
  },
];

export const GEAR_SLOTS: GearSlot[] = [
  'MainHand',
  'OffHand',
  'Helmet',
  'Armor',
  'Boots',
  'Gloves',
];


export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'MainHand',
  'OffHand',
  'Helmet',
  'Armor',
  'Boots',
  'Gloves',
  'Potions',
];
