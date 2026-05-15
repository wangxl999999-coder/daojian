const ZORDER = cc.Enum({
    SUB_SCENE_ZORDER: 0,
    BATTLE_ROOM_ZORDER: 3,
    SUB_PANEL_ZORDER: 4,
    COMMON_MASK_ZORDER: 1000,
    WORLD_PANEL_ZORDER: 2000,
    WORLD_ANIMATION_ZORDER: 3000,
    MODAL_PANEL_ZORDER: 4000,
    GLOBAL_FLOATING_PANEL_ZORDER: 5000,
    LOADING_PANEL_ZORDER: 6000,
    ALERT_PANEL_ZORDER: 7000,
});

const PANEL_ZORDER = cc.Enum({
    '空': ZORDER.SUB_SCENE_ZORDER,
    '置顶显示': ZORDER.ALERT_PANEL_ZORDER,
    '主场景动画': ZORDER.WORLD_ANIMATION_ZORDER,
    '浮动提示框': ZORDER.GLOBAL_FLOATING_PANEL_ZORDER,
    '读条界面': ZORDER.LOADING_PANEL_ZORDER,
});

const panelObj = cc.Class({
    extends: cc.Component,
    _customFlag: false,
    properties: {
        isModal: {
            default: true,
            displayName: '模态对话框',
            tooltip: '点开以后不能操作对话框后面',
        },

        customFlag: {
            default: false,
            displayName: '自定义层级',
            tooltip: '弹出框常用',
            visible () {
                return !this.isModal;
            },
        },

        _customOrder: ZORDER.SUB_SCENE_ZORDER,

        customOrder: {
            get () {
                return this._customOrder;
            },
            set (value) {
                this._customOrder = value;
            },
            type: PANEL_ZORDER,
            tooltip: '选择适合的层级关系',
            displayName: '类型',
            visible () {
                return this.customFlag;
            },
        },

        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad () {
        this.widget = {};

        const linkWidget = (parentWidget, widgetObj1, nameFlag) => {
            const widgetObj = widgetObj1;
            const children = parentWidget.getChildren();
            for (let i = 0, len = children.length; i < len; i++) {
                const widgetName = children[i].getName();
                if (widgetName) {
                    if (nameFlag && widgetObj[widgetName]) {
                        // cc.error('出错了!!!!' + this.node.getName() + ' 控件名字重复!' + ' 控件名:' + children[i].getName());
                    }
                    widgetObj[widgetName] = children[i];
                    if (children[i].getChildren() && children[i].getChildren().length > 0) {
                        linkWidget(children[i], widgetObj[widgetName], nameFlag);
                    }
                }
            }
        };

        linkWidget(this.node, this.widget, true);
    },

    show (/* arguments */) {
        this.node.active = true;
    },

    hide () {
        this.node.active = false;
    },

    onDestroy () {
        this.clearAllEvent();
    },

    getRootNode () {
        return this.node;
    },

    setPosition (...params) {
        this.node.setPosition(...params);
    },

    getPosition () {
        return this.node.getPosition();
    },

    registerClientEvent (eventName, handler, forceFlag) {
        if (typeof eventName !== 'string') {
            return;
        }

        if (!this.eventObj) {
            this.eventObj = {};
        }

        if (this.eventObj[eventName]) {
            console.error('already have the same event in this panel');
            return;
        }

        this.eventObj[eventName] = (...params) => {
            const rootNode = this.getRootNode();
            if (!rootNode.activeInHierarchy && !forceFlag) {
                return;
            }

            // handler.apply(this, arguments);
            handler(...params);
        };

        const clientEvent = kf.require('basic.clientEvent');
        clientEvent.on(eventName, this.eventObj[eventName]);
    },

    unregisterClientEvent (eventName) {
        if (typeof eventName !== 'string') {
            return;
        }

        if (!this.eventObj[eventName]) {
            console.error('not found event in this panel');
            return;
        }

        const clientEvent = kf.require('basic.clientEvent');
        clientEvent.off(eventName, this.eventObj[eventName]);

        delete this.eventObj[eventName];
    },

    clearAllEvent () {
        const clientEvent = kf.require('basic.clientEvent');
        for (const eventName in this.eventObj) {
            if (!this.eventObj.hasOwnProperty(eventName)) {
                continue;
            }

            clientEvent.off(eventName, this.eventObj[eventName]);
        }
        this.eventObj = {};
    },

    // 两个a为了排在列表前面
    aaddShowPanelClick (event, panelName) {
        const clientEvent = kf.require('basic.clientEvent');
        if (!panelName || panelName.length <= 0) {
            return;
        }

        clientEvent.dispatchEvent('showPanel', panelName);
    },

    // a为了排在列表前面
    ahidePanelClick (event, panelName1) {
        let panelName = panelName1;
        const clientEvent = kf.require('basic.clientEvent');
        if (!panelName || panelName.length <= 0) {
            panelName = this.node.getName();
        }

        clientEvent.dispatchEvent('hidePanel', panelName);
    },

    setSpriteFrame (sprite1, url, cb) {
        const sprite = sprite1;
        cc.textureCache.addImage(url, (texture) => {
            if (texture instanceof cc.Texture2D) {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
                if (cb) cb(texture);
            } else {
                let frameUrl = url;

                if (frameUrl.indexOf('resources/') !== -1) {
                    [, frameUrl] = frameUrl.split('resources/');
                }

                const extname = cc.path.extname(frameUrl);
                if (extname) {
                    // strip extname
                    frameUrl = frameUrl.slice(0, -extname.length);
                }

                cc.loader.loadRes(frameUrl, cc.SpriteFrame, (err, spriteframe) => {
                    sprite.spriteFrame = spriteframe;
                    if (cb) cb(spriteframe);
                });
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('component.panel', () => panelObj);
