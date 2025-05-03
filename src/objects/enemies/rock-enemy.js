import { ColliderComponent } from '../../components/collider/collider-component.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../../components/events/event-bus-component.js';
import { HealthComponent } from '../../components/health/health-component.js';
import { BotRockInputComponent } from '../../components/input/bot-rock-input-component.js';
import { VerticalMovementComponent } from '../../components/movement/vertical-movement-component.js';
import * as CONFIG from '../../config.js';

export class RockEnemy extends Phaser.GameObjects.Container {
  #isInitialized;
  #inputComponent;
  #verticalMovementComponent;
  #healthComponent;
  #colliderComponent;
  #shipSprite;
  #eventBusComponent;

  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.#isInitialized = false;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(40, 40);
    this.body.setOffset(-19, -19);

    this.#shipSprite = scene.add.sprite(0, 0, 'rock', 0);
    this.#shipSprite.setScale(0.75);
    this.add(this.#shipSprite);

    this.setPosition(x, y);

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.once(
      Phaser.GameObjects.Events.DESTROY,
      () => {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this
    );
  }

  get colliderComponent() {
    return this.#colliderComponent;
  }
  get healthComponent() {
    return this.#healthComponent;
  }
  get shipAssetKey() {
    return 'rock';
  }

  init(eventBusComponent) {
    this.#eventBusComponent = eventBusComponent;
    this.#inputComponent = new BotRockInputComponent();
    this.#verticalMovementComponent = new VerticalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ENEMY_ROCK_MOVEMENT_VERTICAL_VELOCITY
    );

    this.#healthComponent = new HealthComponent(CONFIG.ENEMY_ROCK_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
    this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    this.#isInitialized = true;
  }

  reset() {
    this.setActive(true);
    this.setVisible(true);
    this.#healthComponent.reset();
    this.#verticalMovementComponent.reset();
  }

  update(ts, dt) {
    if (!this.#isInitialized) {
      return;
    }

    if (!this.active) {
      return;
    }

    if (this.#healthComponent.isDead) {
      this.setActive(false);
      this.setVisible(false);
      this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
    }

    this.#inputComponent.update();
    this.#verticalMovementComponent.update();
  }
}
