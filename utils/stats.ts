
import type { Player, Stats } from '../types';
import { GEAR_SLOTS, SKILL_TREES } from '../constants';

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
 * Recalculates all player stats from base, equipment, buffs, and skills.
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
                if (stat === 'itemLevel') continue;
                const key = stat as keyof Stats;
                newStats[key] = (newStats[key] || 0) + (value as number);
            }
        }
    }

    // 3. Add stats from Passive Skills
    const classSkills = SKILL_TREES[updatedPlayer.classInfo.name] || [];
    Object.entries(updatedPlayer.skills).forEach(([skillId, level]) => {
        const skill = classSkills.find(s => s.id === skillId);
        if (skill && skill.type === 'passive' && skill.stats && level > 0) {
            for (const [stat, value] of Object.entries(skill.stats)) {
                const key = stat as keyof Stats;
                // Stat bonus scales with level (e.g. +5 Defense * Level 2 = +10 Defense)
                newStats[key] = (newStats[key] || 0) + ((value as number) * level);
            }
        }
    });

    // Dexterity bonus to evasion
    newStats.evasion += Math.floor(newStats.dex / 8);
    
    // 4. Calculate and apply percentage-based account buffs
    const accountBuffs = calculateAccountBuffs(updatedPlayer.level);
    updatedPlayer.accountBuffs = accountBuffs;

    for (const [stat, percentage] of Object.entries(accountBuffs)) {
        const key = stat as keyof Stats;
        const baseValue = newStats[key];
        if (baseValue !== undefined && percentage) {
            const bonus = Math.floor(baseValue * (percentage / 100));
            newStats[key] += bonus;
        }
    }

    // CAP EVASION AT 35%
    newStats.evasion = Math.min(newStats.evasion, 35);

    // Assign the final calculated stats
    updatedPlayer.currentStats = newStats;
    
    // Sync current resources
    updatedPlayer.currentHp = Math.min(updatedPlayer.currentHp, updatedPlayer.currentStats.maxHp);
    updatedPlayer.currentEnergy = Math.min(updatedPlayer.currentEnergy || 0, updatedPlayer.currentStats.maxEnergy);
    updatedPlayer.currentMana = Math.min(updatedPlayer.currentMana || 0, updatedPlayer.currentStats.maxMana);

    return updatedPlayer;
}
