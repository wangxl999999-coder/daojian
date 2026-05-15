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

        spSword: cc.Sprite,
        lbName: cc.Label,

        nodeSelect: cc.Node,
        nodeLock: cc.Node,
        nodeUse: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setSelect (isSelect) {
        this.nodeUse.active = isSelect;
        this.nodeSelect.active = isSelect;
    },

    refresh () {
        this.show(this.swordData, this._parent);
    },

    show (swordData, parent) {
        this._parent = parent;
        this.swordData = swordData;

        resourceUtil.setWeaponIcon(`weapon${this.swordData.ID}`, this.spSword, ()=>{});

        if (swordData.ID === playerData.gameData.skinData.useSkinIndex) {
            this.setSelect(true);
        } else {
            this.setSelect(false);
        }
        this.lbName.string = swordData.name;

        if (playerData.gameData.skinData[`s${swordData.ID}`] && playerData.gameData.skinData[`s${swordData.ID}`] === constants.getSkinNum) {
            // 已获得皮肤
            this.nodeLock.active = false;
        } else {
            // 未获得皮肤
            this.nodeLock.active = true;
        }
    },

    onBtnItemClick () {
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CHANGE_WEAPON);
        this._parent.onSwordItemClick(this);
    },

    // update (dt) {},
});
