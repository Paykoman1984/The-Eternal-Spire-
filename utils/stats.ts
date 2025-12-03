import type { Player, Stats } from '../types';
import { GEAR_SLOTS } from '../constants';

/**
 * Calculates percentage-based stat buffs based on account level.
 */
export function calculateAccountBuffs(level: number): Partial<Record<keyof Stats, number>> {
    const buffs: Partial<Record<keyof Stats, number>> = {};
    
    // Buff at level 5
    if (level >= 5) {
        buffs.str = 5;
        buffs.dex = 5;
        buffs.int = 5;
    }

    // Buff at level 8
    if (level >= 8) {
        buffs.maxHp = 5;
        buffs.defense = 5;
    }

    return buffs;
}

/**
 * Recalculates all player stats from base, equipment, and buffs.
 * This is the single source of truth for player stats.
 */
export function recalculatePlayerStats(player: Player): Player {
    const updatedPlayer = { ...player };

    // 1. Start with base stats
    const newStats: Stats = { ...updatedPlayer.baseStats };

    // 2. Add stats from equipment
    for (const slot of GEAR_SLOTS) {
        const item = updatedPlayer.equipment[slot];
        if (item) {
            for (const [stat, value] of Object.entries(item.stats)) {
                const key = stat as keyof Stats;
                newStats[key] = (newStats[key] || 0) + value;
            }
        }
    }

    // Add dexterity bonus to evasion (Reduced scaling: previously / 4)
    newStats.evasion += Math.floor(newStats.dex / 8);
    
    // 3. Calculate and apply percentage-based account buffs
    const accountBuffs = calculateAccountBuffs(updatedPlayer.level);
    updatedPlayer.accountBuffs = accountBuffs;

    for (const [stat, percentage] of Object.entries(accountBuffs)) {
        const key = stat as keyof Stats;
        const baseValue = newStats[key];
        if (baseValue && percentage) {
            const bonus = Math.floor(baseValue * (percentage / 100));
            newStats[key] += bonus;
        }
    }

    // CAP EVASION AT 35%
    newStats.evasion = Math.min(newStats.evasion, 35);

    // Assign the final calculated stats
    updatedPlayer.currentStats = newStats;
    
    // Ensure current HP is not higher than new max HP
    updatedPlayer.currentHp = Math.min(updatedPlayer.currentHp, updatedPlayer.currentStats.maxHp);
    if (updatedPlayer.currentHp <= 0 && updatedPlayer.currentStats.maxHp > 0) updatedPlayer.currentHp = 1;


    return updatedPlayer;
}