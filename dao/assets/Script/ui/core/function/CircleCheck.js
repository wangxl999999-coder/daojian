const Player = require('Player');
const localConfig = require('localConfig');
const playerData = require('playerData');
const constants = require('constants');

cc.Class({
    extends: cc.Component,

    properties: {
        hostPlayer: Player,
    },

    onLoad() {
        this.initWidth = this.node.width;
        this.initHeight = this.node.height;
        this.indexflame = 0;
    },

    start() {
        // this.curFrameIndex = PlayerManager.players.indexOf(this.hostPlayer) % 3;
        // this.maxFramerate = 3;
        // this.maxFramerate = 2;
    },

    sizeUpdate(factor, isPlayer) {
        let levelTplt = localConfig.getTableArr('level');
        if (levelTplt) {
            let targetLv = this.hostPlayer.playerLv;
            if (isPlayer) {
                if (targetLv > 4) targetLv = 4;
            } else {
                this.node.x = 300 + targetLv * 15;
            }
            for (let i = 0; i < levelTplt.length; i++) {
                if (levelTplt[i].level === targetLv || i === levelTplt.length - 1) {
                    this.node.width = levelTplt[i].circleRadiusFactor * this.initWidth * factor;
                    this.node.height = levelTplt[i].circleRadiusFactor * this.initHeight * factor;
                    break;
                }
            }
        }
    },

    getRadiusByKnifeCount: function(a) {
        return 250 * this.getRadioByCount(a)
    },

    getRadioByCount: function(a) {
        return (8 > a ? 0 : 20 < a ? 12 : a - 8) / 12 + 1
    },

    circleIntersect(len, pos1, pos2) {
        const x1 = pos1.x;
        const x2 = pos2.x;
        const y1 = pos1.y;
        const y2 = pos2.y;

        if (len * len < (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) {
            return false;
        }
        return true;
    },

    update(dt) {
        
    }
});
