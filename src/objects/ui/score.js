import { CUSTOM_EVENTS, EventBusComponent } from '../../components/events/event-bus-component.js';
import * as CONFIG from '../../config.js';

const ENEMY_SCORES = {
  MeatItem: CONFIG.ITEM_MEAT_SCORE,
  PrisonerItem: CONFIG.ITEM_PRISONER_SCORE,
  ScoutEnemy: CONFIG.ENEMY_SCOUT_SCORE,
  RockEnemy: CONFIG.ENEMY_ROCK_SCORE,
  FighterEnemy: CONFIG.ENEMY_FIGHTER_SCORE,
};

export class Score extends Phaser.GameObjects.Text {
  #score;
  #eventBusComponent;

  constructor(scene, eventBusComponent) {
    super(scene, scene.scale.width / 2, 20, '', {
      fontSize: '24px',
      color: '#ff2f66',
    });

    this.scene.add.existing(this);
    this.#eventBusComponent = eventBusComponent;
    this.#score = 0;
    this.setOrigin(0.5);

    this.#eventBusComponent.off(CUSTOM_EVENTS.ENEMY_DESTROYED);
  }

  addScore(points) {
    this.#score += points;
    this.setText(this.#score.toString(10));

    if (this.#score >= 20) {
      this.scene.add
        .text(this.scene.scale.width / 2, this.scene.scale.height / 2, 'The Beast is feed', {
          fontSize: '24px',
        })
        .setOrigin(0.5);
      this.#eventBusComponent.emit(CUSTOM_EVENTS.GAME_OVER);
    }
  }
}
