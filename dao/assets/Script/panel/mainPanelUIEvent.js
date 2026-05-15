var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const constants = require('constants');
const pool = kf.require('basic.pool');
const localConfig = require('localConfig');
const playerData = require('playerData');
const gameLogic = require('gameLogic');
const utils = require('utils');
const resourceUtil = require('resourceUtil');
const douyinSidebarManager = kf.require('platform.douyinSidebarManager');

const mainPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        skinLockImage: cc.Node,

        progressBlockPref: cc.Prefab,
        swordPrefab: cc.Prefab,
        superStartPayType: cc.Node,

        edtName: cc.EditBox,

        nodeDailyLoginRedDot: cc.Node,
        nodeSwordGroup: cc.Node,

        nodeDefenseEffect: cc.Node,

        btnStartGame: cc.Node,

        spPlayer: cc.Sprite,

        sfBegin: cc.SpriteFrame,
        sfBeginAgain: cc.SpriteFrame,

        btnTask: cc.Node,
        btnSidebar: cc.Node,
        nodeTaskRedDot: cc.Node,
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        this.isRoleUnlock = false;
        this.showMoreMaxCd = 3;
        this.showMoreCurCd = this.showMoreMaxCd;
        this.isShowSuperStartAgain = false;

        pool.createPrefabPool(this.progressBlockPref);
        pool.createPrefabPool(this.swordPrefab);
        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        // 初始化抖音平台功能
        this.initDouyinPlatform();
        
        if (playerData.firstLogin && !playerData.isNewBee) {
            playerData.dailyLoginCanGetCount = 0;
            this.todayIndex = new Date().getDay();

            if (!playerData.gameData.dailyWelfareGet) {
                playerData.todayFirstLogin = true;
                // 修复因为异步加载，玩家在panel没有加载出来，就乱点界面导致的界面错乱问题
                clientEvent.dispatchEvent('showPanel', 'maskPanel');
                clientEvent.dispatchEvent("showPanel", "getAwardPanel",
                    {
                        from: constants.getAwardFrom.dailyWelfare,
                        type: constants.props.gold,
                        num: 500,
                        title: '每日福利',
                        desc: '获得金币：500'
                    }, () => {
                        clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                    });
            } else {
                gameLogic.offLineReward();
            }
        }
        
        this.clickGoldBtnNum = 0;

        // 主界面转动
        this.stopKeepTime = 0.1;
        this._stopTime = 0;
        this.rotateSpeed = 150;
    },

    checkIsClick() {
        if (this.clickTime && (new Date().getTime() - this.clickTime) < 500) {
            return false;
        }

        this.clickTime = new Date().getTime();

        return true;
    },

    onStartBtnClick () {
        if (!this.checkIsClick()) {
            return;
        }

        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        let startGameFunc = function() {
            if (!playerData.underReview) {
                playerData.savePlayerName(utils.cutString(this.edtName.string));
            }
            if (this.labelInterval) {
                clearInterval(this.labelInterval);
                this.labelInterval = null;
            }
            if (this.labelTimeout) {
                clearTimeout(this.labelTimeout);
                this.labelTimeout = null;
            }
            playerData.inGame = true;
            // 修复因为异步加载，玩家在panel没有加载出来，就乱点界面导致的界面错乱问题
            clientEvent.dispatchEvent('showPanel', 'maskPanel');

            // 如果解锁了，弹出未解锁皮肤试用界面，接下来再弹出超级开局
            let isShowSkinTryPanel = false;
            if (this.isRoleUnlock) {
                this.skinArr = localConfig.getTableArr('skin');
                this.skinData = playerData.gameData.skinData;
                this.skinArrNoOwn = this.skinArr.filter(function(data) {
                    if (data.ID < 9) {
                        return false;
                    }
                    if (this.skinData[`s${data.ID}`] && this.skinData[`s${data.ID}`] == constants.getSkinNum) {
                        return false;
                    }
                    return true;
                }.bind(this));
                if (this.skinArrNoOwn.length > 0) {
                    isShowSkinTryPanel = true;
                }
            }

            var showSkin = true;
            if (isShowSkinTryPanel) {
                if (playerData.superStart != 1) {
                    showSkin = true;
                } else if (Math.random() > 0.5) {
                    showSkin = true;
                } else {
                    showSkin = false;
                }
                if(playerData.welfareConfig == 2) {
                    showSkin = true;
                }
            } else {
                showSkin = false;
            }
            if (showSkin) {
                clientEvent.dispatchEvent("showPanel", "trialSkinPanel", () => {
                    clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                });          
            } else {
                if (playerData.superStart == 1 && playerData.showSuperWelfare) {
                    clientEvent.dispatchEvent("showPanel", "superStartPanel", () => {       
                        clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                    });   
                } else {
                    clientEvent.dispatchEvent("showPanel", "matchingPanel", () => {
                        clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                    });
                }
            }

            clientEvent.dispatchEvent("hidePanel", "mainPanel");
        }.bind(this);
        // 如果未解锁--
        startGameFunc();
    },

    superStartReward () {
        if (playerData.superStart == 1) {
            playerData.superStart = 10;
        } else {
            playerData.superStart = 20;
        }

        if (this.labelInterval) {
            clearInterval(this.labelInterval);
            this.labelInterval = null;
        }
        if (this.labelTimeout) {
            clearTimeout(this.labelTimeout);
            this.labelTimeout = null;
        }
        this.createRoleNode(playerData.superStart);
        clientEvent.dispatchEvent('showPanel', 'tipsPanel', '阵容升级啦！');
    },

    onDailyLoginBtnClick () {
        if (!this.checkIsClick()) {
            return;
        }
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        // 修复因为异步加载，玩家在panel没有加载出来，就乱点界面导致的界面错乱问题
        clientEvent.dispatchEvent('showPanel', 'maskPanel');
        clientEvent.dispatchEvent("showPanel", "dailyLoginPanel", () => {
            clientEvent.dispatchEvent('hidePanel', 'maskPanel');
            //销毁主界面banner
        });
    },

    onSkinBtnClick () {
        if (!this.checkIsClick()) {
            return;
        }    
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        // 修复因为异步加载，玩家在panel没有加载出来，就乱点界面导致的界面错乱问题
        clientEvent.dispatchEvent('showPanel', 'maskPanel');
        clientEvent.dispatchEvent("showPanel", "skinPanel", () => {
            clientEvent.dispatchEvent('hidePanel', 'maskPanel');
        });
    },

    onPreviewBtnClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        playerData.useSkinIndexOwn--;
        if (playerData.useSkinIndexOwn < 0) {
            playerData.useSkinIndexOwn = this.skinArr.length - 1;
        }
        // 如果未解锁 +锁 +视频图标

        playerData.gameData.skinData.useSkinIndex = this.skinArr[playerData.useSkinIndexOwn].ID;
        playerData.skinId = playerData.gameData.skinData.useSkinIndex;
        clientEvent.dispatchEvent('updateUserDataDisplay');
    },

    onNextBtnClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        playerData.useSkinIndexOwn++;
        if (playerData.useSkinIndexOwn > this.skinArr.length - 1) {
            playerData.useSkinIndexOwn = 0;
        }

        playerData.gameData.skinData.useSkinIndex = this.skinArr[playerData.useSkinIndexOwn].ID;
        playerData.skinId = playerData.gameData.skinData.useSkinIndex;

        clientEvent.dispatchEvent('updateUserDataDisplay');
    },

    onPlayerClick () {
        if (!this.checkIsClick()) {
            return;
        }
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        // 修复因为异步加载，玩家在panel没有加载出来，就乱点界面导致的界面错乱问题
        clientEvent.dispatchEvent('showPanel', 'maskPanel');
        clientEvent.dispatchEvent("showPanel", "skinPanel", () => {
            clientEvent.dispatchEvent('hidePanel', 'maskPanel');
        });
    },

    onBtnSettingClick () {
        if (!this.checkIsClick()) {
            return;
        }
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        // 修复因为异步加载，玩家在panel没有加载出来，就乱点界面导致的界面错乱问题
        clientEvent.dispatchEvent('showPanel', 'maskPanel');
        clientEvent.dispatchEvent("showPanel", "settingPanel", () => {
            clientEvent.dispatchEvent('hidePanel', 'maskPanel');
        });
    },

    onBtnPropertyClick () {
        if (!this.checkIsClick()) {
            return;
        }
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
    },

    onBtnChangeNameClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        this.nickNameArr = localConfig.getTableArr('nickName');
        var randomIndex = Math.floor(Math.random() * this.nickNameArr.length);
        this.widget['player']['playerName'].getComponent(cc.EditBox).string = this.nickNameArr[randomIndex].nickName;

        playerData.savePlayerName(this.nickNameArr[randomIndex].nickName);      
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        if (this.btnTask) {
            this.btnTask.on('click', this.onBtnTaskClick, this);
        }
        if (this.btnSidebar) {
            this.btnSidebar.on('click', this.onBtnSidebarClick, this);
        }
    },

    initDouyinPlatform() {
        douyinSidebarManager.getInstance().init();
    },

    onBtnTaskClick() {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        clientEvent.dispatchEvent('showPanel', 'taskPanel');
    },

    onBtnSidebarClick() {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        douyinSidebarManager.getInstance().openSidebar();
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
        this.registerClientEvent('updateUserDataDisplay', function() {
            resourceUtil.setPlayerHead(`head${playerData.gameData.playerDefaultSkin + 1}`, this.spPlayer, ()=>{});

            //  更新主界面金币数量和历史最高分
            this.widget["gold"]["num"].getComponent(cc.Label).string = playerData.gameData.gold;
            this.widget["bestScore"]["score"].getComponent(cc.Label).string = playerData.gameData.bestScore;
            if (playerData.dailyLoginCanGetCount > 0) {
                this.nodeDailyLoginRedDot.active = true;
            } else {
                this.nodeDailyLoginRedDot.active = false;
            }

            this.displaySkinRole();
            this.widget["player"]["playerName"].getComponent(cc.EditBox).fontColor = cc.color('#CAB684'); // cc.color(this.skinArr[playerData.useSkinIndexOwn].uiColorValue);
            
        }.bind(this))
    },

    superStartLabelAnimation() {
        if (this.labelInterval) {
            clearInterval(this.labelInterval);
            this.labelInterval = null;
        }
        if (this.labelTimeout) {
            clearTimeout(this.labelTimeout);
            this.labelTimeout = null;
        }
        var labelString = [
            '<b><size=50>开</size>局阵容升级</b>',
            '<b>开<size=50>局</size>阵容升级</b>',
            '<b>开局<size=50>阵</size>容升级</b>',
            '<b>开局阵<size=50>容</size>升级</b>',
            '<b>开局阵容<size=50>升</size>级</b>',
            '<b>开局阵容升<size=50>级</size></b>',
            '<b>开局阵容升级</b>',
        ];
        var i = 0;
        this.labelInterval = setInterval(function() {
            if (!this.isValid) {
                clearInterval(this.labelInterval);
                this.labelInterval = null;
                clearTimeout(this.labelTimeout);
                this.labelTimeout = null;
                return;
            }
            i++;
            if (i >= labelString.length) {
                i = 0;
                clearInterval(this.labelInterval);
                this.labelInterval = null;
                this.labelTimeout = setTimeout(function() {
                    this.superStartLabelAnimation();
                }.bind(this), 2000);
            }
        }.bind(this), 200);

    },

    displaySkinRole() {
        this.skinArr = localConfig.getTableArr('skin');
        this.skinArrOwn = this.skinArr;
        this.skinData = playerData.gameData.skinData;
        this.skinArrOwn = this.skinArrOwn.filter(function(data) {
            if (this.skinData[`s${data.ID}`] && this.skinData[`s${data.ID}`] == constants.getSkinNum) {
                return true;
            }
            return false;
        }.bind(this));
        for (var i = 0; i < this.skinArr.length; i++) {
            if (playerData.skinId == this.skinArr[i].ID) {
                playerData.useSkinIndexOwn = i;
                break;
            }
        }
        this.isRoleUnlock = false;
        for (var i = 0; i < this.skinArrOwn.length; i++) {
            if (playerData.skinId == this.skinArrOwn[i].ID) {
                this.isRoleUnlock = true;
                break;
            }
        }

        this.btnStartGame.active = this.isRoleUnlock; 
        this.skinLockImage.active = !this.isRoleUnlock;
        this.createRoleNode();
        this.updateSkinAddition();
    },

    createRoleNode(superStartNum) {
        this.createSword(superStartNum);
    },

    updateSkinAddition() {
        pool.putChildInPool(this.widget['skinAddition']['fans']['progress']);
        const skinData = this.skinArr[playerData.skinId - 1];
        for(var i = 0; i < skinData.fansAddition + 1; i++) {
            var block = pool.getPrefab(this.progressBlockPref.name);
            this.widget['skinAddition']['fans']['progress'].addChild(block);
        }
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(data) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        playerData.playerLevel = playerData.gameData.playerLevel;
        playerData.sprintLevel = playerData.gameData.sprintLevel;
        playerData.fansCountLevel = playerData.gameData.fansCountLevel;
        if (playerData.gameData.playerName) {
            this.widget['player']['playerName'].getComponent(cc.EditBox).string = playerData.gameData.playerName;
        } else {
            this.nickNameArr = localConfig.getTableArr('nickName');
            var randomIndex = Math.floor(Math.random() * this.nickNameArr.length);
            this.widget['player']['playerName'].getComponent(cc.EditBox).string = this.nickNameArr[randomIndex].nickName;

            playerData.savePlayerName(this.nickNameArr[randomIndex].nickName);
        }

        this.displaySkinRole();
      
        clientEvent.dispatchEvent('updateUserDataDisplay');
        var levelData = playerData.calculateLevel();
        console.log("####" + JSON.stringify(levelData));

        this.needScore = levelData.needScore;
        //  与保存的上一次段位信息对比
        if (levelData.levelIndex > playerData.levelData.levelIndex) {
            clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升段了');
            playerData.levelData = levelData;
        } else if (levelData.levelStar > playerData.levelData.levelStar) {
            clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升星了');
            playerData.levelData = levelData;
        }

        // 检查任务红点
        this.checkTaskRedDot();
    },

    checkTaskRedDot() {
        if (this.nodeTaskRedDot) {
            const hasUnclaimedReward = this.checkHasUnclaimedTaskReward();
            this.nodeTaskRedDot.active = hasUnclaimedReward;
        }
    },

    checkHasUnclaimedTaskReward() {
        const tasks = [
            { completed: playerData.dailyLoginCompleted, claimed: playerData.dailyLoginClaimed },
            { completed: (playerData.todayPlayCount || 0) >= 3, claimed: playerData.play3GameClaimed },
            { completed: (playerData.todayWatchAdCount || 0) >= 1, claimed: playerData.watchAdClaimed },
            { completed: (playerData.todayWinCount || 0) >= 1, claimed: playerData.reachTop1Claimed }
        ];

        return tasks.some(task => task.completed && !task.claimed);
    },

    createSword: function(superStartNum) { // 主界面刀剑转动逻辑 (todo 皮肤直接写死 建议游戏里做关联)
        if (!this.isValid) {
            return;
        }
        if (!superStartNum) { // 超级开局加的人数 （todo 目前超级开局+10、+20太多了效果不好，不予显示，建议询问策划）
            superStartNum = 0;
        }
        this.nodeSwordGroup.removeAllChildren();
        const theSwordData = this.skinArr[playerData.skinId - 1];
        const swordNum = theSwordData.fansAddition; // 增加的刀剑数量

        for (let i = 0; i < this.nodeDefenseEffect.children.length; i++) {
            this.nodeDefenseEffect.children[i].color = cc.color(theSwordData.uiColorValue);
        }

        const allSwordNum = swordNum + 1;
        for (let i = 0; i < allSwordNum; i++) {
            let fanNode = pool.getPrefab(this.swordPrefab.name);
            this.nodeSwordGroup.addChild(fanNode);
            const swordEffectLogic = fanNode.getComponent('swordEffectLogic');
            swordEffectLogic.setData(allSwordNum, i);

            resourceUtil.setWeaponIcon(`weapon${playerData.skinId}`, fanNode.getComponent(cc.Sprite), ()=>{});
        }
    },

    update: function(c) {
        if (!this.isValid) {
            return;
        }
        if (this._stopTime < this.stopKeepTime) return void(this._stopTime += c);
        this.nodeSwordGroup.angle += this.rotateSpeed * c;

    }
});

kf.addModule('mainPanel.mainPanelUIEvent', () => mainPanelObj);
