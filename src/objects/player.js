import { ColliderComponent } from '../components/collider/collider-component.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { HealthComponent } from '../components/health/health-component.js';
import { KeyboardInputComponent } from '../components/input/keyboard-input-component.js';
import { HorizontalMovementComponent } from '../components/movement/horizontal-movement-component.js';
import { VerticalMovementComponent } from '../components/movement/vertical-movement-component.js';
import * as CONFIG from '../config.js';
import { Score } from './ui/score.js';

export class Player extends Phaser.GameObjects.Container {
  #keyboardInputComponent;
  #healthComponent;
  #horizontalMovementComponent;
  #colliderComponent;
  #eventBusComponent;
  #shipSprite;
  #scoreComponent;
  #verticalMovementComponent;

  constructor(scene, eventBusComponent) {
    super(scene, scene.scale.width / 2, scene.scale.height - 32, []);
    this.#eventBusComponent = eventBusComponent;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);
    this.body.setCollideWorldBounds(true);
    this.setDepth(2);

    this.#shipSprite = scene.add.sprite(0, 0, 'beast');
    this.#shipSprite.setScale(0.5);
    this.add(this.#shipSprite);

    this.#keyboardInputComponent = new KeyboardInputComponent(this.scene);
    this.#horizontalMovementComponent = new HorizontalMovementComponent(
      this,
      this.#keyboardInputComponent,
      CONFIG.PLAYER_MOVEMENT_HORIZONTAL_VELOCITY
    );
    this.#verticalMovementComponent = new VerticalMovementComponent(
      this,
      this.#keyboardInputComponent,
      CONFIG.PLAYER_MOVEMENT_HORIZONTAL_VELOCITY
    );
    this.#healthComponent = new HealthComponent(CONFIG.PLAYER_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
    this.#scoreComponent = new Score(this.scene, this.#eventBusComponent);

    this.#hide();

    this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_SPAWN, this.#spawn, this);

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
  get scoreComponent() {
    return this.#scoreComponent;
  }

  update(ts, dt) {
    if (!this.active) {
      return;
    }

    if (this.#healthComponent.isDead) {
      this.#hide();
      this.setVisible(true);
      this.#shipSprite.play({
        key: 'explosion',
      });
      this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DESTROYED);
      return;
    }

    this.#keyboardInputComponent.update();
    this.#horizontalMovementComponent.update();
    this.#verticalMovementComponent.update();

    const minY = this.scene.scale.height - this.scene.scale.height / 4;
    const maxY = this.scene.scale.height - 32;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;
  }

  #hide() {
    this.setActive(false);
    this.setVisible(false);
    this.#keyboardInputComponent.lockInput = true;
  }

  #spawn() {
    this.setActive(true);
    this.setVisible(true);
    this.#shipSprite.setTexture('beast');
    this.#healthComponent.reset();
    this.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 32);
    this.#keyboardInputComponent.lockInput = false;
    if (this.#verticalMovementComponent) this.#verticalMovementComponent.reset();
  }
}
