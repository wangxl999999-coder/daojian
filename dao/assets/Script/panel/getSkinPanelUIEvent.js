var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const resourceUtil = require('resourceUtil');
var getSkinPanelObj = cc.Class({
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

        spSkin: cc.Sprite
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        // this.widget 是访问子控件的方式
    },

    onBtnSureClick () {
        clientEvent.dispatchEvent('hidePanel', 'getSkinPanel');
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(skinData) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        this.skinData = skinData;

        
        resourceUtil.setWeaponIcon(`weapon${this.skinData.ID}`, this.spSkin, ()=>{});

        // cc.loader.loadRes(`mainSkins/${this.skinData.prefabName}`, cc.Prefab, (err, skinPrefab) => {
        //     if(err) {
        //         return;
        //     }

        //     if (!this.isValid) {
        //         return;
        //     }

        //     this.widget['skin']['image'].removeAllChildren(true);

        //     let skinNode = cc.instantiate(skinPrefab);

        //     skinNode.getChildByName('image').color = cc.color(this.skinData.characterColorValue);
        //     skinNode.getChildByName('shadow').active = false;
        //     this.widget['skin']['image'].addChild(skinNode);

        //     this.widget['skin'].getComponent(cc.Animation).play().on("finished", function() {
        //         // clientEvent.dispatchEvent('hidePanel', 'getSkinPanel');
        //     }.bind(this));
        // });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('getSkinPanel.getSkinPanelUIEvent', () => getSkinPanelObj);
