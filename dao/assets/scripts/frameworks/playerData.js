// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const configuration = require('configuration');
const localConfig = require('localConfig');
const constants = require('constants');
const utils = require('utils');

const PlayerData = cc.Class({

    start() {
        this.userId = null;
        this.account = null;
        this.password = null;
        this.level = 1;

        this.init();
    },

    init () {
        this.skinId = 1;
        this.isTest = 0;
        this.flags = {
            wheelSurf: false, // 转盘转动中
        };

        this.isNewBee = false;
        this.gameNum = 0;
        this.todayFirstLogin = false;
        this.superStart = 1; // 超级开局
        this.shareTimes = 0;
        this.dailyLoginCanGetCount = 1;    // 每日签到可领取数量
        this.playerColorIndex = 0;
        this.underReview = false; // 游戏是否在提审中
        this.needCoin = 0;    // 属性培养升级需要金币数量
        this.inGame = false; //  正在游戏中
        this.inGameOver = false; //  结算界面
        this.todayCanGet = false; //  签到今日是否可领取
        this.moreGameDot = true; // 默认主界面领金币按钮的红点显示
        this.recommendDot = true; // 默认主界面积分墙的红点显示
        this.recommendGameDotState = {}; // 积分墙游戏内的红点显示
        this.popularGameDotState = {}; // 大家在玩游戏内的红点显示

        this.bannerRefreshTimes1 = 0;
        this.bannerRefreshTimes2 = 0;
        this.bannerRefreshTimes3 = 0;
        this.bannerRefreshTimes4 = 0;
        this.bannerRefreshTimes5 = 0;
        this.bannerMaxRefreshTimes = 14;
        this.bannerConfig = 2;
        this.shareSuccessTime = 3000;
        this.shareSuccessTimeProps = 1500;

        this.showRiskyBanner = false;

        this.showDailyWelfareBanner = false;
        this.showGameOverAwardBanner = false;
        this.showLuckyWheelAwardBanner = false;
        this.showDailyLoginAwardBanner = false;
        this.showCrazySpotAwardBanner = false;

        this.showDailyWelfareRiskyBtn = false;
        this.showGameOverAwardRiskyBtn = false;
        this.showLuckyWheelAwardRiskyBtn = false;
        this.showDailyLoginAwardRiskyBtn = false;

        this.showCrazySpotPanel = false;

        this.showGameBanner = false;
        this.shareFailTips = 1;

        this.randomBanner =  false;
        this.clickAreaHeight1 = 20;
        this.clickAreaHeight2 = 25;
        this.clickAreaHeight3 = 30;
        this.clickAreaHeight4 = 35;

        this.showMatchingBanner = false;
        this.showAreaShieldBanner = false;

        this.bannerNumbers = 4;
        this.matchingBannerId = 0;
        this.riskyBannerId = 'banner1';

        this.speedUpgradeCount = 0;
        this.fansUpgradeCount = 0;
        this.sprintUpgradeCount = 0;
        this.offlineUpgradeCount = 0;
        this.accessToken = '';
        this.infiniteSprint = false;
        this.welfareConfig = 1;
        this.isFirstLoad = true;

        this.gameState = constants.GAME_STATE.NONE;
        this.vibrateOn = true;

        //战斗相关变量
        this.BoundSize = cc.v2(4500, 4500);
        this.miniGameExtraFan = 0;
        this.fadeTime = 0;
        this.protectTime = 0;

        this.fightInfo = {currScore: 0, killCnt: 0, rank: 0};
    },

    loadFromCache() {
        //读取玩家基础数据
        this.playerInfo = this.loadDataByKey(constants.LOCAL_CACHE.PLAYER);

        console.log('this.playerInfo', this.playerInfo);
        if (Object.keys(this.playerInfo).length === 0) {
            this.createPlayerInfo();
        }

        if (!this.playerInfo.hasOwnProperty('createDate')) {
            this.playerInfo.createDate = new Date();
        }

        this.gameData = this.loadDataByKey(constants.LOCAL_CACHE.GAME);

        this.settingData = this.loadDataByKey(constants.LOCAL_CACHE.SETTING);
        if (this.settingData && this.settingData.hasOwnProperty('vibrateOn')) {
            this.vibrateOn = this.settingData.vibrateOn;
        }

        this.initGameData();
    },

    initGameData () {
        if (!this.gameData || Object.keys(this.gameData).length === 0) {
            this.gameData = {};

            if (!this.gameData.weekBestScore) {
                // 本周最高分
                this.gameData.weekBestScore = 0;
            }
            if (!this.gameData.bestScore) {
                // 历史最高分
                this.gameData.bestScore = 0;
            }
            if (!this.gameData.gold) {
                // 玩家金币
                this.gameData.gold = 0;
            }
            if (!this.gameData.totalScore) {
                // 总分数，用于计算段位
                this.gameData.totalScore = 0;
            }
            if (!this.gameData.dailyWelfareGet) {
                // 每日登录礼包
                this.gameData.dailyWelfareGet = 0;
            }
            if (!this.gameData.skinData) {
                // 皮肤数据
                this.gameData.skinData = {useSkinIndex: 1, s1: constants.getSkinNum};
            }

            if (this.gameData && !this.gameData.playerDefaultSkin) {
                this.gameData.playerDefaultSkin = 0;
            }

            if (!this.gameData.playerSkins) {
                this.gameData.playerSkins = [0];
            }

            if (!this.gameData.dailyLoginGet) {
                // 每日签到是否领取 1，已领取 0 未领取
                this.gameData.dailyLoginGet = {
                    day0: 0,
                    day1: 0,
                    day2: 0,
                    day3: 0,
                    day4: 0,
                    day5: 0,
                    day6: 0
                }
            }
            if (!this.gameData.moreGameData) {
                this.gameData.moreGameData = {};
            }
            if (!this.gameData.playerLevel) {
                this.gameData.playerLevel = 1;
            }
            if (!this.gameData.sprintLevel) {
                this.gameData.sprintLevel = 1;
            }
            if (!this.gameData.fansCountLevel) {
                this.gameData.fansCountLevel = 1;
            }
            if (!this.gameData.videoTimes) {
                this.gameData.videoTimes = 0;
            }
            if (!this.gameData.taskData) {
                this.gameData.taskData = {};
            }
            if (!this.gameData.dailyLoginCount) {
                // 每日登录次数
                this.gameData.dailyLoginCount = 1;
            }
            if (!this.gameData.roundCnt) {
                this.gameData.roundCnt = 0;
            }
            if (!this.gameData.speedUpGuide) {
                this.gameData.speedUpGuide = 0;
            }
           
            this.isNewBee = true;
        } else {
            if (!this.gameData.moreGameData) {
                this.gameData.moreGameData = {};
            }
            if (!this.gameData.playerLevel) {
                this.gameData.playerLevel = 1;
            }
            if (!this.gameData.sprintLevel) {
                this.gameData.sprintLevel = 1;
            }
            if (!this.gameData.fansCountLevel) {
                this.gameData.fansCountLevel = 1;
            }
            if (!this.gameData.videoTimes) {
                this.gameData.videoTimes = 0;
            }
            if (!this.gameData.taskData) {
                this.gameData.taskData = {};
            }
            if (!this.gameData.dailyLoginCount) {
                // 每日登录次数
                this.gameData.dailyLoginCount = 0;
            }
           
            // playerData.fansCountLevel = this.gameData.fansCountLevel;
            if (this.gameData.playerLevel > 60) {
                this.gameData.playerLevel = 60;
            }
            this.skinId = this.gameData.skinData.useSkinIndex;
            this.isNewBee = false;
            if (this.gameData.lastUpdateTime) {
                let ret = utils.checkDays(this.gameData.lastUpdateTime, this.getCurrentTime());

                if (!ret.sameDay) {
                    console.log('@@@@@@@@@@@@');
                    // 更新每日登录礼包
                    this.gameData.dailyWelfareGet = 0;
                    this.continuousLogin = ret.continuousLogin;

                    this.gameData.dailyLoginCount = 1;
                } else {
                    this.gameData.dailyLoginCount++;
                }

                if (!ret.sameWeek) {
                    console.log('%%%%%%%%%%%%');
                    // 更新每日签到奖励
                    this.gameData.dailyLoginGet = {
                        day0: 0,
                        day1: 0,
                        day2: 0,
                        day3: 0,
                        day4: 0,
                        day5: 0,
                        day6: 0,
                    };
                    this.gameData.weekBestScore = 0;
                }
                
            } else {
                
            }
        }

        this.levelData = this.calculateLevel();

        this.gameData.lastUpdateTime = new Date().getTime();
    },

    checkUpdateTime () {
        if (this.gameData.lastUpdateTime) {
            let ret = utils.checkDays(this.gameData.lastUpdateTime, this.getCurrentTime());

            if (!ret.sameDay) {
                console.log('@@@@@@@@@@@@');
                // 更新每日登录礼包
                this.gameData.dailyWelfareGet = 0;
                this.continuousLogin = callback.continuousLogin;
            }

            if (!ret.sameWeek) {
                // 更新每日签到奖励
                this.gameData.dailyLoginGet = {
                    day0: 0,
                    day1: 0,
                    day2: 0,
                    day3: 0,
                    day4: 0,
                    day5: 0,
                    day6: 0,
                };
                this.gameData.weekBestScore = 0;
            }
            
        }
    },

    loadDataByKey (keyName) {
        let ret = {};
        let str = configuration.getConfigData(keyName);
        if (str) {
            try {
                ret = JSON.parse(str);
            } catch (e) {
                ret = {};
            }
        } 
        
        return ret;
    },

    saveAccount(account) {
        this.account = account;
        this.userId = account;
        configuration.setUserId(account);
        configuration.setGlobalData(constants.LOCAL_CACHE.ACCOUNT, account);
    },

    createPlayerInfo(loginData) {
        this.playerInfo = {};
        this.playerInfo.diamond = 0;
        this.playerInfo.gold = 0;
        this.playerInfo.item = 0;
        this.playerInfo.createDate = new Date(); //记录创建时间
        this.playerInfo.hasSeenGuide = false;  //是否已经看过新手引导
        this.playerInfo.unLockInfo = []; //已经解锁道具
        this.isNewBee = true; //区分新老玩家

        if (loginData) {
            for (let key in loginData) {
                this.playerInfo[key] = loginData[key];
            }
        }

        this.savePlayerInfoToLocalCache();
    },

    /**
     * 保存玩家数据
     */
    savePlayerInfoToLocalCache() {
        this.addDataVersion();
        configuration.setConfigData(constants.LOCAL_CACHE.PLAYER, JSON.stringify(this.playerInfo));
    },

    saveGameDataToLocalCache() {
        this.addDataVersion();
        configuration.setConfigData(constants.LOCAL_CACHE.GAME, JSON.stringify(this.gameData));
    },

    saveSettingDataToLocalCache() {
        this.addDataVersion();
        configuration.setConfigData(constants.LOCAL_CACHE.SETTING, JSON.stringify(this.settingData));
    },

    /**
     * 新增数据版本
     */
    addDataVersion() {
        let today = new Date().toLocaleDateString();
        let isAdd = false;
        if (this.dataVersion && typeof(this.dataVersion) === 'string') {
            var arrVersion = this.dataVersion.split('@');
            if (arrVersion.length >= 2) {
                if (arrVersion[0] === today) {
                    this.dataVersion = today + '@' + (Number(arrVersion[1])+1);
                    isAdd = true;
                }
            }
        }
        if (!isAdd) {
            this.dataVersion = today + '@1';
        }
        configuration.setConfigDataWithoutSave(constants.LOCAL_CACHE.DATA_VERSION,this.dataVersion);
    },

    /**
     * 当数据同步完毕，即被覆盖的情况下，需要将数据写入到本地缓存，以免数据丢失
     */
    saveAll() {
        configuration.setConfigDataWithoutSave(constants.LOCAL_CACHE.PLAYER, JSON.stringify(this.playerInfo));
        configuration.setConfigDataWithoutSave(constants.LOCAL_CACHE.GAME, JSON.stringify(this.gameData));
        configuration.setConfigData(constants.LOCAL_CACHE.DATA_VERSION, this.dataVersion);
    },

    /**
     * 更新用户信息
     * 例如钻石，金币，道具
     * @param {String} key
     * @param {Number} value
     */
    updatePlayerInfo(key, value) {
        let isChanged = false;
        if (this.playerInfo.hasOwnProperty(key)) {
            if (typeof value === 'number') {
                isChanged = true;
                this.playerInfo[key] += value;
                if (this.playerInfo[key] < 0) {
                    this.playerInfo[key] = 0;
                }
                //return;
            } else if (typeof value === 'boolean' || typeof value === 'string') {
                isChanged = true;
                this.playerInfo[key] = value;
            }
        }
        if (isChanged) {
            //有修改就保存到localcache
            configuration.setConfigData(constants.LOCAL_CACHE.PLAYER, JSON.stringify(this.playerInfo));
        }
    },

    /**
     * 同步服务器时间
     */
    syncServerTime (serverTime) {
        this.serverTime = serverTime;
        this.localTime = Date.now();
    },

    /**
     * 获取当前时间
     */
    getCurrentTime () {
        let diffTime = Date.now() - this.localTime;

        return this.serverTime + diffTime;
    },

    clear () {
        delete configuration.jsonData[this.userId];
        configuration.save();
    },

    calculateLevel () {
        // const constants = require('constants');
        var levelNames = ['青铜', '白银', '黄金', '白金', '钻石', '王者'];
        var baseScore = constants.LEVEL.BASE_SCORE;
        var times = constants.LEVEL.TIMES;

        var totalScore = this.gameData.totalScore;
        // var totalScore = 4060;
        var needScore = 0;
        var starProgress = 0;
        var level = 0;
        while (1) {
            var nextScore = baseScore * Math.pow(times, level);
            totalScore -= nextScore;
            if (totalScore >= 0) {
                level++;
            } else {
                needScore = Math.ceil(Math.abs(totalScore));
                starProgress = 1 - (needScore / nextScore);
                break;
            }
        }

        var levelIndex = Math.floor(level / 5) > 5 ? 5 : Math.floor(level / 5);
        var levelStar = level % 5;
        return {
            levelIndex: levelIndex, levelStar: levelStar, levelName: levelNames[levelIndex],
            starProgress: starProgress, needScore: needScore
        };

    },

    getAILevel () {
        if (!this.gameData.AILevel) {
            return 1;
        }

        return this.gameData.AILevel;
    },

    AILevelUp() {
        if (!this.gameData.AILevel) {
            this.gameData.AILevel = 1;
        }
        this.gameData.AILevel += 2;
        let alLevelInfoArr = localConfig.getTableArr('AILevel');
        if (alLevelInfoArr.length > 0) {
            let maxLv = alLevelInfoArr[alLevelInfoArr.length - 1].level;
            if (this.gameData.AILevel > maxLv) {
                this.gameData.AILevel = maxLv;
            }
        }
        
        this.saveGameDataToLocalCache();
    },

    AILevelDown() {
        if (!this.gameData.AILevel) {
            this.gameData.AILevel = 1;
        }

        this.gameData.AILevel--;
        if (this.gameData.AILevel < 1) {
            this.gameData.AILevel = 1;
        }
        
        this.saveGameDataToLocalCache();
    },


    updateTaskData (taskId, data) {
        let ret = null;
        
        // 未获得该皮肤
        let arrSkin = [];
        this.skinArr = localConfig.getTableArr('skin');
        for (let idx = 0; idx < this.skinArr.length; idx++) {
            let skin = this.skinArr[idx];

            if (skin.type === taskId) {
                if (this.gameData.skinData && this.gameData.skinData[`s${skin.ID}`] !== constants.getSkinNum) {
                    arrSkin.push(skin);
                }
            }
        }

        if (arrSkin.length > 0) {
            if (!this.gameData.taskData[`s${taskId}`]) {
                this.gameData.taskData[`s${taskId}`] = 0;
            }
            if (data || data === 0) {
                this.gameData.taskData[`s${taskId}`] = data;
            } else {
                this.gameData.taskData[`s${taskId}`]++;
            }

            arrSkin.forEach((skin)=>{
                if (this.gameData.taskData[`s${taskId}`] >= skin.num) {
                    this.gameData.skinData[`s${skin.ID}`] = constants.getSkinNum;
                    ret = skin;
                }
            });
        }

        this.saveGameDataToLocalCache();

        return ret;
    },

    updateRoundCnt (cnt) {
        this.gameData.roundCnt = cnt;
        this.saveGameDataToLocalCache();
    },

    finishSpeedGuide () {
        this.gameData.speedUpGuide = 1;
        this.saveGameDataToLocalCache();
    },

    savePlayerName (name) {
        this.gameData.playerName = name;
        this.saveGameDataToLocalCache();
    },

    enableVibrate (isEnable) {
        if (!this.settingData) {
            this.settingData = {};
        }

        this.vibrateOn = isEnable;
        this.settingData.vibrateOn = isEnable;
        this.saveSettingDataToLocalCache();
    },

    updateOfflineTime (time) {
        this.gameData.dageOfflineTime = time;
        this.saveGameDataToLocalCache();
    },

    markDailyWelfareGet () {
        this.gameData.dailyWelfareGet = 1;
        this.saveGameDataToLocalCache();
    },

    markDailyLoginGet (day) {
        this.gameData.dailyLoginGet[`day${day}`] = 1;
        this.saveGameDataToLocalCache();
    },
});

var shareData = new PlayerData();
shareData.start();
module.exports = shareData;