import type { Equipment, GearSlot, Stats } from '../types';
import { GEAR_SLOTS } from '../constants';
import { ITEM_TEMPLATES, ITEM_PREFIXES, STAT_WEIGHTS } from '../data/items';

const SHARD_DROP_CHANCE = 0.8;
const POTION_DROP_CHANCE = 0.15;
const EQUIPMENT_DROP_CHANCE = 0.1; // Reduced, but we'll roll for it separately

// A function to get a random item from an array
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateLoot(floor: number): {
  shards: number;
  potions: number;
  equipment: Equipment | null;
} {
  let shards = 0;
  let potions = 0;
  let equipment: Equipment | null = null;

  // Roll for shards
  if (Math.random() < SHARD_DROP_CHANCE) {
    shards = Math.floor(Math.random() * 10 * (1 + floor / 5)) + 5;
  }

  // Roll for potions
  if (Math.random() < POTION_DROP_CHANCE) {
    potions = 1;
  }

  // Roll for equipment
  if (Math.random() < EQUIPMENT_DROP_CHANCE) {
    // Generate a piece of equipment
    const slot = getRandom(GEAR_SLOTS);
    const template = getRandom(ITEM_TEMPLATES[slot]);
    
    // Determine item quality and prefix
    const qualityRoll = Math.random();
    let prefixes: string[];
    let statBudget: number;

    if (qualityRoll < 0.6) { // Common
        prefixes = ITEM_PREFIXES.common;
        statBudget = 1 + Math.floor(floor / 5);
    } else if (qualityRoll < 0.9) { // Uncommon
        prefixes = ITEM_PREFIXES.uncommon;
        statBudget = 2 + Math.floor(floor / 4);
    } else if (qualityRoll < 0.98) { // Rare
        prefixes = ITEM_PREFIXES.rare;
        statBudget = 3 + Math.floor(floor / 3);
    } else { // Epic
        prefixes = ITEM_PREFIXES.epic;
        statBudget = 5 + Math.floor(floor / 2);
    }
    
    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;
    
    const newStats: Partial<Stats> = {};
    const possibleStats = [...template.possibleStats];

    // Distribute stat budget
    for(let i = 0; i < statBudget; i++) {
        const randomStat = getRandom(possibleStats);
        const currentStatValue = newStats[randomStat] ?? 0;
        const increase = STAT_WEIGHTS[randomStat];
        newStats[randomStat] = currentStatValue + increase;
    }

    // Ensure stats are integers
    Object.keys(newStats).forEach(key => {
        const statKey = key as keyof Stats;
        newStats[statKey] = Math.round(newStats[statKey]!);
    });

    equipment = {
        ...template,
        name,
        stats: newStats
    };
  }

  return { shards, potions, equipment };
}
