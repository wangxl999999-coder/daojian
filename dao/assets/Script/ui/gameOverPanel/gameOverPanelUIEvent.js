var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const constants = require('constants');
const localConfig = require('localConfig');
const playerData = require('playerData');
const gameLogic = require('gameLogic');

const gameOverPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        item: cc.Prefab,
        nodeToggle: cc.Node,
        nodeToggleTxt: cc.Node
    },

    // use this for initialization
    onLoad() {
        if (this.widget) {
            return;
        }
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();
        this.durT = 0;
        this.direction = 1; // 猜你喜欢的移动方向
        this.showMoreMaxCd = 3;
        this.showMoreCurCd = this.showMoreMaxCd;

        this.skinArr = localConfig.getTableArr('skin');

        this.widget["score"].getComponent(cc.Label).string = playerData.fightInfo.currScore;
        this.widget["currentRank"].getComponent(cc.Label).string = "当前排名: " + playerData.fightInfo.rank;
        this.widget["killCount"].getComponent(cc.Label).string = "击败玩家数: " + playerData.fightInfo.killCnt;
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        this.widget["bg"].on("click", function() {
            return;
        }.bind(this));

        this.widget["homeBtn"]["clickArea"].on("click", function() {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
            playerData.inGameOver = false;
            clientEvent.dispatchEvent("hidePanel", "gameOverPanel");
            clientEvent.dispatchEvent("showPanel", "mainPanel", { fromGameOver: true });
        }.bind(this));

        this.widget['shareBtn'].on("click", function() {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
            if (this.superStart) {
                playerData.superStart = 10;
            }

            clientEvent.dispatchEvent("showPanel", "matchingPanel");
            clientEvent.dispatchEvent("hidePanel", "gameOverPanel");
        }.bind(this));

        this.widget['toggle'].on('toggle', function(toggle) {
            if(toggle.isChecked) {
                this.superStart = true;
            } else {
                this.superStart = false;
            }
        }.bind(this));
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
        this.registerClientEvent('updateUserDataDisplay', () => {
            
        });
    },

    gameOver() {
        var goldArr = [200, 150, 100, 50, 20, 20, 20, 20];
        var goldNum = 30;
        if (playerData.fightInfo.rank <= goldArr.length) {
            goldNum = goldArr[playerData.fightInfo.rank - 1];
        }
        playerData.gameData.gold += goldNum;
        clientEvent.dispatchEvent('showPanel', 'tipsPanel', `获得${goldNum}金币`);
        playerData.superStart = 1;
        playerData.gameData.totalScore = (playerData.gameData.totalScore || 0) + playerData.fightInfo.currScore;
        //  本局分数是否大于本周最高分和历史最高分
        if (playerData.fightInfo.currScore > playerData.gameData.weekBestScore) {
            playerData.gameData.weekBestScore = playerData.fightInfo.currScore;
            if (playerData.fightInfo.currScore > playerData.gameData.bestScore) {
                playerData.gameData.bestScore = playerData.fightInfo.currScore;
            }
        }

        // 更新每日任务统计
        this.updateDailyTaskStats();
    },

    updateDailyTaskStats() {
        // 今日游戏次数
        playerData.todayPlayCount = (playerData.todayPlayCount || 0) + 1;
        
        // 今日获得第一名次数
        let rank = playerData.fightInfo.rank;
        if (playerData.killLastAi) {
            rank = 1;
        }
        if (rank === 1) {
            playerData.todayWinCount = (playerData.todayWinCount || 0) + 1;
        }

        // 检查是否是新的一天，重置每日任务
        const today = new Date().toDateString();
        if (playerData.lastLoginDate !== today) {
            this.resetDailyTasks();
            playerData.lastLoginDate = today;
        }
    },

    resetDailyTasks() {
        playerData.todayPlayCount = 0;
        playerData.todayWinCount = 0;
        playerData.todayWatchAdCount = 0;
        playerData.dailyLoginCompleted = false;
        playerData.dailyLoginClaimed = false;
        playerData.play3GameClaimed = false;
        playerData.watchAdClaimed = false;
        playerData.reachTop1Claimed = false;
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(txt) {
        if (!this.widget) {
            this.onLoad();
        }
        
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        this.superStart = true;
        this.widget['toggle'].getComponent(cc.Toggle).isChecked = true;

        if(playerData.underReview) {
            var imageUrl = `/singleColor`;
            cc.loader.loadRes(imageUrl, cc.SpriteFrame, (err, spriteframe) => {
                this.widget['bg'].getComponent(cc.Sprite).spriteFrame = spriteframe;
            });
            this.widget['bg'].color = cc.color('#00D8FF');

            this.superStart = false;
            this.widget['toggle'].active = false;
            this.widget['toggleLabel'].active = false;
        }

        this.randomIndex = 0;
        this.widget["homeBtn"]["clickArea"].height = playerData.clickAreaHeight2;
        playerData.inGame = false;
        playerData.inGameOver = true;
        this.widget['score'].getComponent(cc.Label).string = playerData.fightInfo.currScore;
        let rank = playerData.fightInfo.rank;
        if (playerData.killLastAi) {
            rank = 1;
        }
        this.widget['currentRank'].getComponent(cc.Label).string = `当局排名：${rank}`;
        this.widget['killCount'].getComponent(cc.Label).string = `击败玩家数：${playerData.fightInfo.killCnt}`;
        this.gameOver();

        gameLogic.updateTaskData(constants.taskId.game);
        gameLogic.updateTaskData(constants.taskId.oneGameFans, playerData.fightInfo.currScore);
        gameLogic.updateTaskData(constants.taskId.oneGamePlayer, playerData.fightInfo.killCnt);
        if(playerData.fightInfo.rank == 1) {
            gameLogic.updateTaskData(constants.taskId.continuousNo1);
        } else {
            gameLogic.updateTaskData(constants.taskId.continuousNo1, 0);
        }

        // 更新界面红点
        clientEvent.dispatchEvent('updateUserDataDisplay');
    },

    //  获取每周一的天数
    getCurrentDay: function() {
        var dayIndex;
        if (new Date().getDay() === 0) {
            dayIndex = 7;
        } else {
            dayIndex = new Date().getDay();
        }

        var loginTime = parseInt(new Date().getTime()/(3600 * 24 * 1000)) - dayIndex + 1;
        return loginTime;
    },
});

kf.addModule('gameOverPanel.gameOverPanelUIEvent', () => gameOverPanelObj);
