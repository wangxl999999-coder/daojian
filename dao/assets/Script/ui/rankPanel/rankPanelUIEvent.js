var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const constants = require('constants');
const playerData = require('playerData');

const TURN_DIRECTION = cc.Enum({
    LEFT: 0,
    RIGHT: 1,
    NONE: 2,//默认第一页
})

var rankPanelObj = cc.Class({
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

        spSubContext: cc.Sprite
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
    },

    showSubContext: function () {
        // 真机上会出现黑屏与奇怪的文字，尝试在打开开放域之前创建纹理
        if (!this.spSubContext.spriteFrame) {
            this.spSubContext.spriteFrame = new cc.SpriteFrame(new cc.Texture2D());
        }
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(data, cb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        if (cb) cb();
        
        this.fromGameOver = data.fromGameOver;
        this.showUserInfoBtn = data.showUserInfoBtn;
    },

    onEnable () {
        this.showSubContext();
    },

    onBtnCloseClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        clientEvent.dispatchEvent("hidePanel", "rankPanel");
    },

    onBtnLeftClick () {
        this.direction = TURN_DIRECTION.LEFT;
    },

    onBtnRightClick () {
        this.direction = TURN_DIRECTION.RIGHT;
    },
    
});

kf.addModule('rankPanel.rankPanelUIEvent', () => rankPanelObj);
