
import { BASE_ENEMIES } from '../data/enemies';
import type { Enemy } from '../types';

const ENEMY_POOL = Object.values(BASE_ENEMIES).filter(e => e.id !== 'GOBLIN_CHAMPION');

export function generateEnemy(floor: number, playerLevel: number): Enemy {
  let baseEnemyData;
  let enemyLevel = floor;
  let isBoss = false;

  if (floor % 10 === 0) {
    // Boss Logic - Bosses stay strictly consistent with the milestone floor
    baseEnemyData = BASE_ENEMIES.GOBLIN_CHAMPION;
    enemyLevel = floor; 
    isBoss = true;
  } else {
    // 1. Calculate Randomized Level (Floor - 2 to Floor + 2, min 1)
    const variance = Math.floor(Math.random() * 5) - 2; 
    enemyLevel = Math.max(1, floor + variance);

    // 2. Select Enemy Type
    const eligibleEnemies = ENEMY_POOL.filter(enemy => floor >= enemy.minFloor);
    
    if (eligibleEnemies.length === 0) {
        baseEnemyData = BASE_ENEMIES.SLIME;
    } else {
        baseEnemyData = eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
    }
  }

  // Elite Logic
  // If player is over-leveled (Floor * 1.2 < Player Level), increase chance to 30% for farming.
  let isElite = false;
  if (!isBoss) {
      const eliteChance = playerLevel > floor * 1.2 ? 0.30 : 0.15;
      isElite = Math.random() < eliteChance;
  }

  const enemy: Enemy = JSON.parse(JSON.stringify({
      ...baseEnemyData,
      level: enemyLevel,
      isElite: isElite,
      name: isElite ? `Elite ${baseEnemyData.name}` : baseEnemyData.name,
      stats: {
          ...baseEnemyData.stats,
          hp: baseEnemyData.stats.maxHp // Initialize hp with base maxHp
      }
  }));

  // --- SCALING LOGIC ---
  
  // 1. Checkpoint Scaling (Geometric)
  // Every 10 floors, enemies get a compounding multiplier.
  // This ensures that deep runs scale hard to match equipment rarities.
  const checkpoint = Math.floor((enemyLevel - 1) / 10);
  const checkpointMultiplier = Math.pow(1.20, checkpoint); // 20% compound boost every 10 floors

  // 2. Linear Scaling (Per Level)
  // Standard linear growth for every level.
  // Reduced from 0.20 to 0.15 to prevent HP bloat at higher levels while preserving difficulty curve
  const linearMultiplier = 1 + ((enemyLevel - 1) * 0.15); 

  // 3. Adaptive Player Scaling
  // If player is higher level than the floor, buffer the enemy slightly.
  // This prevents trivializing content purely by XP grinding, ensuring gear remains key.
  const levelDiff = Math.max(0, playerLevel - enemyLevel);
  const adaptiveMultiplier = 1 + (levelDiff * 0.04); // 4% boost per level difference

  // Combined Main Scale (For Attack and HP)
  const mainScaleFactor = linearMultiplier * checkpointMultiplier * adaptiveMultiplier;

  // Defense Scale
  // Defense scales slower to prevent "0 damage" scenarios against bad RNG drops
  const defenseScaleFactor = (1 + ((enemyLevel - 1) * 0.12)) * Math.pow(1.05, checkpoint);

  // Apply Scaling
  // HP gets a small buffer (10%) instead of previous 25% to reduce sponginess
  enemy.stats.maxHp = Math.floor(enemy.stats.maxHp * mainScaleFactor * 1.10);
  enemy.stats.attack = Math.floor(enemy.stats.attack * mainScaleFactor);
  enemy.stats.defense = Math.floor(enemy.stats.defense * defenseScaleFactor);
  
  // Evasion scales very slowly, capped at 40%
  const evasionBoost = Math.floor(enemyLevel * 0.2);
  enemy.stats.evasion = Math.min(40, enemy.stats.evasion + evasionBoost);
  
  // XP Reward scales with difficulty
  enemy.xpReward = Math.floor((enemy.xpReward || 10) * mainScaleFactor);

  // Boss Specific Boosts (Multiplicative on top of scaled stats)
  if (isBoss) {
      // Adjusted Boss Scaling:
      // HP: 0.75x (Maintained)
      // Attack: 0.6x (Reduced from 0.8x)
      // Defense: 0.6x (Reduced from 0.8x)
      enemy.stats.maxHp = Math.floor(enemy.stats.maxHp * 0.75); 
      enemy.stats.attack = Math.floor(enemy.stats.attack * 0.6);
      enemy.stats.defense = Math.floor(enemy.stats.defense * 0.6);
      enemy.xpReward = Math.floor(enemy.xpReward * 4.0);
  }

  // Elite Specific Boosts
  if (isElite) {
      enemy.stats.maxHp = Math.floor(enemy.stats.maxHp * 1.5);
      enemy.stats.attack = Math.floor(enemy.stats.attack * 1.2);
      enemy.stats.defense = Math.floor(enemy.stats.defense * 1.2);
      enemy.xpReward = Math.floor(enemy.xpReward * 2.5);
  }

  // Final HP Set
  enemy.stats.hp = enemy.stats.maxHp;

  return enemy;
}
