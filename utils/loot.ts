
import type { Equipment, GearSlot, Stats, Rarity } from '../types';
import { GEAR_SLOTS } from '../constants';
import { ITEM_TEMPLATES, ITEM_PREFIXES, STAT_WEIGHTS } from '../data/items';

const SHARD_DROP_CHANCE = 0.8;
const POTION_DROP_CHANCE = 0.15;

// A function to get a random item from an array
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateLoot(floor: number, playerLevel: number): {
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

  // --- Dynamic Drop Rate Calculation ---
  // Base chance is 25% at level 1.
  // It decays by 0.5% per player level.
  // Minimum chance is hard-capped at 5%.
  const baseDropChance = 0.25;
  const decayPerLevel = 0.005;
  const minDropChance = 0.05;
  
  let equipmentDropChance = Math.max(minDropChance, baseDropChance - (playerLevel * decayPerLevel));
  
  // Slight boost to drop rate for Boss floors
  if (floor % 10 === 0) equipmentDropChance += 0.2;


  // Roll for equipment
  if (Math.random() < equipmentDropChance) {
    // Generate a piece of equipment
    const slot = getRandom(GEAR_SLOTS);
    const template = getRandom(ITEM_TEMPLATES[slot]);
    
    // --- Dynamic Rarity Calculation ---
    // Roll a value between 0 and 100
    // Add a bonus based on the floor (deeper floors = better rolls)
    const roll = (Math.random() * 100) + (floor * 0.5);
    
    let rarity: Rarity;
    let statBudgetMultiplier: number;

    if (roll < 60) {
        rarity = 'Common';
        statBudgetMultiplier = 1;
    } else if (roll < 85) {
        rarity = 'Uncommon';
        statBudgetMultiplier = 1.5;
    } else if (roll < 95) {
        rarity = 'Rare';
        statBudgetMultiplier = 2.5;
    } else if (roll < 99) {
        rarity = 'Epic';
        statBudgetMultiplier = 4;
    } else {
        rarity = 'Legendary';
        statBudgetMultiplier = 6;
    }

    const prefixes = ITEM_PREFIXES[rarity];
    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;
    
    // Base stat budget scales slightly with floor + rarity multiplier
    const baseBudget = 1 + Math.floor(floor / 5);
    const statBudget = Math.max(1, Math.floor(baseBudget * statBudgetMultiplier));
    
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
        stats: newStats,
        rarity
    };
  }

  return { shards, potions, equipment };
}
