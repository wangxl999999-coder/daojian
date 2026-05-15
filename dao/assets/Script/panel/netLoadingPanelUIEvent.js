// 每个界面的基础类
const panel = kf.require('component.panel');
const panelCenter = kf.require('basic.panelCenter');

cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
    },

    // use this for initialization
    onLoad () {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent () {
        panelCenter.addClickMaskEvent(this.widget['layout']);
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent () {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册

    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show () {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
