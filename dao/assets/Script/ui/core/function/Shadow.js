cc.Class({
    extends: cc.Component,
    setHost(host) {
        this.host = host;
        let script = this.host.getComponent('Player');
        if (script) {
            this.bodySpritNode = script.bodySprite.node;
        } else {
            script = this.host.getComponent('fan');
            if (script) {
                this.bodySpritNode = script.bodySprite.node;
            } else {
                this.bodySpritNode = this.host;
            }
        }
        this.sizeUpdate();
    },

    sizeUpdate() {
        this.node.scale = this.host.scale;
        this.node.width = this.bodySpritNode.width + 10;
    },

    lateUpdate() {
        if (this.host && this.host.active) {
            let offsetY = this.host.scaleY * this.bodySpritNode.height * 0.5;
            let worldVec = this.host.convertToWorldSpaceAR(cc.v2(0, 0));
            let localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            this.node.x = localVec.x;
            this.node.y = localVec.y - offsetY;
            this.node.opacity = this.host.opacity;
        } else {
            this.node.opacity = 0;
        }
    }
});
