cc.Class({
    extends: cc.Component,

    properties: {
        image: cc.Sprite,
        // idle: [cc.SpriteFrame]
    },

    onLoad() {


        // this.idle.spriteFrameIndex = 0;

        // 危险检测范围
        // this.dangerDetectDistance = 1000;
        this.deltaAnimFrame = 0.33;
        this.anim = this.idle
    },

    update(dt) {
        // this.playAnimation(dt);
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
