import type { Equipment, Player, GearSlot, Stats } from '../types';
import { GEAR_SLOTS } from '../constants';
import { ITEM_TEMPLATES, ITEM_PREFIXES, STAT_WEIGHTS } from '../data/items';

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateShopItem(playerLevel: number, slot: GearSlot): Equipment {
    const template = getRandom(ITEM_TEMPLATES[slot]);
    
    // Determine item quality and prefix based on player level
    const qualityRoll = Math.random();
    let prefixes: string[];
    let statBudget: number;

    const baseBudget = 1 + Math.floor(playerLevel / 3);

    // Bias towards sidegrades/downgrades
    if (qualityRoll < 0.7) { // Common/Sidegrade (70% chance)
        prefixes = ITEM_PREFIXES.common;
        statBudget = Math.floor(baseBudget * (0.8 + Math.random() * 0.25)); // 80% - 105% of base
    } else if (qualityRoll < 0.95) { // Uncommon/Upgrade (25% chance)
        prefixes = ITEM_PREFIXES.uncommon;
        statBudget = Math.floor(baseBudget * (1.05 + Math.random() * 0.2)); // 105% - 125% of base
    } else { // Rare/Major Upgrade (5% chance)
        prefixes = ITEM_PREFIXES.rare;
        statBudget = Math.floor(baseBudget * (1.25 + Math.random() * 0.25)); // 125% - 150% of base
    }

    statBudget = Math.max(1, statBudget); // Ensure at least 1 stat point

    const prefix = getRandom(prefixes);
    const name = `${prefix} ${template.name}`;
    
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
        // value / weight normalizes the stat points, then we multiply by power factors
        return sum + (value / weight) * (5 + playerLevel);
    }, 0);

    const cost = Math.floor(itemPower * 5);

    const finalItem: Equipment = {
        ...template,
        name,
        stats: newStats,
        cost: Math.round(cost / 10) * 10, // Round to nearest 10
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
