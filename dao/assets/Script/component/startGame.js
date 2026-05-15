const playerData = require('playerData');
const constants = require('constants');
const douyinPlatform = kf.require('platform.douyinPlatform');

const startGameObj = cc.Class({
    extends: cc.Component,

    properties: {
        bgNode: cc.Node,

        loadingPanel: {
            type: cc.Node,
            default: null,
        },

        fastLoadPanel: [cc.Prefab],

        startPanel: '',
    },


    start() {
        this.isReady = false;
        this.clientEvent = kf.require('basic.clientEvent');

        // 初始化抖音平台
        douyinPlatform.getInstance().init();

        this.loadUnnecessaryPanel(["mainPanel"]);

        this.clientEvent.dispatchEvent('hidePanel', 'maskPanel');

        if (cc.gameSpace.isConfigLoadFinished && !playerData.isFirstLoad) {
            playerData.gameNum++;
            if (playerData.showCrazySpotPanel && playerData.gameNum % 2 === 0) {
                this.clientEvent.dispatchEvent("showPanel", "getAwardPanel",
                    {
                        showCrazySpot: true
                    });
            } else {
                var clientEvent = kf.require('basic.clientEvent');
                clientEvent.dispatchEvent("showPanel", 'gameOverPanel');
            }

            this.loadingPanel.getChildByName('loadingNode').getChildByName('logo').active = false;
            this.loadingPanel.getChildByName('loadingNode').getChildByName('gameBar').active = false;
            this.loadingPanel.active = false;
            console.info('** startGame start userlogined');
            return;
        } else {
            playerData.isFirstLoad = false;
            playerData.firstLogin = true;
            this.loadUnnecessaryPanel(["mainPanel", "superStartPanel", "matchingPanel"]);
            cc.gameSpace.audioManager.playMusic(constants.AUDIO_MUSIC.BACKGROUND, true);
            console.info('** startGame start');
            this.loadingCompleted();
        }
    },

    loadingCompleted() {
        if (cc.gameSpace.isConfigLoadFinished) {
            playerData.loadingCompleted = true;
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            if (this.startPanel) {
                this.bgNode.active = true;
                console.info('showPanel ', this.startPanel, this.loadingPanel.name);
                this.clientEvent.dispatchEvent('showPanel', this.startPanel);
            }

            // this.clientEvent.dispatchEvent("dispatchWxEvent", "initUserData", {openId: playerData.userId});
            this.loadingPanel.getChildByName('loadingNode').getChildByName('logo').active = false;
            this.loadingPanel.getChildByName('loadingNode').getChildByName('gameBar').active = false;
            this.loadingPanel.active = false;
        }
    },

    loadUnnecessaryPanel: function(arr) {
        // 手机内存不够的会闪退
        // return;
        // var arr = ["getAwardPanel", "gameOverPanel"];
        // arr = [];
        // if (this.isFrist) {
        //     // 有开场动画  去播放的话  有的手机会卡死
        //     arr = [];
        // }
        var index = 0;

        var panelCenter = kf.require("basic.panelCenter");
        var addFunc = function() {
            if (arr[index]) {
                panelCenter.getAndCreateSubPanelNotHide(arr[index], function() {
                    index++;
                    addFunc();
                }.bind(this));
            }
        }.bind(this);

        addFunc();
    },
});

kf.addModule('component.startGame', () => startGameObj);
