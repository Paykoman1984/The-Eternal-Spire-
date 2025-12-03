import { BASE_ENEMIES } from '../data/enemies';
import type { Enemy } from '../types';

const TIER_1_ENEMIES = [BASE_ENEMIES.SLIME, BASE_ENEMIES.GOBLIN, BASE_ENEMIES.BAT];

export function generateEnemy(floor: number): Enemy {
  let baseEnemyData;

  if (floor % 10 === 0) {
    baseEnemyData = BASE_ENEMIES.GOBLIN_CHAMPION;
  } else {
    baseEnemyData = TIER_1_ENEMIES[Math.floor(Math.random() * TIER_1_ENEMIES.length)];
  }

  const enemy: Enemy = JSON.parse(JSON.stringify({
      ...baseEnemyData,
      stats: {
          ...baseEnemyData.stats,
          hp: baseEnemyData.stats.maxHp
      }
  }));

  const scaleFactor = 1 + (floor - 1) * 0.1;
  const bossScaleFactor = 1 + (floor / 10 - 1) * 0.25;

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
  
  enemy.stats.hp = enemy.stats.maxHp;

  return enemy;
}