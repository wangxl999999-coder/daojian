const clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
const panel = kf.require('component.panel');
const panelCenter = kf.require('basic.panelCenter');

var maskPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
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
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        this.widget['loadNode'].active = false;
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        // this.widget 是访问子控件的方式

    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(txt) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        if (this.loadTimeOut) {
            clearTimeout(this.loadTimeOut);
            this.loadTimeOut = null;
        }

        this.widget['loadNode'].active = false;
        this.loadTimeOut = setTimeout(() => {
            if (panelCenter.getSubPanelStack().length > 0) {
                clientEvent.dispatchEvent('hidePanel', 'maskPanel');
                return;
            }
            this.widget['loadNode'].active = true;
            this.loadTimeOut = null;
        }, 1000);
    },

    hide() {
        if (this.loadTimeOut) {
            clearTimeout(this.loadTimeOut);
            this.loadTimeOut = null;
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('maskPanel.maskPanelUIEvent', () => maskPanelObj);
