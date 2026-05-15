cc.Class({
    extends: cc.Component,
    properties: {
        target: {
            default: null,
            type: cc.Node,
        },
        offset: cc.Vec2,
        isSpring: false
    },

    setPosImmediately() {
        if (this.target) {
            let worldVec = this.target.convertToWorldSpaceAR(cc.v2(0, 0));
            let localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            this.node.x = localVec.x + this.offset.x;
            this.node.y = localVec.y + this.offset.y;
        }
    },

    lateUpdate(dt) {
        if (this.target) {
            let worldVec = this.target.convertToWorldSpaceAR(cc.v2(0, 0));
            let localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            if (this.isSpring) {
                this.node.x = cc.lerp(this.node.x, localVec.x + this.offset.x, 4 * dt);
                this.node.y = cc.lerp(this.node.y, localVec.y + this.offset.y, 4 * dt);
            } else {
                this.node.x = localVec.x + this.offset.x;
                this.node.y = localVec.y + this.offset.y;
            }
        }
    }
});
