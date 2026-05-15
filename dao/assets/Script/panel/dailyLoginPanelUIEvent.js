var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const constants = require('constants');
const localConfig = require('localConfig');
const playerData = require('playerData');

const dailyLoginPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        goldImg: cc.SpriteFrame,
        defaultSkinImg: cc.SpriteFrame,
        dragonWarriorSkinImg: cc.SpriteFrame,

        arrLoginDay: [cc.Node]
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        this.todayIndex = new Date().getDay();
        // this.todayIndex = 5;

        this.dailyLoginArr = localConfig.getTableArr('dailyLogin');
        this.skinArr = localConfig.getTableArr('skin');
    },

    initDailyLogin() {
        // 生成每日登录内容
        for (const awards of this.dailyLoginArr) {
            switch (awards.type) {
                case constants.props.gold: // 金币
                    this.arrLoginDay[Number(awards.ID)]['img'].getComponent(cc.Sprite)
                        .spriteFrame = this.goldImg;
                        this.arrLoginDay[Number(awards.ID)]['desc'].getComponent(cc.Label)
                        .string = `${awards.show}`;

                        this.arrLoginDay[Number(awards.ID)]['img'].scale = 0.7;
                    break;
                case constants.props.skin: // 皮肤
                    if(awards.prizeId == 2) {
                        this.arrLoginDay[Number(awards.ID)]['img'].getComponent(cc.Sprite)
                            .spriteFrame = this.defaultSkinImg;
                        this.arrLoginDay[Number(awards.ID)]['img'].angle = -45;
                        // this.arrLoginDay[Number(awards.ID)]['img'].color = cc.color('#FF4655');
                        // this.arrLoginDay[Number(awards.ID)]['img'].scale = 0.5;
                    } else if (awards.prizeId == 9) {
                        this.arrLoginDay[Number(awards.ID)]['img'].getComponent(cc.Sprite)
                            .spriteFrame = this.dragonWarriorSkinImg;

                        this.arrLoginDay[Number(awards.ID)]['img'].angle = -90;
                        this.arrLoginDay[Number(awards.ID)]['img'].scale = 1.2;
                    }

                    this.arrLoginDay[Number(awards.ID)]['desc'].getComponent(cc.Label)
                        .string = `${awards.show}`;
                    break;
                case constants.props.sprint: // 冲刺升级
                    this.arrLoginDay[Number(awards.ID)]['img'].getComponent(cc.Sprite)
                        .spriteFrame = this.sprintImg;
                    this.arrLoginDay[Number(awards.ID)]['desc'].getComponent(cc.Label)
                        .string = `${awards.show}`;
                    this.arrLoginDay[Number(awards.ID)]['img'].scale = 0.9;
                    break;
                case constants.props.giftBag: // 大礼包
                    //  皮肤未开放，都显示金币
                    this.arrLoginDay[Number(awards.ID)]['img1'].getComponent(cc.Sprite)
                        .spriteFrame = this.goldImg;
                    this.arrLoginDay[Number(awards.ID)]['desc1'].getComponent(cc.Label)
                        .string = '+1000';
                    this.arrLoginDay[Number(awards.ID)]['img1'].x = 0;
                    this.arrLoginDay[Number(awards.ID)]['desc1'].x = 0;
                    this.arrLoginDay[Number(awards.ID)]['img2'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['desc2'].active = false;
                    break;
                default:
                    cc.error('奖品类型错误');
            }

            this.arrLoginDay[Number(awards.ID)]['getBtn'].on("click", function() {
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
                if(awards.ID > this.todayIndex || (awards.ID === 0 && this.todayIndex != 0)) {
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', '还不能领取哦！');
                    return;
                }
                this.getAward(awards);
                playerData.markDailyLoginGet(awards.ID);
                this.arrLoginDay[Number(awards.ID)]['getBtn'].active = false;
                this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].active = false;
                this.arrLoginDay[Number(awards.ID)]['gotBtn'].active = true;
                this.arrLoginDay[Number(awards.ID)]['bg']['light'].active = false;
                if(playerData.dailyLoginCanGetCount == 0) {
                    this.hideThisPanel();
                }
            }.bind(this));

            this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].on("click", function() {
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
                this.getAward(awards);
                playerData.markDailyLoginGet(awards.ID);
                this.arrLoginDay[Number(awards.ID)]['getBtn'].active = false;
                this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].active = false;
                this.arrLoginDay[Number(awards.ID)]['gotBtn'].active = true;
                if(playerData.dailyLoginCanGetCount == 0) {
                    this.hideThisPanel();
                }
            }.bind(this));

            this.arrLoginDay[Number(awards.ID)]['gotBtn'].on("click", function() {
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', '已经领过啦！');
            }.bind(this));
        }
    },

    getAward(awards) {
        playerData.dailyLoginCanGetCount--;
        switch (awards.type) {
            case constants.props.gold: // 金币
                clientEvent.dispatchEvent("showPanel", "getAwardPanel",
                    {
                        from: constants.getAwardFrom.dailyLogin,
                        type: constants.props.gold,
                        num: awards.num,
                        title: '恭喜获得',
                        desc: awards.show
                    });
                break;
            case constants.props.skin: // 皮肤
                if(playerData.gameData.skinData[`s${awards.prizeId}`] == constants.getSkinNum) {
                    //  皮肤已经，转换为金币
                    playerData.gameData.gold += awards.exchangeGold;
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', `您已经获得该皮肤，自动转换成${awards.exchangeGold}金币`);

                } else {
                    clientEvent.dispatchEvent('showPanel', 'getSkinPanel', this.skinArr[awards.prizeId - 1]);
                    playerData.gameData.skinData[`s${awards.prizeId}`] = constants.getSkinNum;
                    playerData.isRefreshSkinData = true; // 是否需要更新皮肤数据
                }
                break;
            case constants.props.sprint: // 冲刺升级
                this.nextSprintData = localConfig.queryByID('growUpLevel', playerData.gameData.sprintLevel + 1);
                if(!this.nextSprintData) {
                    //  冲刺已满级，转换为金币
                    playerData.gameData.gold += awards.exchangeGold;
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', `您已经超神了，自动转换成${awards.exchangeGold}金币`);
                } else {
                    playerData.gameData.sprintLevel++;
                    clientEvent.dispatchEvent('showPanel', 'tipsPanel', '升级成功');
                }
                break;
            case constants.props.giftBag: // 大礼包
                clientEvent.dispatchEvent("showPanel", "getAwardPanel",
                    {
                        from: constants.getAwardFrom.dailyLogin,
                        type: constants.props.giftBag,
                        num: 1000,
                        title: '恭喜获得',
                        desc: '金币：1000'
                    });
                break;
            default:
                cc.error('奖品类型错误');
        }
    },

    updateGetState() {
        this.dailyLoginArr = localConfig.getTableArr('dailyLogin');
        for (const awards of this.dailyLoginArr) {
            if(playerData.gameData.dailyLoginGet[`day${awards.ID}`]) {
                // 已领取
                this.arrLoginDay[Number(awards.ID)]['getBtn'].active = false;
                this.arrLoginDay[Number(awards.ID)]['gotBtn'].active = true;
                this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].active = false;
                this.arrLoginDay[Number(awards.ID)]['bg']['light'].active = false;
            } else {
                // 未领取
                if(awards.ID === this.todayIndex) {
                    // 今日
                    playerData.dailyLoginCanGetCount++;
                    playerData.todayCanGet = true;
                    this.arrLoginDay[Number(awards.ID)]['getBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['gotBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['bg']['light'].active = true;
                    this.arrLoginDay[Number(awards.ID)]['bg']['light'].getComponent(cc.Animation).play();

                    this.widget['closeBtn'].active = false;
                    this.widget['getBtn'].active = true;
                } else if ((awards.ID < this.todayIndex && this.todayIndex != 0 && awards.ID != 0)
                || (awards.ID > this.todayIndex && this.todayIndex === 0)) {
                    this.arrLoginDay[Number(awards.ID)]['getBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['gotBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].active = true;
                } else {
                    // 以后
                    this.arrLoginDay[Number(awards.ID)]['getBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['gotBtn'].active = false;
                    this.arrLoginDay[Number(awards.ID)]['getAgainBtn'].active = false;
                }
            }
        }
    },

    onBtnCloseClick () {
        this.hideThisPanel();
    },

    onBtnGetClick () {
        this.getTodayAward(false);
    },

    getTodayAward(doubleGet) {
        if (!this.isValid) {
            return;
        }
        var todayAward = this.dailyLoginArr[this.todayIndex];
        if(todayAward.type != constants.props.gold) {
            this.getAward(todayAward);
        } else {
            this.num = todayAward.num;
            if(doubleGet) {
                this.num *= 2;
            }
            clientEvent.dispatchEvent('showPanel', 'tipsPanel', `获得${this.num}金币`);
            playerData.todayCanGet = false;
            playerData.gameData.gold += this.num;
            playerData.dailyLoginCanGetCount--;
        }

        playerData.markDailyLoginGet(this.todayIndex);
        
        this.arrLoginDay[Number(this.todayIndex)]['getBtn'].active = false;
        this.arrLoginDay[Number(this.todayIndex)]['getAgainBtn'].active = false;
        this.arrLoginDay[Number(this.todayIndex)]['gotBtn'].active = true;
        this.arrLoginDay[Number(this.todayIndex)]['bg']['light'].active = false;
        this.widget['getBtn'].active = false;
        this.widget['closeBtn'].active = true;
        if(playerData.dailyLoginCanGetCount == 0) {
            this.hideThisPanel();
        }
    },

    hideThisPanel() {
        if(this.skinCb) {
            this.skinCb();
        }
        clientEvent.dispatchEvent('updateUserDataDisplay');
        clientEvent.dispatchEvent("hidePanel", "dailyLoginPanel");
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(data, cb, skinCb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        if (cb) cb();
        this.skinCb = skinCb;

        if(data && data.showProperty) {
            this.showProperty = data.showProperty;
        }
        this.widget['getBtn'].active = false;
        playerData.dailyLoginCanGetCount = 0;
        this.updateGetState();

        setTimeout(() => {
            this.initDailyLogin();
        }, 0);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('dailyLoginPanel.dailyLoginPanelUIEvent', () => dailyLoginPanelObj);
