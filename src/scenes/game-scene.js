import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import Phaser from '../lib/phaser.js';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js';
import { RockEnemy } from '../objects/enemies/rock-enemy.js';
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { MeatItem } from '../objects/items/meat-item.js';
import { PrisonerItem } from '../objects/items/prisoner-item.js';
import { Player } from '../objects/player.js';
import * as CONFIG from '../config.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { Score } from '../objects/ui/score.js';
import { Lives } from '../objects/ui/lives.js';
import { AudioManager } from '../objects/audio-manager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.add.sprite(0, 0, 'bg1', 0).setOrigin(0, 1).setAlpha(0.7).play('bg1').setAngle(90).setScale(1, 1.25);
    this.add.sprite(0, 0, 'bg2', 0).setOrigin(0, 1).setAlpha(0.7).play('bg2').setAngle(90).setScale(1, 1.25);
    this.add.sprite(0, 0, 'bg3', 0).setOrigin(0, 1).setAlpha(0.7).play('bg3').setAngle(90).setScale(1, 1.25);

    const eventBusComponent = new EventBusComponent();

    const player = new Player(this, eventBusComponent);

    // spawn enemies
    const scoutSpawner = new EnemySpawnerComponent(
      this,
      ScoutEnemy,
      {
        interval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    const fighterSpawner = new EnemySpawnerComponent(
      this,
      FighterEnemy,
      {
        interval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    const rockSpawner = new EnemySpawnerComponent(
      this,
      RockEnemy,
      {
        interval: CONFIG.ENEMY_ROCK_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_ROCK_GROUP_SPAWN_START,
      },
      eventBusComponent
    );

    // spawn items
    const meatSpawner = new EnemySpawnerComponent(
      this,
      MeatItem,
      {
        interval: CONFIG.ITEM_MEAT_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ITEM_MEAT_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    const prisonerSpawner = new EnemySpawnerComponent(
      this,
      PrisonerItem,
      {
        interval: CONFIG.ITEM_PRISONER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ITEM_PRISONER_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    new EnemyDestroyedComponent(this, eventBusComponent);

    //player and enemy
    this.physics.add.overlap(
      player,
      scoutSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {ScoutEnemy}*/ enemyGameObject) => {
        if (!enemyGameObject.active || !playerGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      }
    );
    this.physics.add.overlap(
      player,
      fighterSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {FighterEnemy}*/ enemyGameObject) => {
        if (!enemyGameObject.active || !playerGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      }
    );
    this.physics.add.overlap(
      player,
      rockSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {RockEnemy}*/ enemyGameObject) => {
        if (!enemyGameObject.active || !playerGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      }
    );

    // items
    this.physics.add.overlap(
      player,
      meatSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {MeatItem}*/ meatGameObject) => {
        if (!meatGameObject.active || !playerGameObject.active) {
          return;
        }

        meatGameObject.colliderComponent.collideWithEnemyShip();
        meatGameObject.setActive(false);
        meatGameObject.setVisible(false);

        playerGameObject.scoreComponent.addScore(CONFIG.ITEM_MEAT_SCORE);
      }
    );
    this.physics.add.overlap(
      player,
      prisonerSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {PrisonerItem}*/ prisonerGameObject) => {
        if (!prisonerGameObject.active || !playerGameObject.active) {
          return;
        }

        prisonerGameObject.colliderComponent.collideWithEnemyShip();
        prisonerGameObject.setActive(false);
        prisonerGameObject.setVisible(false);

        playerGameObject.scoreComponent.addScore(CONFIG.ITEM_PRISONER_SCORE);
      }
    );

    eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
      if (gameObject.constructor.name !== 'FighterEnemy') {
        return;
      }

      this.physics.add.overlap(
        player,
        gameObject.weaponGameObjectGroup,
        (/** @type {Player}*/ playerGameObject, projectileGameObject) => {
          if (!playerGameObject.active) {
            return;
          }

          gameObject.weaponComponent.destroyBullet(projectileGameObject);
          playerGameObject.colliderComponent.collideWithEnemyProjectile();
        }
      );
    });

    new Score(this, eventBusComponent);
    new Lives(this, eventBusComponent);

    new AudioManager(this, eventBusComponent);

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.3);
    const y = this.scale.height - this.scale.height / 3.5;
    graphics.beginPath();
    graphics.moveTo(0, y);
    graphics.lineTo(this.scale.width, y);
    graphics.strokePath();
    graphics.closePath();
  }
}
