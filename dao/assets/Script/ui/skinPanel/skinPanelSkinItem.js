// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const playerData = require('playerData');
const constants = require('constants');
const resourceUtil = require('resourceUtil');


cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        spFrame: cc.Sprite,
        spNameBg: cc.Sprite,
        spAvatar: cc.Sprite,
        lbName: cc.Label,

        nodeSelect: cc.Node,
        nodeLock: cc.Node,
        nodeUse: cc.Node,

        imgUnlockFrame: cc.SpriteFrame,
        imgLockFrame: cc.SpriteFrame,
        imgUnlockNameBg: cc.SpriteFrame,
        imgLockNameBg: cc.SpriteFrame,

        colorUnlockName: new cc.color(),
        colorLockName: new cc.color(),

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setSelect (isSelect) {
        this.nodeUse.active = isSelect;
        this.nodeSelect.active = isSelect;
    },

    show (skinData, index, parent) {
        this._parent = parent;
        this.index = index;
        this.skinData = skinData;

        resourceUtil.setPlayerHead(`head${skinData.ID}`, this.spAvatar, ()=>{});
        this.lbName.string = skinData.name;

        if (skinData.ID === playerData.gameData.skinData.useSkinIndex) {
            this.setSelect(true);
        } else {
            this.setSelect(false);
        }

        if (playerData.gameData.playerSkins.indexOf(index) > -1) {
            // 已拥有
            this.ownd = true;
            this.nodeLock.active = false;

            this.spFrame.spriteFrame = this.imgUnlockFrame;
            this.spNameBg.spriteFrame = this.imgUnlockNameBg;
            this.lbName.node.color = this.colorUnlockName;
        } else {
            // 未拥有
            this.ownd = false;
            this.nodeLock.active = true;

            this.spFrame.spriteFrame = this.imgLockFrame;
            this.spNameBg.spriteFrame = this.imgLockNameBg;
            this.lbName.node.color = this.colorLockName;
        }
        
    },

    onBtnItemClick () {
        this._parent.onSkinItemClick(this);
    },

    // update (dt) {},
});
