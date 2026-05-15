cc.Class({
    extends: cc.Component,

    properties: {
        circlePrefab: cc.Prefab,
        circleParent: cc.Node
    },

    onLoad() {
        window.CircleManager = this;
    },

    addCircle(hostPlayer) {
        let circle = cc.instantiate(this.circlePrefab);
        circle.parent = this.circleParent;
        let follow = circle.getComponent('Follow');
        follow.target = hostPlayer.node;
        let circleCheck = circle.getComponent('CircleCheck');
        circleCheck.hostPlayer = hostPlayer;

        return circleCheck;
    }
});
