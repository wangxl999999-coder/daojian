var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const constants = require('constants');
const playerData = require('playerData');
const localConfig = require('localConfig');
var settingPanelObj = cc.Class({
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
        soundOnImage: cc.SpriteFrame,
        soundOffImage: cc.SpriteFrame,
        vibrateOnImage: cc.SpriteFrame,
        vibrateOffImage: cc.SpriteFrame,
        versionLb: cc.Label,

        spSound: cc.Sprite,
        spVibrate: cc.Sprite
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
        
    },

    onBtnCloseClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        clientEvent.dispatchEvent("hidePanel", "settingPanel");
    },

    onBtnSoundClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        let isOpen = cc.gameSpace.audioManager.getConfiguration(true);
        if (isOpen) {
            cc.gameSpace.audioManager.closeMusic();
            cc.gameSpace.audioManager.closeSound();
            
        } else {
            cc.gameSpace.audioManager.openMusic();
            cc.gameSpace.audioManager.openSound();
        }
        this.updateUI();
    },

    onBtnVibrateClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
        if (playerData.vibrateOn) {
            playerData.enableVibrate(false);
        } else {
            playerData.enableVibrate(true);
        }
        this.updateUI();
    },

    updateUI() {
        let isOpen = cc.gameSpace.audioManager.getConfiguration(true);

        if (isOpen) {
            this.spSound.spriteFrame = this.soundOnImage;
        } else {
            this.spSound.spriteFrame = this.soundOffImage;
        }

        if (playerData.vibrateOn) {
            this.spVibrate.spriteFrame = this.vibrateOnImage;
        } else {
            this.spVibrate.getComponent(cc.Sprite).spriteFrame = this.vibrateOffImage;
        }

        this.versionLb.string = 'Ver:' + localConfig.getVersion();
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(cb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        if (cb) cb();
        this.updateUI();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('settingPanel.settingPanelUIEvent', () => settingPanelObj);
