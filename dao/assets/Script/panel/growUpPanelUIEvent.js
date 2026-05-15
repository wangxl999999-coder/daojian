var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
var subPanel = kf.require('component.subPanel');
const constants = require('constants');
const localConfig = require('localConfig');
const playerData = require('playerData');

var growUpPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: subPanel,

    properties: {
        fansCountNode: cc.Node,
        offlineNode: cc.Node,
        sprintNode: cc.Node,
        speedNode: cc.Node,

        currentBar: cc.Node,

        speedLevelUpLayout: cc.Node,
        offLineLevelUpLayout: cc.Node,
        fansLevelUpLayout: cc.Node,
        chongciLevelUpLayout: cc.Node,
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        this.speedLevelUpIcon = this.speedLevelUpLayout.getChildByName('icon');
        this.offLineLevelUpIcon = this.offLineLevelUpLayout.getChildByName('icon');
        this.fansLevelUpIcon = this.fansLevelUpLayout.getChildByName('icon');
        this.chongciLevelUpIcon = this.chongciLevelUpLayout.getChildByName('icon');

        this.speedLevelUpLabel = this.speedLevelUpLayout.getChildByName('Label');
        this.offLineLevelUpLabel = this.offLineLevelUpLayout.getChildByName('Label');
        this.fansLevelUpLabel = this.fansLevelUpLayout.getChildByName('Label');
        this.chongciLevelUpLabel = this.chongciLevelUpLayout.getChildByName('Label');

        this.goldText = '升级';
        this.videoText = '连升3级';

        this.refreshUI();

        this.showBar(0);
    },

    closePanel() {
        clientEvent.dispatchEvent('hidePanel', 'growUpPanel');
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        // this.widget 是访问子控件的方式
        this.widget['selectNode']['speedBtn'].on('touchend', () => {
            this.currentBar.x = this.widget['selectNode']['speedBtn'].x - 8;
            this.showBar(0);
        });

        this.widget['selectNode']['fansBtn'].on('touchend', () => {
            this.currentBar.x = this.widget['selectNode']['fansBtn'].x - 8;
            this.showBar(1);
        });

        this.widget['selectNode']['sprintBtn'].on('touchend', () => {
            this.currentBar.x = this.widget['selectNode']['sprintBtn'].x - 8;
            this.showBar(2);
        });

        this.widget['selectNode']['offlineBtn'].on('touchend', () => {
            this.currentBar.x = this.widget['selectNode']['offlineBtn'].x - 8;
            this.showBar(3);
        });
    },

    showBar(index) {
        const arr = [this.speedNode, this.fansCountNode, this.sprintNode, this.offlineNode];
        for (let i = 0; i < arr.length; i++) {
            if (i === index) {
                arr[i].active = true;
            } else {
                arr[i].active = false;
            }
        }
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
        // this.registerClientEvent('updateUserDataDisplay', function() {
        //
        // }.bind(this));
    },

    onLevelUp (event, custom) {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        switch (custom) {
            case 'offline':
                if (playerData.gameData.gold < this.nextOfflineData.offlineLevelCost) {
                    this.playVideoToLevelUp(custom);
                } else if (this.nextOfflineData.offlineLevelCost > 0) {
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升级成功');
                    playerData.gameData.gold -= this.nextOfflineData.offlineLevelCost;
                    playerData.gameData.offlineLevel += 1;
                    playerData.offlineUpgradeCount++;
                    clientEvent.dispatchEvent('updateUserDataDisplay');
                    
                    this.refreshUI();
                }
                break;
            case 'fans':
                if (playerData.gameData.gold < this.nextCountData.fansCoin) {
                    this.playVideoToLevelUp(custom);
                } else if (this.nextCountData.fansCoin > 0) {
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升级成功');
                    playerData.gameData.gold -= this.nextCountData.fansCoin;
                    playerData.gameData.fansCountLevel += 1;
                    playerData.fansUpgradeCount++;
                    clientEvent.dispatchEvent('updateUserDataDisplay');
                    this.refreshUI();
                }
                break;
            case 'sprint':
                if (playerData.gameData.gold < this.nextSprintData.sprintCoin) {
                    this.playVideoToLevelUp(custom);
                } else if (this.nextSprintData.sprintCoin > 0) {
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升级成功');
                    playerData.gameData.gold -= this.nextSprintData.sprintCoin;
                    playerData.gameData.sprintLevel += 1;
                    playerData.sprintUpgradeCount++;
                    clientEvent.dispatchEvent('updateUserDataDisplay');
                    this.refreshUI();
                }
                break;
            case 'speed':
                if (playerData.gameData.gold < this.nextPlayerData.coin) {
                    this.playVideoToLevelUp(custom);
                } else if (this.nextPlayerData) {
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升级成功');
                    playerData.gameData.gold -= this.nextPlayerData.coin;
                    playerData.gameData.playerLevel += 1;
                    playerData.speedUpgradeCount++;
                    clientEvent.dispatchEvent('updateUserDataDisplay');
                    this.refreshUI();
                }
                break;
            default:
                break;
        }
    },

    /**
     * type 表示是哪一种升级
     */
    playVideoToLevelUp (type) {
        // 有视频源, 看广告升级
        let title = '离线视频';
        let shareId = '';
        switch (type) {
            case 'offline':
                console.log("离线视频播放");
                title = '离线视频';
                shareId = constants.shareId.sprintPropertyTrain;
                break;
            case 'fans':
                console.log("人数视频播放");
                title = '人数视频';
                shareId = constants.shareId.sprintPropertyTrain;
                break;
            case 'sprint':
                console.log("冲刺视频播放");
                title = '冲刺视频';
                shareId = constants.shareId.sprintPropertyTrain;
                break;
            case 'speed':
                console.log("速度视频播放");
                title = '速度视频';
                shareId = constants.shareId.sprintPropertyTrain;
                break;
            default:
                break;
        }
        // 播放成功的回调
        clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升级成功');
        switch (type) {
            case 'offline':
                console.log("离线视频成功");
                playerData.gameData.offlineLevel += 1;
                playerData.offlineUpgradeCount = 0;
                clientEvent.dispatchEvent('updateUserDataDisplay');
                this.refreshUI();
                break;
            case 'fans':
                console.log("人数视频成功");
                playerData.gameData.fansCountLevel += 1;
                playerData.fansUpgradeCount = 0;
                clientEvent.dispatchEvent('updateUserDataDisplay');
                this.refreshUI();
                break;
            case 'sprint':
                console.log("冲刺视频成功");
                playerData.gameData.sprintLevel += 1;
                playerData.sprintUpgradeCount = 0;
                clientEvent.dispatchEvent('updateUserDataDisplay');
                this.refreshUI();
                break;
            case 'speed':
                console.log("速度视频成功");
                playerData.gameData.playerLevel += 1;
                playerData.speedUpgradeCount = 0;
                clientEvent.dispatchEvent('updateUserDataDisplay');
                this.refreshUI();
                break;
            default:
                break;
        }
    },

    refreshUI () {
        if (!playerData.gameData.offlineLevel) playerData.gameData.offlineLevel = 1;
        if (!playerData.gameData.sprintLevel) playerData.gameData.sprintLevel = 1;
        if (!playerData.gameData.fansCountLevel) playerData.gameData.fansCountLevel = 1;
        if (!playerData.gameData.playerLevel) playerData.gameData.playerLevel = 1;
        
        this.offlineLevel = playerData.gameData.offlineLevel;
        this.sprintLevel = playerData.gameData.sprintLevel;
        this.fansCountLevel = playerData.gameData.fansCountLevel;
        this.playerLevel = playerData.gameData.playerLevel;

        this.curOfflineData = localConfig.queryByID('growUpLevel', playerData.gameData.offlineLevel);
        this.curSprintData = localConfig.queryByID('growUpLevel', playerData.gameData.sprintLevel);
        this.curFansCountData = localConfig.queryByID('growUpLevel', playerData.gameData.fansCountLevel);
        this.curPlayerData = localConfig.queryByID('growUpLevel', playerData.gameData.playerLevel);

        this.nextOfflineData = localConfig.queryByID('growUpLevel', playerData.gameData.offlineLevel + 1);
        this.nextSprintData = localConfig.queryByID('growUpLevel', playerData.gameData.sprintLevel + 1);
        this.nextCountData = localConfig.queryByID('growUpLevel', playerData.gameData.fansCountLevel + 1);
        this.nextPlayerData = localConfig.queryByID('growUpLevel', playerData.gameData.playerLevel + 1);

        this.setFansCountData();
        this.setOfflineData();
        this.setSprintData();
        this.setPlayerData();

        playerData.playerLevel = playerData.gameData.playerLevel;
        playerData.sprintLevel = playerData.gameData.sprintLevel;
        playerData.fansCountLevel = playerData.gameData.fansCountLevel;
    },

    setPlayerData () {
        const titleLab = this.speedNode.getChildByName('title').getComponent(cc.Label);
        const tipsLab = this.speedNode.getChildByName('tips').getComponent(cc.Label);
        const countLab = this.speedNode.getChildByName('count').getComponent(cc.Label);
        const levelUp = this.speedNode.getChildByName('growUp');
        const ic_gold = this.speedNode.getChildByName('ic_gold');
        if (!this.nextPlayerData) {
            // 满级
            titleLab.string = `满级`;
            tipsLab.string = `增加${this.playerLevel + 1}%的移动速度`;
            countLab.string = '';
            levelUp.active = false;
            ic_gold.active = false;
        } else {
            titleLab.string = `下一级：${this.playerLevel + 1}级`;
            let temp = ((this.nextPlayerData.speed / 380 * 100) - 100);
            if (temp < 1) {
                temp = 1;
            }
            tipsLab.string = `增加${this.playerLevel + 1}%的移动速度`;
            countLab.string = `消耗：${this.nextPlayerData.coin}`;
            levelUp.active = true;
            ic_gold.active = true;

            this.speedLevelUpIcon.active = false;
            this.speedLevelUpLabel.getComponent(cc.Label).string = this.goldText;
        }
    },

    setSprintData () {
        const titleLab = this.sprintNode.getChildByName('title').getComponent(cc.Label);
        const tipsLab = this.sprintNode.getChildByName('tips').getComponent(cc.Label);
        const countLab = this.sprintNode.getChildByName('count').getComponent(cc.Label);
        const levelUp = this.sprintNode.getChildByName('growUp');
        const ic_gold = this.sprintNode.getChildByName('ic_gold');
        if (!this.nextSprintData || !this.nextSprintData.sprintCoin) {
            // 满级

            titleLab.string = `满级`;
            tipsLab.string = `每局可用${this.curSprintData.sprintCount}次，每次持续${this.curSprintData.sprintTime}秒`;;
            countLab.string = '';
            levelUp.active = false;
            ic_gold.active = false;
        } else {
            titleLab.string = `下一级：${this.sprintLevel + 1}级`;
            tipsLab.string = `每局可用${this.nextSprintData.sprintCount}次，每次持续${this.nextSprintData.sprintTime}秒`;
            countLab.string = `消耗：${this.nextSprintData.sprintCoin}`;
            levelUp.active = true;
            ic_gold.active = true;

            if (playerData.gameData.gold < this.nextSprintData.sprintCoin) {
                this.chongciLevelUpIcon.active = true;
                this.chongciLevelUpLabel.getComponent(cc.Label).string = this.videoText;
            } else {
                this.chongciLevelUpIcon.active = false;
                this.chongciLevelUpLabel.getComponent(cc.Label).string = this.goldText;
            }
        }
    },

    setOfflineData () {
        const titleLab = this.offlineNode.getChildByName('title').getComponent(cc.Label);
        const tipsLab = this.offlineNode.getChildByName('tips').getComponent(cc.Label);
        const countLab = this.offlineNode.getChildByName('count').getComponent(cc.Label);
        const levelUp = this.offlineNode.getChildByName('growUp');
        const ic_gold = this.offlineNode.getChildByName('ic_gold');
        if (!this.nextOfflineData || !this.nextOfflineData.offlineLevelCost) {
            // 满级
            titleLab.string = `满级`;
            tipsLab.string = `增加${(this.offlineLevel + 1) * 2}%的离线收益`;
            countLab.string = '';
            levelUp.active = false;
            ic_gold.active = false;
        } else {
            titleLab.string = `下一级：${this.offlineLevel + 1}级`;
            tipsLab.string = `增加${(this.offlineLevel + 1) * 2}%的离线收益`;
            countLab.string = `消耗：${this.nextOfflineData.offlineLevelCost}`;
            levelUp.active = true;
            ic_gold.active = true;

            this.offLineLevelUpIcon.active = false;
            this.offLineLevelUpLabel.getComponent(cc.Label).string = this.goldText;
        }
    },

    setFansCountData () {
        const titleLab = this.fansCountNode.getChildByName('title').getComponent(cc.Label);
        const tipsLab = this.fansCountNode.getChildByName('tips').getComponent(cc.Label);
        const countLab = this.fansCountNode.getChildByName('count').getComponent(cc.Label);
        const levelUp = this.fansCountNode.getChildByName('growUp');
        const ic_gold = this.fansCountNode.getChildByName('ic_gold');
        if (!this.nextCountData || !this.nextCountData.fansCoin) {
            // 满级
            titleLab.string = `满级`;
            tipsLab.string = `开局增加${this.fansCountLevel + 1}把武器`;
            countLab.string = '';
            levelUp.active = false;
            ic_gold.active = false;
        } else {
            titleLab.string = `下一级：${this.fansCountLevel + 1}级`;
            tipsLab.string = `开局增加${this.fansCountLevel + 1}把武器`;
            countLab.string = `消耗：${this.nextCountData.fansCoin}`;
            levelUp.active = true;
            ic_gold.active = true;

            this.fansLevelUpIcon.active = false;
            this.fansLevelUpLabel.getComponent(cc.Label).string = this.goldText;
        }
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
    },
});

kf.addModule('growUpPanel.growUpPanelUIEvent', () => growUpPanelObj);
