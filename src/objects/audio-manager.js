import Phaser from '../lib/phaser.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';

export class AudioManager {
  #scene;
  #eventBusComponent;

  constructor(scene, eventBusComponent) {
    this.#scene = scene;
    this.#eventBusComponent = eventBusComponent;

    this.#scene.sound.play('bg', {
      volume: 0.6,
      loop: true,
    });

    this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, () => {
      this.#scene.sound.play('explosion', {
        volume: 0.6,
      });
    });
    this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_DESTROYED, () => {
      this.#scene.sound.play('explosion', {
        volume: 0.6,
      });
    });

    this.#eventBusComponent.on(CUSTOM_EVENTS.SHIP_HIT, () => {
      this.#scene.sound.play('hit', {
        volume: 0.6,
      });
    });

    this.#eventBusComponent.on(CUSTOM_EVENTS.SHIP_SHOOT, () => {
      this.#scene.sound.play('shot1', {
        volume: 0.05,
      });
    });
  }
}
