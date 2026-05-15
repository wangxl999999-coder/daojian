cc.Class({
    extends: cc.Component,

    properties: {
        obstacle: cc.Node,
        world: cc.Node
    },

    onLoad() {
        window.ObstaclesManager = this;
        this.fanWidht = 110;
        this.fanHeight = 110;
        ObstaclesManager.rectObstacles = [];
    },

    start() {
        for (let i = 0; i < this.obstacle.children.length; i++) {
            if (this.obstacle.children[i].active) {
                ObstaclesManager.rectObstacles.push(this.obstacle.children[i]);
            }
        }
    },

    detectIfInObstacleByNode(node) {
        if (!PlayerManager.player) {
            return;
        }
        let worldVec = node.convertToWorldSpaceAR(cc.v2(0, 0));
        let pos = this.obstacle.convertToNodeSpaceAR(worldVec);

        let fanW = ObstaclesManager.fanWidht * PlayerManager.player.node.scale;
        let fanH = ObstaclesManager.fanHeight * PlayerManager.player.node.scale;
        let result = cc.v2(0, 0);
        // 方形障碍物
        for (let i = 0; i < ObstaclesManager.rectObstacles.length; i++) {
            let obstacle = ObstaclesManager.rectObstacles[i];
            let boundUY = obstacle.y + 0.5 * (obstacle.height + fanH);
            if (pos.y > boundUY) continue;
            let boundDY = obstacle.y - 0.5 * (obstacle.height + fanH);
            if (pos.y < boundDY) continue;
            let boundLX = obstacle.x - 0.5 * (obstacle.width + fanW);
            if (pos.x < boundLX) continue;
            let boundRX = obstacle.x + 0.5 * (obstacle.width + fanW);
            if (pos.x > boundRX) continue;
            let minDisX = (pos.x - boundLX) > (boundRX - pos.x) ? boundRX : boundLX;
            let minDisY = (pos.y - boundDY) > (boundUY - pos.y) ? boundUY : boundDY;
            if (Math.abs(minDisX - pos.x) > Math.abs(minDisY - pos.y)) {
                result = cc.v2(pos.x, minDisY);
            } else {
                result = cc.v2(minDisX, pos.y);
            }
            let localPos = this.obstacle.convertToWorldSpaceAR(result);
            return node.parent.convertToNodeSpaceAR(localPos);
        }
        return false;
    },

    detectIfInObstacle(pos) {
        if (!PlayerManager.player) {
            return;
        }
        let fanW = ObstaclesManager.fanWidht * PlayerManager.player.node.scale;
        let fanH = ObstaclesManager.fanHeight * PlayerManager.player.node.scale;
        // 方形障碍物
        for (let i = 0; i < ObstaclesManager.rectObstacles.length; i++) {
            let obstacle = ObstaclesManager.rectObstacles[i];
            let boundUY = obstacle.y + 0.5 * (obstacle.height + fanH);
            if (pos.y > boundUY) continue;
            let boundDY = obstacle.y - 0.5 * (obstacle.height + fanH);
            if (pos.y < boundDY) continue;
            let boundLX = obstacle.x - 0.5 * (obstacle.width + fanW);
            if (pos.x < boundLX) continue;
            let boundRX = obstacle.x + 0.5 * (obstacle.width + fanW);
            if (pos.x > boundRX) continue;
            let minDisX = (pos.x - boundLX) > (boundRX - pos.x) ? boundRX : boundLX;
            let minDisY = (pos.y - boundDY) > (boundUY - pos.y) ? boundUY : boundDY;
            if (Math.abs(minDisX - pos.x) > Math.abs(minDisY - pos.y)) {
                return cc.v2(pos.x, minDisY);
            } else {
                return cc.v2(minDisX, pos.y);
            }
        }
        return false;
    }
});
