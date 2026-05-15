const playerData = require('playerData');
const constants = require('constants');

cc.Class({
    extends: cc.Component,

    properties: {
        shareBtn: cc.Node,
        // backToMainBtn: cc.Node,
        rankLb: cc.Label,
        // murderLb: cc.Label,
        display: cc.Sprite,
        countDownLb: cc.Label,
    },

    onLoad() {
        let displayWidget = this.display.getComponent(cc.Widget);
        if (displayWidget) {
            displayWidget.target = cc.Canvas.instance.node;
            displayWidget.top = 0;
            displayWidget.bottom = 0;
            displayWidget.left = 0;
            displayWidget.right = 0;

            displayWidget.updateAlignment();
        }

        this.onSharing = false;
    },

    start() {
        let totalTime = 9;
        this.countDownLb.string = totalTime;
        this.countDownId = setInterval(function() {
            if (!this.onSharing || window.tt) {
                totalTime--;
                if (totalTime < 0) {
                   playerData.AILevelDown();
                    cc.director.loadScene('mainScene');
                } else {
                    this.countDownLb.string = totalTime;
                }
            }
        }.bind(this), 1000);

        PlayerManager.players.sort(function(a, b) {
            return b.fans.length - a.fans.length;
        });

        let index = PlayerManager.players.indexOf(PlayerManager.player);
        this.rankLb.string = "." + (index + 1);
    },

    onBtnShareClick () {
        if (PlayerManager.player && playerData.gameState !== constants.GAME_STATE.TIME_OVER) {
            PlayerManager.player.reviveVip();
            playerData.gameState = constants.GAME_STATE.PLAY;
        }

        if (!this.isValid) {
            return;
        }
        this.node.destroy();
    },

    onBtnContinueClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.LOSE);
        playerData.AILevelDown();
        cc.director.loadScene('mainScene');
    },

    onDestroy() {
        clearInterval(this.countDownId);
    },
    
    // 停止左右移动
    stopScroll: function () {
        this.scroll = false
    },
});
