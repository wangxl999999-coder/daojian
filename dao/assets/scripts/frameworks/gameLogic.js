/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 */

const playerData = require('playerData');
const localConfig = require('localConfig');
const constants = require('constants');
const clientEvent = kf.require('basic.clientEvent');
const configuration = require('configuration');

var GameLogic = cc.Class({

    properties: {
        
    },

    // use this for initialization
    onLoad () {
        this.dictSharedPanel = {};
        this.dictLoading = {};
        this.arrPopupDialog = [];

        this.randomPlayerIdle = null;
    },

    rewardByVideoAds (funStr) {
        return funStr === constants.SHARE_FUNCTION.WHEEL_TICKET || constants.SHARE_FUNCTION.SKIN_TRY || constants.SHARE_FUNCTION.DAILY_LOGIN_TODAY_GET 
        ||funStr === constants.SHARE_FUNCTION.SUPER_START || funStr === constants.SHARE_FUNCTION.REVIVE;
    },

    /**
     * 自定义事件统计
     */
    customEventStatistics (eventType, objParams) {
        eventType = eventType.toString();

        cc.log(`##### eventType:${eventType} , objParams:`, objParams);
        if (!objParams) {
            objParams = {};
        }

        objParams.uid = playerData.userId;
        objParams.isNewBee = playerData.isNewBee;

        if (window.cocosAnalytics) {
            cocosAnalytics.CACustomEvent.onStarted(eventType, objParams);
        }
    },


    ///=========== 游戏相关 ==========

    /**
     * 检查点是否在屏幕的安全区域外
     * @param {*} node 需要判断的节点
     */
    isInScreenExternal (node) {
        if (!PlayerManager.player) {
            return false;
        }
        let safeArea = {
            width: cc.Canvas.instance.node.width + 1000,
            height: cc.Canvas.instance.node.height + 1500,
        };

        let centerPoint = PlayerManager.player.node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
        let point = node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
        if (point.x < centerPoint.x - safeArea.width || 
            point.x > centerPoint.x + safeArea.width || 
            point.y < centerPoint.x - safeArea.height || 
            point.y > centerPoint.x + safeArea.height) {
            return true;
        }
        return false;
    },

    saveScore() {
        let score = PlayerManager.player.fans.length;
        playerData.fightInfo.currScore = score;
        playerData.fightInfo.killCnt = PlayerManager.player.killCnt;
        let index = PlayerManager.players.indexOf(PlayerManager.player);
        playerData.fightInfo.rank = index + 1;
        
        let userData = configuration.getConfigData('userData');
        if (userData) {
            if (score > userData.score) {
                userData.score = score;
                userData.name = PlayerManager.player.playerName;
                configuration.setConfigData('userData', userData);
            }
        } else {
            let userData = {
                name: PlayerManager.player.playerName,
                score: score
            };
            configuration.setConfigData('userData', userData);
        }
    },

    loadUserSkin() {
        if (this.randomPlayerIdle) { // todo 用全局的那个皮肤
            return;
        }
        let targetSkin = localConfig.queryByID("skin", playerData.skinId);
        if (targetSkin) {
            cc.loader.loadRes('subPackage/skinsPrefabs/' + targetSkin.prefabName, cc.Prefab, (err, prefab) => {
                if (!err) {
                    let skinNode = cc.instantiate(prefab);
                    let skinInfo = skinNode.getComponent('skinInfo');
                    this.randomPlayerIdle = skinInfo.Idle;
                }
            });
        }
    },

    updateTaskData (taskId, data) {
        let ret = playerData.updateTaskData(taskId, data);

        if (ret && cc.director.getScene().name === 'mainScene') {
            clientEvent.dispatchEvent('showPanel', 'getSkinPanel', ret);
        }
    },

    offLineReward () {
        let time = playerData.getCurrentTime();
        const old = playerData.gameData.dageOfflineTime;

        if (!old) {
            playerData.updateOfflineTime(time);
            return;
        }

        if (old > time) {
            clientEvent.dispatchEvent('showPanel', 'tipsPanel', '离线时间异常');
        } else if (old < time) {
            const offlineLevel = playerData.gameData.offlineLevel || 1;
            const offlineData = localConfig.queryByID('growUpLevel', offlineLevel);
            const {offLineCoin} = offlineData;
            let dis = time - old;
            if (dis > 12 * 60 * 1000 * 60) {
                dis = 12 * 60 * 1000 * 60;
            }
            const num = Math.floor(dis / 1000 / 60 * offLineCoin);
            playerData.updateOfflineTime(time);

            setTimeout(() => {
                if (((time - old) / 1000 / 60) > 5) {
                    clientEvent.dispatchEvent("showPanel", "getAwardPanel",
                        {
                            from: constants.getAwardFrom.dailyWelfare,
                            type: constants.props.gold,
                            num: num,
                            title: '离线收益',
                            desc: `离线收益：${num}金币`,
                            isOffline: true,
                        });
                }
            }, 1000);
        }
    },
});

var shareLogic = new GameLogic();
shareLogic.onLoad();
module.exports = shareLogic;
