
import type { Equipment, Player, GearSlot, Stats, Rarity } from '../types';
import { GEAR_SLOTS } from '../constants';
import { ITEM_TEMPLATES, ITEM_PREFIXES, STAT_WEIGHTS } from '../data/items';

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateShopItem(playerLevel: number, slot: GearSlot): Equipment {
    const template = getRandom(ITEM_TEMPLATES[slot]);
    
    // Determine item rarity based on player level + random chance
    const roll = Math.random() * 100 + (playerLevel * 0.5);
    
    let rarity: Rarity;
    let statBudgetMultiplier: number;
    let targetStatCount = 1;

    if (roll < 50) {
        rarity = 'Common';
        statBudgetMultiplier = 1;
        targetStatCount = 1;
    } else if (roll < 80) {
        rarity = 'Uncommon';
        statBudgetMultiplier = 1.3;
        targetStatCount = Math.random() < 0.3 ? 2 : 1;
    } else if (roll < 95) {
        rarity = 'Rare';
        statBudgetMultiplier = 2.0;
        targetStatCount = 2;
    } else if (roll < 99) {
        rarity = 'Epic';
        statBudgetMultiplier = 3.0;
        targetStatCount = Math.random() < 0.5 ? 3 : 2;
    } else {
        rarity = 'Legendary';
        statBudgetMultiplier = 4.5;
        targetStatCount = 3;
    }

    const prefixes = ITEM_PREFIXES[rarity];
    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;

    const baseBudget = 1 + Math.floor(playerLevel / 3);
    const statBudget = Math.max(1, Math.floor(baseBudget * statBudgetMultiplier));
    
    const possibleStats = [...template.possibleStats];
    const numToPick = Math.min(targetStatCount, possibleStats.length, statBudget);

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
    let remainingBudget = statBudget - chosenStats.length;
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
    const itemPower = Object.entries(newStats).reduce((sum, [stat, value]) => {
        const weight = STAT_WEIGHTS[stat as keyof Stats] || 1;
        return sum + (value / weight) * (5 + playerLevel);
    }, 0);

    // Rarity multiplier for cost
    let costMultiplier = 1;
    if (rarity === 'Uncommon') costMultiplier = 1.5;
    if (rarity === 'Rare') costMultiplier = 3;
    if (rarity === 'Epic') costMultiplier = 6;
    if (rarity === 'Legendary') costMultiplier = 10;

    const cost = Math.floor(itemPower * 5 * costMultiplier);

    const finalItem: Equipment = {
        ...template,
        name,
        stats: newStats,
        rarity,
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
