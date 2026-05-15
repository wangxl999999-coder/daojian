// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const localConfig = require('localConfig'); 
const updateValueLabel = require('updateValueLabel');
const playerData = require('playerData');
const configuration = require('configuration');
const constants = require('constants');
const gameLogic = require('gameLogic');
const audioManager = require('audioManager');

cc.gameSpace = {};
cc.gameSpace.TIME_SCALE = 1;
cc.gameSpace.isStop = false;
cc.gameSpace.SDK = 'wx';

cc.Class({
    extends: cc.Component,

    properties: {
        lbProgress: updateValueLabel,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        let winSize = cc.winSize;
        if (winSize.width > winSize.height || (winSize.height / winSize.width) < 1.4) {
            this.node.getComponent(cc.Canvas).fitHeight = true;
        }

        cc.debug.setDisplayStats(false);
        cc.game.setFrameRate(30);

        //开启碰撞
        cc.director.getCollisionManager().enabled = true;

        cc.gameSpace.isIphoneX = (cc.game.canvas.height / cc.game.canvas.width) > 2;
        cc.gameSpace.audioManager = audioManager;
        cc.gameSpace.gameLogic = gameLogic;
        cc.gameSpace.isConfigLoadFinished = false;

        this.lbProgress.playUpdateValue(0, 99, 10);

        localConfig.loadConfig(() => {
            cc.gameSpace.isConfigLoadFinished = true;
            this.visitorLogin();
        });
    },

    getOrCreateAccount() {
        let account = configuration.getGlobalData(constants.LOCAL_CACHE.ACCOUNT);
        if (!account) {
            account = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }

        return account;
    },

    visitorLogin() {
        this.uid = this.getOrCreateAccount();
        playerData.syncServerTime(Date.now());
        this.userLogin();
    },

    userLogin() {
        //后续考虑wx接入时应该以wx账号为准
        playerData.userId = this.uid;
        configuration.setGlobalData(constants.LOCAL_CACHE.ACCOUNT, this.uid);
        configuration.setUserId(this.uid);
        playerData.loadFromCache();

        if (!playerData.isNewBee) {
            playerData.dailyLoginCanGetCount = 0;
            this.todayIndex = new Date().getDay();

            if (!playerData.gameData.dailyWelfareGet) {
                playerData.todayFirstLogin = true;
            } else {
                gameLogic.offLineReward();
            }
        }

        if (playerData.isNewBee || playerData.continuousLogin) {
            gameLogic.updateTaskData(constants.taskId.continuousLogin);
        } else {
            gameLogic.updateTaskData(constants.taskId.continuousLogin, 1);
        }

        //wx 先下载子包
        if (window.wx) {
            this.loadGameSubPackage(() => {
                this.loadMainScene();
            });
        } else {
            this.loadMainScene();
        }
    },

    showSubPackageError() {
        wx.showModal({
            title: '错误',
            content: '网络异常，请重新打开!',
            showCancel: false,
            success(res) {
                wx.exitMiniProgram();
            }
        });
    },

    loadGameSubPackage(cb) {
        if (!window.wx) {
            cb();
        } else {
            cc.loader.downloader.loadSubpackage('core', (err) => {
                if (err) {
                    this.showSubPackageError();
                    return console.error(err);
                }

                cc.loader.downloader.loadSubpackage('resources', (err) => {
                    if (err) {
                        this.showSubPackageError();
                        return console.error(err);
                    }

                    cb();
                });
            });
        }
    },

    loadMainScene() {
        cc.director.preloadScene('mainScene', function(err) {
            if (!err) {
                cc.director.loadScene('mainScene', function() {

                });
            }
        });
    },
});