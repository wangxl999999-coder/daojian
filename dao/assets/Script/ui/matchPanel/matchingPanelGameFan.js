cc.Class({
    extends: cc.Component,

    properties: {
        image: cc.Sprite,
        idle: [cc.SpriteFrame]
    },

    onLoad() {
        this.idle.spriteFrameIndex = 0;
        this.deltaAnimFrame = 0.33;
        this.anim = this.idle;
        this.node.opacity = 255;
        this.fadeTime = 255;
        this.fadeSpeed = 150;

        this.stage = 0;
    },

    update(dt) {
        this.playAnimation(dt);
        this.fadeTime -= this.fadeSpeed * dt;
        if (this.stage === 0) {
            if (this.fadeTime < 0) {
                this.node.opacity = 0;
                this.stage = 1;
            }
        }
        if (this.stage === 1) {
            this.node.opacity -= this.fadeSpeed * dt;
            if (this.node.opacity < 0) {
                this.node.opacity = 0;
            }
        }
    },

    playAnimation(dt) {
        if (!this.curAnimFrame) {
            this.curAnimFrame = dt;
        } else {
            this.curAnimFrame += dt;
        }
        if (this.curAnimFrame < this.deltaAnimFrame) {
            return;
        }
        this.curAnimFrame = 0;

        this.anim.spriteFrameIndex++;
        if (this.anim.spriteFrameIndex >= this.idle.length) {
            this.anim.spriteFrameIndex = 0;
        }
        this.image.spriteFrame = this.idle[this.anim.spriteFrameIndex];
    },

});
