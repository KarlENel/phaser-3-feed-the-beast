import Phaser from '../../lib/phaser.js';
import { InputComponent } from './input-component.js';
import * as CONFIG from '../../config.js';

export class BotPrisonerInputComponent extends InputComponent {
  #gameObject;
  #startX;
  #maxXMovement;

  constructor(gameObject) {
    super();
    this.#gameObject = gameObject;
    this.#startX = this.#gameObject.x;
    this.#maxXMovement = CONFIG.ITEM_PRISONER_MOVEMENT_MAX_X;
    this._right = true;
    this._left = false;
    this._down = true;
  }

  set startX(val) {
    this.#startX = val;
  }

  update() {
    if (this.#gameObject.x > this.#startX + this.#maxXMovement) {
      this._left = true;
      this._right = false;
    } else if (this.#gameObject.x < this.#startX - this.#maxXMovement) {
      this._left = false;
      this._right = true;
    }
  }
}
