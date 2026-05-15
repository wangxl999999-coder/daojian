var clientEvent = kf.require('basic.clientEvent');
var panel = kf.require('component.panel');
const constants = require('constants');
const playerData = require('playerData');

const sidebarGuidePanelUIEventObj = cc.Class({
    extends: panel,

    properties: {
        btnClose: cc.Node,
        btnGoSidebar: cc.Node,
        guideText: cc.Label,
        animationNode: cc.Node,
    },

    onLoad() {
        this._super();
        this.registerWidgetEvent();
        this.registerEvent();
    },

    registerWidgetEvent() {
        this.btnClose.on('click', this.onBtnCloseClick, this);
        this.btnGoSidebar.on('click', this.onBtnGoSidebarClick, this);
    },

    registerEvent() {

    },

    onBtnCloseClick() {
        clientEvent.dispatchEvent('hidePanel', 'sidebarGuidePanel');
    },

    onBtnGoSidebarClick() {
        clientEvent.dispatchEvent('hidePanel', 'sidebarGuidePanel');
        this.openSidebar();
    },

    openSidebar() {
        if (typeof tt !== 'undefined') {
            try {
                tt.openFavoriteGuide({
                    type: 'bar',
                    success: (res) => {
                        console.log('打开侧边栏成功:', res);
                    },
                    fail: (err) => {
                        console.error('打开侧边栏失败:', err);
                    }
                });
            } catch (e) {
                console.error('调用抖音API失败:', e);
            }
        } else {
            console.log('非抖音环境，模拟打开侧边栏');
            clientEvent.dispatchEvent('showPanel', 'tipsPanel', '侧边栏功能仅在抖音小游戏中可用');
        }
    },

    show() {
        this._super();
        this.playGuideAnimation();
    },

    playGuideAnimation() {
        if (this.animationNode) {
            this.animationNode.stopAllActions();
            const seq = cc.sequence(
                cc.moveBy(0.5, cc.p(10, 0)),
                cc.moveBy(0.5, cc.p(-10, 0)),
                cc.delayTime(0.5)
            );
            this.animationNode.runAction(cc.repeatForever(seq));
        }
    },

    hide() {
        this._super();
        if (this.animationNode) {
            this.animationNode.stopAllActions();
        }
    }
});

kf.addModule('panel.sidebarGuidePanelUIEvent', () => sidebarGuidePanelUIEventObj);
