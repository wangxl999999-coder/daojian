var panel = kf.require('component.panel');
const constants = require('constants');
var clientEvent = kf.require('basic.clientEvent');
const localConfig = require('localConfig');
const playerData = require('playerData');
const resourceUtil = require('resourceUtil');

const trialSkinPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        spWeapon: cc.Sprite
    },
    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();
        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();
        // 皮肤试用
        this.skin = null;
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
            let ranSkinIndex = _.random(0, this.skinArrNoOwn.length - 1);
            this.skin = this.skinArrNoOwn[ranSkinIndex];
            this.updateSkinDisplay(this.skin);
        }
    },

    updateSkinDisplay(skin) {
        resourceUtil.setWeaponIcon(`weapon${skin.ID}`, this.spWeapon, ()=>{});
    },

    startFunc () {
        if(playerData.welfareConfig == 2) {
            if (playerData.superStart == 1) {
                clientEvent.dispatchEvent("showPanel", "superStartPanel", () => {
                    clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                });
            } else if(playerData.superStart == 10) {
                clientEvent.dispatchEvent("showPanel", "superStartPanel", {finalWelfare: true}, () => {
                    clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                });
            } else {
                clientEvent.dispatchEvent("showPanel", "matchingPanel", () => {
                    clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                });
            }
        } else {
            clientEvent.dispatchEvent("showPanel", "matchingPanel", () => {
                clientEvent.dispatchEvent('hidePanel', 'maskPanel');
            });
        }
        clientEvent.dispatchEvent("hidePanel", "trialSkinPanel");
    },

    onBtnGetClick () {
        playerData.skinId = this.skin.ID;
        this.startFunc();
    },

    onBtnCloseClick () {
        this.startFunc();          
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(cb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        if (cb) cb();
        this.widget['closeBtn'].active = true;
    },
});

kf.addModule('trialSkinPanel.trialSkinPanelUIEvent', () => trialSkinPanelObj);
