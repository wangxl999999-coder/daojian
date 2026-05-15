const clientEvent = kf.require('basic.clientEvent');
cc.Class({
    extends: cc.Component,

    properties: {
        rankIndex: cc.Label,
        fansCntLb: cc.Label,
        playerNameLb: cc.Label,

        spFrame: cc.Sprite,

        imgNormal: cc.SpriteFrame,
        imgSelect: cc.SpriteFrame,

        nodeDot: cc.Node
    },

    setData(data) {
        this.rankIndex.string = data.rank;
        this.fansCntLb.string = data.fansCnt;
        this.playerNameLb.string = data.playerName;

        // if (!data.isMainPlayer) {
        if (data.isAI) {
            // this.rankIndex.node.color = data.color;
            // this.fansCntLb.node.color = data.color;
            // this.playerNameLb.node.color = data.color;
            this.rankIndex.node.color = data.color;
            this.nodeDot.color = data.color;
            // this.fansCntLb.node.color = new cc.Color().fromHEX('#c5c5c5');
            // this.playerNameLb.node.color = new cc.Color().fromHEX('#c5c5c5');
            // this.node.color = new cc.Color().fromHEX('#131432');

            this.spFrame.spriteFrame = this.imgNormal;

            this.node.x = 0;
        } else {
            this.rankIndex.node.color = data.color;
            this.nodeDot.color = data.color;

            this.spFrame.spriteFrame = this.imgSelect;

            this.node.x = 15;
            // this.fansCntLb.node.color = new cc.Color().fromHEX('#FFFFFF');
            // this.playerNameLb.node.color = new cc.Color().fromHEX('#FFFFFF');
            // this.node.color = new cc.Color().fromHEX('#33c6f1');
        }
    },

    start () {
        clientEvent.on('killPlayerUI', this.killPlayerUI.bind(this));
    },

    killPlayerUI (data) {
        // if (data && data.victim.info.nickName === this.playerNameLb.string) {
        //     this.node.active = false;
        //     this.node.removeFromParent();
        // }
    },

    onDestroy() {
        clientEvent.off('killPlayerUI', this.killPlayerUI.bind(this));
    },
});
