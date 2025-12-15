
import type { Equipment, GearSlot, Stats, Rarity } from '../types';
import { GEAR_SLOTS } from '../constants';
import { ITEM_TEMPLATES, ITEM_PREFIXES, STAT_WEIGHTS } from '../data/items';

const SHARD_DROP_CHANCE = 0.8;
const POTION_DROP_CHANCE = 0.15;

const RARITY_MULTIPLIERS: Record<Rarity, number> = {
    Common: 1.0,
    Uncommon: 1.3,
    Rare: 1.6,
    Epic: 2.1,
    Legendary: 3.0,
};

// A function to get a random item from an array
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateSingleItem(floor: number): Equipment {
    const slot = getRandom(GEAR_SLOTS);
    const template = getRandom(ITEM_TEMPLATES[slot]);
    
    // --- Dynamic Rarity Calculation ---
    const roll = (Math.random() * 100) + (floor * 0.5);
    
    let rarity: Rarity;
    let targetStatCount = 1;

    if (roll < 60) {
        rarity = 'Common';
        targetStatCount = 1;
    } else if (roll < 85) {
        rarity = 'Uncommon';
        targetStatCount = Math.random() < 0.3 ? 2 : 1;
    } else if (roll < 95) {
        rarity = 'Rare';
        targetStatCount = 2;
    } else if (roll < 99) {
        rarity = 'Epic';
        targetStatCount = Math.random() < 0.5 ? 3 : 2;
    } else {
        rarity = 'Legendary';
        targetStatCount = 3;
    }

    const prefixes = ITEM_PREFIXES[rarity];
    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;
    
    // --- NEW STAT SCALING LOGIC ---
    // Item Level is determined by the Floor
    const itemLevel = floor;
    
    // 1. Calculate Base Budget based on Item Level (Linear scaling)
    const baseBudget = 3 + itemLevel; 
    
    // 2. Apply Rarity Multiplier to the budget
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
    const statPointsBudget = Math.floor(baseBudget * rarityMultiplier);
    
    // Select stats to populate
    const possibleStats = [...template.possibleStats];
    const numToPick = Math.min(targetStatCount, possibleStats.length, statPointsBudget);
    
    const chosenStats: (keyof Stats)[] = [];
    const availableToPick = [...possibleStats];
    for (let k = 0; k < numToPick; k++) {
        const idx = Math.floor(Math.random() * availableToPick.length);
        chosenStats.push(availableToPick[idx]);
        availableToPick.splice(idx, 1);
    }
    if (chosenStats.length === 0) chosenStats.push(getRandom(possibleStats));

    const newStats: Partial<Stats> = {};

    // 1. Initial Investment: Give 1 point to each chosen stat to ensure they exist
    chosenStats.forEach(stat => {
        newStats[stat] = STAT_WEIGHTS[stat];
    });
    
    // Decrease remaining budget by the number of stats we just populated
    let remainingBudget = Math.max(0, statPointsBudget - chosenStats.length);

    // 2. Distribute remaining budget randomly among chosen stats
    for(let i = 0; i < remainingBudget; i++) {
        const randomStat = getRandom(chosenStats);
        const currentVal = newStats[randomStat] || 0;
        newStats[randomStat] = currentVal + STAT_WEIGHTS[randomStat];
    }

    // 3. Round & Integrity Check
    Object.keys(newStats).forEach(key => {
        const statKey = key as keyof Stats;
        newStats[statKey] = Math.max(1, Math.round(newStats[statKey]!));
    });

    // --- Calculate Cost (Value) ---
    const itemPower = statPointsBudget * 5; 
    let costMultiplier = 1;
    if (rarity === 'Uncommon') costMultiplier = 1.2;
    if (rarity === 'Rare') costMultiplier = 1.5;
    if (rarity === 'Epic') costMultiplier = 2.0;
    if (rarity === 'Legendary') costMultiplier = 3.0;

    const cost = Math.floor(itemPower * 5 * costMultiplier);

    return {
        ...template,
        name,
        stats: newStats,
        rarity,
        itemLevel,
        cost: Math.round(cost / 10) * 10,
    };
}

export function generateLoot(floor: number, playerLevel: number): {
  shards: number;
  potions: number;
  equipment: Equipment[];
} {
  let shards = 0;
  let potions = 0;
  let equipment: Equipment[] = [];

  // Roll for shards
  if (Math.random() < SHARD_DROP_CHANCE) {
    shards = Math.floor(Math.random() * 10 * (1 + floor / 5)) + 5;
  }

  // Roll for potions
  if (Math.random() < POTION_DROP_CHANCE) {
    potions = 1;
  }

  // --- Boss Drop Logic (Floor % 10 === 0) ---
  if (floor % 10 === 0) {
      // Bosses drop 1-3 items guaranteed
      const dropCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      for (let i = 0; i < dropCount; i++) {
          equipment.push(generateSingleItem(floor));
      }
  } else {
      // --- Standard Drop Logic ---
      const baseDropChance = 0.25;
      const decayPerLevel = 0.005;
      const minDropChance = 0.05;
      
      const equipmentDropChance = Math.max(minDropChance, baseDropChance - (playerLevel * decayPerLevel));
      
      // Roll for equipment
      if (Math.random() < equipmentDropChance) {
        equipment.push(generateSingleItem(floor));
      }
  }

  return { shards, potions, equipment };
}
