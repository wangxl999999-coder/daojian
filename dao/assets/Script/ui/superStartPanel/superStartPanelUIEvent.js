var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const pool = kf.require('basic.pool');
const localConfig = require('localConfig');
const playerData = require('playerData');
const superStartPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        swordPrefab: cc.Prefab,
        spShareIcon: cc.Sprite,
        nodeSwordGroup: cc.Node,
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        this.skinArr = localConfig.getTableArr('skin');

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();
    },

    onBtnCloseClick () {
        clientEvent.dispatchEvent("showPanel", "matchingPanel");
        clientEvent.dispatchEvent("hidePanel", "superStartPanel");          
    },

    showReward () {
        if (playerData.superStart === 1) {
            clientEvent.dispatchEvent("showPanel", "matchingPanel");
            clientEvent.dispatchEvent("hidePanel", "superStartPanel");
        } else if (playerData.superStart === 10) {
            playerData.superStart = 20;
            clientEvent.dispatchEvent("showPanel", "matchingPanel");
            clientEvent.dispatchEvent("hidePanel", "superStartPanel");
        }
    },

    onBtnShareClick () {
        this.showReward();
    },

    createSword(superStartNum) { // 主界面刀剑转动逻辑 (todo 皮肤直接写死 建议游戏里做关联)
        this.widget['allSword'].removeAllChildren();
        const theSwordData = this.skinArr[playerData.skinId - 1];
        const swordNum = theSwordData.fansAddition; // 增加的刀剑数量
        cc.loader.loadRes('mainSkins/' + `skin_${playerData.gameData.playerDefaultSkin + 1}`, cc.Prefab, (err, skinPrefab) => {
            if (!err) {
                let selfSwordNode = cc.instantiate(skinPrefab);
                this.curSwordSp = selfSwordNode.getChildByName('image').getComponent(cc.Sprite).spriteFrame; // 当前显示的刀剑
                let fanNode;
                // const allSwordNum = swordNum + 1 + superStartNum; （todo 目前超级开局+10、+20太多了效果不好，不予显示，建议询问策划）
                const allSwordNum = 10;
                for (let i = 0; i < allSwordNum; i++) {
                    fanNode = pool.getPrefab(this.swordPrefab.name);
                    this.widget['allSword'].addChild(fanNode);
                    const swordEffectLogic = fanNode.getComponent('swordEffectLogic');
                    swordEffectLogic.setData(allSwordNum, i);
                    fanNode.getComponent(cc.Sprite).spriteFrame = this.curSwordSp; // 赋值新刀剑素材
                }
            }
        });
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(data, cb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        if(cb) cb();
         clientEvent.dispatchEvent('hidePanel', 'maskPanel');
        this.widget['closeBtn'].active = true;

        if(data && data.finalWelfare) {
            this.finalWelfare = true;
            this.widget["frame"]["image"].getComponent(cc.Animation).play();
        } else {
            this.finalWelfare = false;
        }
    },
});

kf.addModule('superStartPanel.superStartPanelUIEvent', () => superStartPanelObj);
