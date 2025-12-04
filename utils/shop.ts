
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

    if (roll < 50) {
        rarity = 'Common';
        statBudgetMultiplier = 1;
    } else if (roll < 80) {
        rarity = 'Uncommon';
        statBudgetMultiplier = 1.3;
    } else if (roll < 95) {
        rarity = 'Rare';
        statBudgetMultiplier = 2.0;
    } else if (roll < 99) {
        rarity = 'Epic';
        statBudgetMultiplier = 3.0;
    } else {
        rarity = 'Legendary';
        statBudgetMultiplier = 4.5;
    }

    const prefixes = ITEM_PREFIXES[rarity];
    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;

    const baseBudget = 1 + Math.floor(playerLevel / 3);
    const statBudget = Math.max(1, Math.floor(baseBudget * statBudgetMultiplier));
    
    const newStats: Partial<Stats> = {};
    const possibleStats = [...template.possibleStats];

    for(let i = 0; i < statBudget; i++) {
        const randomStat = getRandom(possibleStats);
        const currentStatValue = newStats[randomStat] ?? 0;
        const increase = STAT_WEIGHTS[randomStat];
        newStats[randomStat] = currentStatValue + increase;
    }

    Object.keys(newStats).forEach(key => {
        const statKey = key as keyof Stats;
        newStats[statKey] = Math.round(newStats[statKey]!);
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
