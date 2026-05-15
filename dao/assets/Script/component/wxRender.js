/**
 * @description 微信子域控件
 * @author super
 * 子域设计大小中不能选择适配宽或高
 */
const clientEvent = kf.require('basic.clientEvent');
cc.Class({
    extends: cc.Component,

    properties: {
        wxPanelName: {
            default: [],
            type: [cc.String],
            displayName: '子域界面名称',
            tooltip: '子域展示界面名称，需要与主域对应界面的名称一致',
        },
    },

    editor: {
        // https://docs.cocos.com/creator/manual/zh/scripting/reference/class.html#type
        disallowMultiple: true,
        menu: 'Component/wxRender',
        help: 'http://doc.anyh5.com/more/ditch/wechat/newWx.html',
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.registerEvent();
        this.wxUpdateTimer = null; // 子域刷新的定时器
        this.curFrameRate = 10; // 默认子域刷新帧率
        this.node.addComponent(cc.WXSubContextView); // 添加子域显示组件
        this.panelCenter = kf.require('basic.panelCenter');
        this.initWxRender(this.node);
    },

    // update (dt) {},

    registerEvent () {
        clientEvent.on('showPanelOver', (newPanelName, ...param) => {
            for (const panel of this.panelCenter.subPanelStack) {
                if (panel.name === newPanelName) {
                    const len = this.panelCenter.subPanelStack.length;
                    const oldPanel = this.panelCenter.subPanelStack[len - 2];
                    this.onPanelChange(oldPanel ? oldPanel.name : '', newPanelName, param);
                }
            }
        });
        clientEvent.on('hidePanelOver', (oldPanelName) => {
            const len = this.panelCenter.subPanelStack.length;
            const newPanel = this.panelCenter.subPanelStack[len - 1];
            this.onPanelChange(oldPanelName, newPanel ? newPanel.name : '');
        });
        clientEvent.on('wxSubPanelStop', () => {
            if (!window.wx) {
                return;
            }
            this.wxSubPanelStop();
        });
        clientEvent.on('wxSubPanelStart', (frameRate) => {
            if (!window.wx) {
                return;
            }
            this.wxSubPanelStart(frameRate);
        });

        clientEvent.on('dispatchWxEvent', (eventName, ...param) => {
            this.sendToWxSubContent(eventName, param);
        });
    },

    /**
     * 初始化 WxRender
     * @param WXSubContext
     */
    initWxRender (WXSubContext) {
        this.WXSubContext = WXSubContext.getComponent(cc.WXSubContextView); // 包含WXSubContextView
        this.WXSubContext.enabled = false;
    },

    /**
     * 发送事件到子域中
     * @param eventName 事件名
     * @param param 参数
     * @param type 消息格式类型
     */
    sendToWxSubContent (eventName, param, type) {
        if (!window.wx) {
            return;
        }
        cc.log(`dispatchWxEvent: ${eventName} ${param}`);
        if (!param) {
            param = [];
        }
        const sendMsg = { param };
        if (type) {
            sendMsg.msg = eventName;
        } else {
            sendMsg.event = eventName;
        }
        window.wx.getOpenDataContext().postMessage(sendMsg);
    },

    /**
     * 监听界面显示与隐藏，只对模态框界面进行操作
     * @param oldPanelName 旧界面名称
     * @param newPanelName 新界面名称
     * @param param 显示界面透传，将主域界面panel参数传到子域
     */
    onPanelChange (oldPanelName, newPanelName, param) {
        console.log('onPanelChange: ', oldPanelName, newPanelName);
        if (this.wxPanelName.indexOf(oldPanelName) !== -1) { // 旧界面有子域
            this.sendToWxSubContent('hidePanel', [oldPanelName]);
        }
        if (newPanelName) {
            if (this.wxPanelName.indexOf(newPanelName) !== -1) { // 新界面有子域
                let args = [];
                if (param) {
                    args = [newPanelName, ...param];
                } else {
                    args = [newPanelName];
                }
                this.sendToWxSubContent('showPanel', args);
                this.wxSubPanelStart(this.curFrameRate);
            } else {
                this.wxSubPanelStop();
            }
        }
    },

    /**
     * 对子域进行暂停操作
     */
    wxSubPanelStop () {
        // 1. 设置子域帧率
        this._setWxSubPanelFrameRate(0);
        // 2. 关闭子域显示
        this.WXSubContext.enable = false;
        this.node.active = false;
    },

    /**
     * 开启子域显示
     * @param frameRate 设定帧率
     */
    wxSubPanelStart (frameRate) {
        if (!frameRate) {
            frameRate = 10; // 设置默认的值
        }

        // 1. 打开子域显示
        this.WXSubContext.enable = false;
        this.node.active = true;
        // 2. 按照帧率开启
        this._setWxSubPanelFrameRate(frameRate);
    },

    /**
     * 设置子域帧率，并同步主域帧率
     * @param frameRate
     */
    _setWxSubPanelFrameRate (frameRate) {
        if (frameRate !== 0 && !frameRate) {
            console.log('frameRate must be set');
            return;
        }
        this.curFrameRate = frameRate;
        // 清除刷新的定时器
        if (this.wxUpdateTimer) {
            clearInterval(this.wxUpdateTimer);
            this.wxUpdateTimer = null;
        }
        // 子域帧率设置 frameRate = 0 子域逻辑暂停
        this.sendToWxSubContent('frameRate', [frameRate]);
        // 主域刷新设置
        if (frameRate > 0 && frameRate <= 20) {
            this.WXSubContext.enabled = false;
            this.wxUpdateTimer = setInterval(() => {
                if (!window.wx) {
                    return;
                }
                if (!this.WXSubContext || !this.WXSubContext.isValid) {
                    return;
                }
                this.WXSubContext.update();
            }, 100);
        } else if (frameRate > 20) {
            this.WXSubContext.enabled = true;
        }
    },
});
