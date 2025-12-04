
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
    const roll = (Math.random() * 100) + (floor * 0.5);
    
    let rarity: Rarity;
    let statBudgetMultiplier: number;
    let targetStatCount = 1;

    if (roll < 60) {
        rarity = 'Common';
        statBudgetMultiplier = 1;
        targetStatCount = 1;
    } else if (roll < 85) {
        rarity = 'Uncommon';
        statBudgetMultiplier = 1.5;
        targetStatCount = Math.random() < 0.3 ? 2 : 1;
    } else if (roll < 95) {
        rarity = 'Rare';
        statBudgetMultiplier = 2.5;
        targetStatCount = 2;
    } else if (roll < 99) {
        rarity = 'Epic';
        statBudgetMultiplier = 4;
        targetStatCount = Math.random() < 0.5 ? 3 : 2;
    } else {
        rarity = 'Legendary';
        statBudgetMultiplier = 6;
        targetStatCount = 3;
    }

    const prefixes = ITEM_PREFIXES[rarity];
    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;
    
    // Calculate Budget
    const baseBudget = 1 + Math.floor(floor / 5);
    const statBudget = Math.max(1, Math.floor(baseBudget * statBudgetMultiplier));
    
    // Ensure we don't try to pick more stats than available or than budget allows (1 point per stat min)
    const possibleStats = [...template.possibleStats];
    const numToPick = Math.min(targetStatCount, possibleStats.length, statBudget);
    
    // Select distinct stats to populate
    const chosenStats: (keyof Stats)[] = [];
    const availableToPick = [...possibleStats];
    for (let k = 0; k < numToPick; k++) {
        const idx = Math.floor(Math.random() * availableToPick.length);
        chosenStats.push(availableToPick[idx]);
        availableToPick.splice(idx, 1);
    }
    
    // Fallback if something went wrong
    if (chosenStats.length === 0) chosenStats.push(getRandom(possibleStats));

    const newStats: Partial<Stats> = {};

    // 1. Assign at least one increment to each chosen stat to ensure it exists
    chosenStats.forEach(stat => {
        newStats[stat] = STAT_WEIGHTS[stat];
    });

    // 2. Distribute remaining budget randomly among chosen stats
    let remainingBudget = statBudget - chosenStats.length;
    for(let i = 0; i < remainingBudget; i++) {
        const randomStat = getRandom(chosenStats);
        const currentVal = newStats[randomStat] || 0;
        newStats[randomStat] = currentVal + STAT_WEIGHTS[randomStat];
    }

    // 3. Ensure integrity: Round and enforce minimum of 1
    Object.keys(newStats).forEach(key => {
        const statKey = key as keyof Stats;
        newStats[statKey] = Math.max(1, Math.round(newStats[statKey]!));
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
