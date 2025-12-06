

import type { Equipment, Player, GearSlot, Stats, Rarity } from '../types';
import { GEAR_SLOTS } from '../constants';
import { ITEM_TEMPLATES, ITEM_PREFIXES, STAT_WEIGHTS } from '../data/items';

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const RARITY_MULTIPLIERS: Record<Rarity, number> = {
    Common: 1.0,
    Uncommon: 1.3,
    Rare: 1.6,
    Epic: 2.1,
    Legendary: 3.0,
};

function generateShopItem(playerLevel: number, slot: GearSlot): Equipment {
    const template = getRandom(ITEM_TEMPLATES[slot]);
    
    // Determine item rarity based on player level + random chance
    const roll = Math.random() * 100 + (playerLevel * 0.5);
    
    let rarity: Rarity;
    let targetStatCount = 1;

    if (roll < 50) {
        rarity = 'Common';
        targetStatCount = 1;
    } else if (roll < 80) {
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

    // --- NEW STAT SCALING LOGIC (Same as Loot) ---
    const itemLevel = playerLevel; // Shop items match player level
    
    const baseBudget = 3 + itemLevel;
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
    const statPointsBudget = Math.floor(baseBudget * rarityMultiplier);
    
    const possibleStats = [...template.possibleStats];
    const numToPick = Math.min(targetStatCount, possibleStats.length, statPointsBudget);

    // Select distinct stats
    const chosenStats: (keyof Stats)[] = [];
    const availableToPick = [...possibleStats];
    for (let k = 0; k < numToPick; k++) {
        const idx = Math.floor(Math.random() * availableToPick.length);
        chosenStats.push(availableToPick[idx]);
        availableToPick.splice(idx, 1);
    }
    if (chosenStats.length === 0) chosenStats.push(getRandom(possibleStats));

    const newStats: Partial<Stats> = {};

    // 1. Seed
    chosenStats.forEach(stat => {
        newStats[stat] = STAT_WEIGHTS[stat];
    });

    // 2. Distribute remaining
    let remainingBudget = Math.max(0, statPointsBudget - chosenStats.length);
    for(let i = 0; i < remainingBudget; i++) {
        const randomStat = getRandom(chosenStats);
        newStats[randomStat] = (newStats[randomStat] || 0) + STAT_WEIGHTS[randomStat];
    }

    // 3. Round & Min 1
    Object.keys(newStats).forEach(key => {
        const statKey = key as keyof Stats;
        newStats[statKey] = Math.max(1, Math.round(newStats[statKey]!));
    });

    // Calculate item power for cost
    // We can use the statPointsBudget as a proxy for power
    const itemPower = statPointsBudget * 5; 

    // Rarity multiplier for cost (Visual prestige tax)
    let costMultiplier = 1;
    if (rarity === 'Uncommon') costMultiplier = 1.2;
    if (rarity === 'Rare') costMultiplier = 1.5;
    if (rarity === 'Epic') costMultiplier = 2.0;
    if (rarity === 'Legendary') costMultiplier = 3.0;

    const cost = Math.floor(itemPower * 5 * costMultiplier);

    const finalItem: Equipment = {
        ...template,
        name,
        stats: newStats,
        rarity,
        itemLevel,
        cost: Math.round(cost / 10) * 10,
    };

    return finalItem;
}


export function generateShopInventory(player: Player): Equipment[] {
    const inventory: Equipment[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 items

    const availableSlots = [...GEAR_SLOTS];

    for (let i = 0; i < itemCount; i++) {
        if (availableSlots.length === 0) break;
        
        const slotIndex = Math.floor(Math.random() * availableSlots.length);
        const slot = availableSlots.splice(slotIndex, 1)[0];

        inventory.push(generateShopItem(player.level, slot));
    }

    return inventory;
}