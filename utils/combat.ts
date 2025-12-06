
import { BASE_ENEMIES } from '../data/enemies';
import type { Enemy } from '../types';

const ENEMY_POOL = Object.values(BASE_ENEMIES).filter(e => e.id !== 'GOBLIN_CHAMPION');

export function generateEnemy(floor: number): Enemy {
  let baseEnemyData;
  let enemyLevel = floor;

  if (floor % 10 === 0) {
    // Boss Logic - Bosses stay strictly consistent with the milestone floor
    baseEnemyData = BASE_ENEMIES.GOBLIN_CHAMPION;
    enemyLevel = floor; 
  } else {
    // 1. Calculate Randomized Level (Floor - 3 to Floor + 3, min 1)
    const variance = Math.floor(Math.random() * 7) - 3; 
    enemyLevel = Math.max(1, floor + variance);

    // 2. Select Enemy Type
    // We still filter by floor to ensure progression (e.g. don't show Orcs on Floor 1 just because it rolled Level 4)
    const eligibleEnemies = ENEMY_POOL.filter(enemy => floor >= enemy.minFloor);
    
    if (eligibleEnemies.length === 0) {
        baseEnemyData = BASE_ENEMIES.SLIME;
    } else {
        baseEnemyData = eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
    }
  }

  const enemy: Enemy = JSON.parse(JSON.stringify({
      ...baseEnemyData,
      level: enemyLevel,
      stats: {
          ...baseEnemyData.stats,
          hp: baseEnemyData.stats.maxHp
      }
  }));

  // Scaling Factor uses the SPECIFIC ENEMY LEVEL, not the floor.
  // This ensures a Level 8 Enemy feels like Level 8, regardless of which floor you found it on.
  const scaleFactor = 1 + (enemyLevel - 1) * 0.1;
  const bossScaleFactor = 1 + (enemyLevel / 10 - 1) * 0.25;

  if (floor % 10 === 0 && floor > 0) {
      enemy.stats.maxHp = Math.floor(enemy.stats.maxHp * bossScaleFactor);
      enemy.stats.attack = Math.floor(enemy.stats.attack * bossScaleFactor);
      enemy.stats.defense = Math.floor(enemy.stats.defense * bossScaleFactor);
      enemy.stats.evasion = Math.floor(enemy.stats.evasion * bossScaleFactor);
      enemy.xpReward = Math.floor(enemy.xpReward * bossScaleFactor);
  } else {
      enemy.stats.maxHp = Math.floor(enemy.stats.maxHp * scaleFactor);
      enemy.stats.attack = Math.floor(enemy.stats.attack * scaleFactor);
      enemy.stats.defense = Math.floor(enemy.stats.defense * scaleFactor);
      enemy.stats.evasion = Math.floor(enemy.stats.evasion * scaleFactor);
      enemy.xpReward = Math.floor(enemy.xpReward * scaleFactor);
  }
  
  // Cap Enemy Evasion at 35% to prevent unhittable scaling
  enemy.stats.evasion = Math.min(enemy.stats.evasion, 35);
  
  enemy.stats.hp = enemy.stats.maxHp;

  return enemy;
}
