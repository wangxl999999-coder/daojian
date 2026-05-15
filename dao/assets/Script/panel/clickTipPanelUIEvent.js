var clientEvent = kf.require("basic.clientEvent");
var constants = require("constants");
// 每个界面的基础类
var panel = kf.require("component.panel");
var clickTipPanelObj = cc.Class({
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
    onLoad: function () {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent: function() {
        // this.widget 是访问子控件的方式
        this.widget["rightButton"].on("click", function() {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
            clientEvent.dispatchEvent("hidePanel", "clickTipPanel");
            if (this.cancelFunc) {
                this.cancelFunc();
            }
        }.bind(this));

        this.widget["leftButton"].on("click", function() {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
            clientEvent.dispatchEvent("hidePanel", "clickTipPanel");
            if(this.result) {
                this.result();
            }
        }.bind(this));

    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent: function() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },
    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show: function(data, result, cancelFunc) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        this.result = result;
        this.cancelFunc = cancelFunc;
        this.widget["tip"].getComponent(cc.Label).string = data;


    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule("clickTipPanel.clickTipPanelUIEvent", function() {
    return clickTipPanelObj;
});
