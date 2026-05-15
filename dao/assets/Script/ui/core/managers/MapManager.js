const playerData = require('playerData');
const constants = require('constants');

cc.Class({
    extends: cc.Component,

    properties: {
        leftCorner: cc.Node,
        rightCorner: cc.Node,
        upCorner: cc.Node,
        downCorner: cc.Node,
        leftShadow: cc.Node,
        rightShadow: cc.Node,
        upShadow: cc.Node,
        downShadow: cc.Node,

        obs2: cc.Node,
        obs3: cc.Node,
        obs4: cc.Node,
        obs5: cc.Node,

        obs31: cc.Node,
        obs51: cc.Node,

        obsPos: [cc.Vec2],
    },

    onLoad() {
        window.MapManager = this;
        // 触发时间点
        this.timePoint = [60, 90, 120];
        // 每次地图缩减的持续时间
        this.durTime = 10;
        this.timeIndex = 0;
        this.deltaDistance = 500;

        this.obstacleInit();
    },

    isAboutToReduceMap() {
        if (playerData.fadeTime - MapManager.timePoint[MapManager.timeIndex] >= -12
            && playerData.fadeTime - MapManager.timePoint[MapManager.timeIndex] <= -8) {
            return true;
        }
        return false;
    },

    update(dt) {
        if (playerData.gameState === constants.GAME_STATE.PLAY) {
            if (this.timeIndex >= this.timePoint.length) {
                return;
            }
            if (playerData.fadeTime === this.timePoint[this.timeIndex]) {
                this.timeIndex++;
                this.reduceMapSize();
            }
        }
    },

    reduceMapSize() {
        let dt = 20;
        let nowTime = 0;
        let wallSpeed = this.deltaDistance / this.durTime / 1000;
        MapManager.reduceId = setInterval(function() {
            if (!MapManager || !MapManager.node) {
                return;
            }
            playerData.BoundSize.x -= wallSpeed * dt;
            playerData.BoundSize.y -= wallSpeed * dt;
            MapManager.leftCorner.x += wallSpeed * dt / 2;
            MapManager.rightCorner.x -= wallSpeed * dt / 2;
            MapManager.upCorner.y -= wallSpeed * dt / 2;
            MapManager.downCorner.y += wallSpeed * dt / 2;
            MapManager.leftShadow.x += wallSpeed * dt / 2;
            MapManager.rightShadow.x -= wallSpeed * dt / 2;
            MapManager.upShadow.y -= wallSpeed * dt / 2;
            MapManager.downShadow.y += wallSpeed * dt / 2;
            nowTime += dt;
            if (nowTime > MapManager.durTime * 1000) {
                clearInterval(MapManager.reduceId);
            }
        }, dt);
    },

    obstacleInit () {

        this.obs2.active = false;
        this.obs3.active = false;
        this.obs4.active = false;
        this.obs5.active = false;
        this.obs31.active = false;
        this.obs51.active = false;

        let roundCnt = playerData.gameData.roundCnt;
        if (!roundCnt || roundCnt < 2) {
            //新手保护，前两场不出现障碍物
            return;
        }

        // 重复使用的，会导致前一个没有
        const r1 = this.getR();
        const r2 = this.getR();
        let a1 = Math.floor(Math.random() * this.obsPos.length);
        const a2 = (Math.random() * this.obsPos.length) | 0;

        if (a1 === a2) {
            // 重复位置
            if (a1 < this.obsPos.length - 1) {
                a1++;
            } else {
                a1 = 0;
            }
        }

        if (r1 === 1) { // 十字架
            if (r1 === r2) {
                this.newObs31 = cc.instantiate(this['obs31']);
                this.newObs51 = cc.instantiate(this['obs51']);
                this.newObs31.parent = this['obs31'].parent;
                this.newObs51.parent = this['obs51'].parent;
            }

            this['obs31'].setPosition(this.obsPos[a1]);
            this['obs31'].active = true;

            this['obs51'].setPosition(this.obsPos[a1]);

            this['obs51'].active = true;

        } else {
            if (r1 === r2) {
                this.newObs = cc.instantiate(this[`obs${r1}`]);
                this.newObs.parent = cc.instantiate(this[`obs${r1}`]).parent;
            }

            this[`obs${r1}`].setPosition(this.obsPos[a1]);
            this[`obs${r1}`].active = true;

        }

        if (r2 === 1) { // 十字架
            if (r2 === r1) {
                this.newObs31.setPosition(this.obsPos[a2]);
                this.newObs31.active = true;

                this.newObs51.setPosition(this.obsPos[a2]);
                this.newObs51.active = true;

            } else {
                this['obs31'].setPosition(this.obsPos[a2]);
                this['obs31'].active = true;

                this['obs51'].setPosition(this.obsPos[a2]);
                this['obs51'].active = true;

            }
        } else {
            if (r2 === r1) {
                this.newObs.setPosition(this.obsPos[a2]);
                this.newObs.active = true;

            } else {
                this[`obs${r2}`].setPosition(this.obsPos[a2]);
                this[`obs${r2}`].active = true;

            }
        }
    },

    getR () {
        return ((Math.random() * 5) | 0) + 1;
    },

    onDestroy() {
        clearInterval(MapManager.reduceId);
    },
});
