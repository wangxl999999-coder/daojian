// 每个界面的基础类
const panel = kf.require('component.panel');

const TIP_MAX_NUM = 5;
const SAVE_MAX_COUNT = 10;

const tipsPanel = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        tipsSubPanel: cc.Prefab,
    },

    // use this for initialization
    onLoad  () {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();


        this.upTipArr = [];
        this.tipIndex = 0;
        this.lastTab = null;

        for (let i = 0; i < TIP_MAX_NUM; i++) {
            const upSubPanel = cc.instantiate(this.tipsSubPanel);
            this.node.addChild(upSubPanel);
            upSubPanel.active = false;
            this.upTipArr[i] = upSubPanel;
        }

        this.tipMsgBak = [];
        this.isPlay = false;
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent () {

    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent () {

    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show (txt) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        this.tipMsgBak.push(txt);

        // 超过最大保存数量则删除前面的数值
        const length = this.tipMsgBak.length - SAVE_MAX_COUNT;
        if (length > 0) {
            this.tipMsgBak.splice(1, length);
        }

        if (!this.isPlay) {
            this.isPlay = true;
            this.lastTab = null;
            this.newTab();
        }
    },

    newTab () {
        if (this.tipMsgBak.length < 1) {
            this.isPlay = false;
            this.lastTab = null;
            return;
        }

        const curTxt = this.tipMsgBak.shift();

        if (!curTxt) {
            this.newTab();
            return;
        }

        // 有上一个
        if (this.lastTab) {
            const action = cc.moveBy(0.3, cc.v2(0, 50));
            this.lastTab.stopAllActions();
            this.lastTab.getComponent('tipsSubPanelUIEvent').hideTxt();
            this.lastTab.runAction(action);
        }

        this.upTipArr[this.tipIndex].active = true;
        this.upTipArr[this.tipIndex].getComponent('tipsSubPanelUIEvent').setData(curTxt);

        this.lastTab = this.upTipArr[this.tipIndex];

        this.tipIndex++;
        if (this.tipIndex >= TIP_MAX_NUM) {
            this.tipIndex = 0;
        }

        this.newTabTimeOut = setTimeout(() => {
            this.newTab();
        }, 700);
    },

    hide () {
        if (this.newTabTimeOut) {
            clearTimeout(this.newTabTimeOut);
            this.newTabTimeOut = null;
        }
    },
});

kf.addModule('tipsPanel.tipsPanelUIEvent', () => tipsPanel);
