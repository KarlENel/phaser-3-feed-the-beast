import Phaser from '../lib/phaser.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');
    this.load.image('rock', 'assets/images/foozle/rock.png');
    this.load.image('beast', 'assets/images/foozle/beast.png');
    this.load.image('meat', 'assets/images/foozle/meat.png');
    this.load.image('prisoner', 'assets/images/foozle/prisoner.png');
  }

  create() {
    this.#createAnimations();
    this.scene.start('GameScene');
  }

  #createAnimations() {
    const data = this.cache.json.get('animations_json');
    data.forEach((animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
        : this.anims.generateFrameNumbers(animation.assetKey);
      this.anims.create({
        key: animation.key,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    });
  }
}
