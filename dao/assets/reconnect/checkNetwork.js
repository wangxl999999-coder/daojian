cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    update: function (dt) {
        this.heartbeat.checkNetwork(dt);
        this.reconnect.connectNetwork(dt);
    }
});
