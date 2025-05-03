import { ColliderComponent } from '../../components/collider/collider-component.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../../components/events/event-bus-component.js';
import { HealthComponent } from '../../components/health/health-component.js';
import { BotPrisonerInputComponent } from '../../components/input/bot-prisoner-input-component.js';
import { HorizontalMovementComponent } from '../../components/movement/horizontal-movement-component.js';
import { VerticalMovementComponent } from '../../components/movement/vertical-movement-component.js';
import * as CONFIG from '../../config.js';

export class PrisonerItem extends Phaser.GameObjects.Container {
  #isInitialized;
  #inputComponent;
  #horizontalMovementComponent;
  #verticalMovementComponent;
  #healthComponent;
  #colliderComponent;
  #eventBusComponent;
  #shipSprite;

  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.#isInitialized = false;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);

    this.#shipSprite = scene.add.sprite(0, 0, 'prisoner', 0);
    this.#shipSprite.setScale(0.25);
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
    return 'prisoner';
  }

  init(eventBusComponent) {
    this.#eventBusComponent = eventBusComponent;
    this.#inputComponent = new BotPrisonerInputComponent(this);
    this.#horizontalMovementComponent = new HorizontalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ITEM_PRISONER_MOVEMENT_HORIZONTAL_VELOCITY
    );
    this.#verticalMovementComponent = new VerticalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ITEM_PRISONER_MOVEMENT_VERTICAL_VELOCITY
    );
    this.#healthComponent = new HealthComponent(CONFIG.ITEM_PRISONER_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
    this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    this.#isInitialized = true;
  }

  reset() {
    this.setActive(true);
    this.setVisible(true);
    this.#healthComponent.reset();
    this.#inputComponent.startX = this.x;
    this.#verticalMovementComponent.reset();
    this.#horizontalMovementComponent.reset();
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
    this.#horizontalMovementComponent.update();
    this.#verticalMovementComponent.update();
  }
}
