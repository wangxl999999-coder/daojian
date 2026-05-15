var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const constants = require('constants');
const playerData = require('playerData');
const gameLogic = require('gameLogic');

var getAwardPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        goldImg: cc.SpriteFrame,
        skinImg: cc.SpriteFrame,
        giftBagImg: cc.SpriteFrame,

        nodeGift: cc.Node,
        nodeLight: cc.Node,
        nodeItem: cc.Node
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        this.getBtnOriY = this.widget['getBtn'].y;
        // 狂点点击次数记录
        this.crazySpotTimes = 5;
        // 用户实际点击的次数
        this.crazySpotClickTimes = 0;
        this.crazyProgressBar = this.widget['crazyNode']['crazyProgress'].getComponent(cc.ProgressBar);
    },

    onDisable () {
       
    },

    onBtnGetClick () {
        this.getAward();
        this.nodeItem.active = true;
        this.nodeLight.active = true;
        //  神秘大礼直接刷新界面显示，不关闭重新打开
        if(this.from !== constants.getAwardFrom.secretGift) {
            if (this.from === constants.getAwardFrom.dailyWelfare && !playerData.underReview) {
                gameLogic.offLineReward();
            }
            clientEvent.dispatchEvent("hidePanel", "getAwardPanel");
        }
    },

    showClickGift () {
        if (this.isPlayingGiftOpen) {
            return;
        }

        this.isPlayingGiftOpen = true;
        let ani = this.nodeGift.getComponent(cc.Animation);
        ani.play('giftClick');
        ani.once('finished', ()=>{
            this.isPlayingGiftOpen = false;
            ani.play('giftIdle');
        });
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        this.widget['closeBtn'].on("click", function() {
            if (this.closeBtnTimer) {
                clearTimeout(this.closeBtnTimer);
                this.closeBtnTimer = null;
            }
            this.crazySpotClickTimes = 0;
            this.widget['crazyNode'].active = false;
            if (this.crazyProgressInterVal) {
                clearInterval(this.crazyProgressInterVal);
                this.crazyProgressInterVal = null;
            }
            this.widget['getBtn'].y = this.getBtnOriY;
            this.widget['getBtn'].active = true;
            this.widget['desc'].active = true;
            this.nodeItem.active = true;
            this.nodeLight.active = true;

            clientEvent.dispatchEvent("hidePanel", "getAwardPanel");
            clientEvent.dispatchEvent("showPanel", 'gameOverPanel');
        }.bind(this));

    },

    setCloseBtnTimer() {
        if (this.closeBtnTimer) {
            clearTimeout(this.closeBtnTimer);
            this.closeBtnTimer = null;
        }
        this.closeBtnTimer = setTimeout(function() {
            if (!this.isValid) {
                return;
            }
            this.widget['closeBtn'].active = true;
            clearTimeout(this.closeBtnTimer);
            this.closeBtnTimer = null;
        }.bind(this), 5000);
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    getAward() {
        switch (this.type) {
            case constants.props.gold: // 金币
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', `获得${this.num}金币`);
                playerData.gameData.gold += this.num;
                if (this.from === constants.getAwardFrom.dailyWelfare) {
                    playerData.markDailyWelfareGet();
                }
                break;
            case constants.props.skin: // 皮肤碎片
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', `获得皮肤碎片X${this.num}`);
                break;
            case constants.props.giftBag: // 大礼包
                // clientEvent.dispatchEvent('showPanel', 'tipsPanel', '获得大礼包');
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', `获得${this.num}金币`);
                playerData.gameData.gold += this.num;
                break;
            default:
                cc.error('奖品类型错误');
        }
        clientEvent.dispatchEvent('updateUserDataDisplay');
        if (this.from === constants.getAwardFrom.dailyLogin) {
            //  每日签到界面关闭的时候调用一次保存数据
            return;
        } else if (this.from === constants.getAwardFrom.gameOver) {
            playerData.gameNum++;
            clientEvent.dispatchEvent("showPanel", 'gameOverPanel');
            return;
        } else if (this.from === constants.getAwardFrom.secretGift) {
            clientEvent.dispatchEvent("hidePanel", "getAwardPanel");
            clientEvent.dispatchEvent("showPanel", 'gameOverPanel');
            return;
        }
        
    },

    /**
     *
     * @param {*} data 显示数据
     */
    initUI(data) {
        this.from = data.from;
        this.type = data.type;
        this.num = data.num;

        this.title = data.title;
        var desc = data.desc;
        this.widget['title']['label'].getComponent(cc.Label).string = this.title;
        this.widget['desc'].getComponent(cc.Label).string = desc;

        if(this.type === constants.props.gold) {
            this.nodeItem.getComponent(cc.Sprite).spriteFrame = this.goldImg;
        } else if (this.type === constants.props.skin) {
            this.nodeItem.getComponent(cc.Sprite).spriteFrame = this.skinImg;
        } else if (this.type === constants.props.giftBag) {
            this.nodeItem.getComponent(cc.Sprite).spriteFrame = this.goldImg;
        }

        this.changeBtnPosition = false;
        switch (this.from) {
            case constants.getAwardFrom.dailyWelfare:
                if(playerData.showDailyWelfareRiskyBtn) {
                    this.changeBtnPosition = true;
                }
                // this.shareId = constants.shareId.dailyWelfare;
                this.shareFun = constants.SHARE_FUNCTION.DAILY_WELFARE;
                break;
            case constants.getAwardFrom.dailyLogin:
                if(playerData.showDailyLoginAwardRiskyBtn) {
                    this.changeBtnPosition = true;
                }
                // this.shareId = constants.shareId.dailyLogin;
                this.shareFun = constants.SHARE_FUNCTION.DAILY_LOGIN;
                break;
            case constants.getAwardFrom.luckyWheel:
                if(playerData.showLuckyWheelAwardRiskyBtn) {
                    this.changeBtnPosition = true;
                }
                // this.shareId = constants.shareId.luckyWheel;
                this.shareFun = constants.SHARE_FUNCTION.LUCKY_WHEEL;
                break;
            case constants.getAwardFrom.gameOver:
                if(playerData.showGameOverAwardRiskyBtn) {
                    this.changeBtnPosition = true;
                }
                // this.shareId = constants.shareId.gameOver;
                this.shareFun = constants.SHARE_FUNCTION.GAME_OVER;
                break;
            case constants.getAwardFrom.secretGift:
                this.changeBtnPosition = false;
                this.shareFun = constants.SHARE_FUNCTION.SECRET_GIFT;
                break;
            default:
                cc.error('类型错误');
        }

        this.showAdTime = 0;
        if(this.changeBtnPosition) {
            this.showAdTime = 1000;
            this.widget['getBtn'].y -= 200;
        } else {
            this.widget['getBtn'].active = true;
        }
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(data, cb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        // this.data = data;
        if (cb) cb();

        this.isPlayingGiftOpen = false;

        playerData.isOffline = data.isOffline;
        if (this.crazyProgressInterVal) {
            clearInterval(this.crazyProgressInterVal);
            this.crazyProgressInterVal = null;
        }
        this.nodeGift.active = false;
        this.widget['closeBtn'].active = false;
        this.initUI(data);
    },

    hide () {
        this._super();
    },
});

kf.addModule('getAwardPanel.getAwardPanelUIEvent', () => getAwardPanelObj);
