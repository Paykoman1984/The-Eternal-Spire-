import type { PlayerClass, EquipmentSlot } from './types';

export const CLASSES: PlayerClass[] = [
  {
    name: 'Warrior',
    description: 'A master of martial combat, relying on strength and resilience to overcome foes.',
    baseStats: { str: 10, dex: 5, int: 3, maxHp: 100, defense: 10, critRate: 5 },
    icon: '🛡️',
  },
  {
    name: 'Rogue',
    description: 'A nimble shadow, striking from the darkness with deadly precision and cunning.',
    baseStats: { str: 5, dex: 10, int: 5, maxHp: 80, defense: 5, critRate: 10 },
    icon: '🗡️',
  },
  {
    name: 'Mage',
    description: 'A wielder of arcane energies, shaping reality with powerful spells and incantations.',
    baseStats: { str: 3, dex: 5, int: 10, maxHp: 70, defense: 3, critRate: 7 },
    icon: '🔮',
  },
];

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'Weapon',
  'Helmet',
  'Armor',
  'Boots',
  'Gloves',
  'Potions',
];