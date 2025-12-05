

import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
    // --- BUFFS ---
    {
        id: 'buff_level_5',
        title: 'Adept Adventurer',
        description: 'Reach Account Level 5 to unlock a permanent +5% bonus to STR, DEX, and INT.',
        type: 'account_level',
        goal: 5,
        rewards: {},
        isBuff: true,
    },
    {
        id: 'buff_level_8',
        title: 'Seasoned Survivor',
        description: 'Reach Account Level 8 to unlock a permanent +5% bonus to Max HP and Defense.',
        type: 'account_level',
        goal: 8,
        rewards: {},
        isBuff: true,
    },

    // --- QUESTS ---
    {
        id: 'quest_slay_10_goblins',
        title: 'Goblin Slayer',
        description: 'Defeat 10 Goblins in the Spire.',
        type: 'slay',
        targetId: 'GOBLIN',
        goal: 10,
        rewards: { shards: 100 },
    },
    {
        id: 'quest_slay_25_slimes',
        title: 'Slime Rancher',
        description: 'Defeat 25 Slimes in the Spire.',
        type: 'slay',
        targetId: 'SLIME',
        goal: 25,
        rewards: { shards: 150, potions: 1 },
    },
    {
        id: 'quest_slay_20_skeletons',
        title: 'Bone Breaker',
        description: 'Defeat 20 Skeletons in the Spire.',
        type: 'slay',
        targetId: 'SKELETON',
        goal: 20,
        rewards: { shards: 200 },
    },
    {
        id: 'quest_slay_15_orcs',
        title: 'Orc Bane',
        description: 'Defeat 15 Orcs in the Spire.',
        type: 'slay',
        targetId: 'ORC',
        goal: 15,
        rewards: { shards: 300 },
    },
    {
        id: 'quest_reach_floor_10',
        title: 'First Steps',
        description: 'Reach Floor 10 in the Spire.',
        type: 'reach_floor',
        goal: 10,
        rewards: { potions: 2 },
    },
    {
        id: 'quest_reach_floor_25',
        title: 'Deeper and Deeper',
        description: 'Reach Floor 25 in the Spire.',
        type: 'reach_floor',
        goal: 25,
        rewards: { shards: 250, potions: 1 },
    },
];
