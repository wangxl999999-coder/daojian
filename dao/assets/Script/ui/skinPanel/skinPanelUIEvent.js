const clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
const panel = kf.require('component.panel');
// const code = kf.require('shared.code');
const constants = require('constants');
const pool = kf.require('basic.pool');
const localConfig = require('localConfig');
const playerData = require('playerData');
const resourceUtil = require('resourceUtil');

const skinPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        swordItemPrefab: cc.Prefab,
        skinItemPrefab: cc.Prefab,
        progressBlockPref: cc.Prefab,
        swordPrefab: cc.Prefab,

        nodeSwordPage: cc.Node,
        nodeSwordContent: cc.Node,
        nodeSkinPage: cc.Node,
        nodeSkinContent: cc.Node,
        nodeSwordParent: cc.Node,
        nodeBtnSword: cc.Node,
        nodeBtnSkin: cc.Node,
        imgTabNormal: cc.SpriteFrame,
        imgTabSelect: cc.SpriteFrame,

        spPlayer: cc.Sprite,
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        if (!playerData.gameData.playerSkins) {
            playerData.gameData.playerSkins = [0];
        }

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        pool.createPrefabPool(this.swordItemPrefab);
        pool.createPrefabPool(this.progressBlockPref);

        this.chooseIndex = playerData.gameData.skinData.useSkinIndex;

        this.skinItemArr = [];

        this.playerConfigArr = localConfig.getTableArr('player'); // 角色皮肤数据
        // this.skinNodeArr = [];
        this.initSkin();
        this.createPlayerNode();
        this.selectPlayer(playerData.gameData.playerDefaultSkin || 0);

        this.setSelectPage('sword');

        // 主界面转动
        this.stopKeepTime = 0.1;
        this._stopTime = 0;
        this.rotateSpeed = 150;
    },

    selectPlayer(index) {
        resourceUtil.setPlayerHead(`head${index + 1}`, this.spPlayer, () => {});

        // this.widget['frame']['skinArea']['playerNameLayout']['skinName'].getComponent(cc.Label).string = this.playerConfigArr[index].name;
        const { children } = this.nodeSkinContent;
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            let skinItem = node.getComponent('skinPanelSkinItem');
            if (skinItem.index === index) {
                skinItem.setSelect(true);

                this.updatePlayerLayout(skinItem.ownd);
            } else {
                skinItem.setSelect(false);
            }
        }
    },

    updatePlayerLayout(ownd) {
        if (ownd) {
            this.widget['frame']['skinArea']['playerNameLayout']['gold'].active = false;
            this.widget['frame']['skinArea']['playerNameLayout']['ownTip'].active = true;
        } else {
            this.widget['frame']['skinArea']['playerNameLayout']['gold'].active = true;
            this.widget['frame']['skinArea']['playerNameLayout']['ownTip'].active = false;
        }
    },

    onSkinItemClick(skinItem) {
        this.currentSelectIndex = skinItem.index;
        if (skinItem.ownd) {
            playerData.gameData.playerDefaultSkin = skinItem.index;
            clientEvent.dispatchEvent('updateUserDataDisplay');
        }

        this.selectPlayer(skinItem.index);
    },

    // 创建角色节点
    createPlayerNode() {
        this.nodeSkinContent.removeAllChildren();

        for (let i = 0; i < this.playerConfigArr.length; i++) {
            const node = cc.instantiate(this.skinItemPrefab);
            node.parent = this.nodeSkinContent;
            let skinItem = node.getComponent('skinPanelSkinItem');
            skinItem.show(this.playerConfigArr[i], i, this);
        }
    },

    createSword(superStartNum) { // 主界面刀剑转动逻辑 (todo 皮肤直接写死 建议游戏里做关联)
        this.nodeSwordParent.removeAllChildren();
        const theSwordData = this.skinArr[playerData.skinId - 1];
        const swordNum = theSwordData.fansAddition; // 增加的刀剑数量

        const allSwordNum = swordNum + 1;
        for (let i = 0; i < allSwordNum; i++) {
            let fanNode = pool.getPrefab(this.swordPrefab.name);
            this.nodeSwordParent.addChild(fanNode);
            const swordEffectLogic = fanNode.getComponent('swordEffectLogic');
            swordEffectLogic.setData(allSwordNum, i);

            resourceUtil.setWeaponIcon(`weapon${theSwordData.ID}`, fanNode.getComponent(cc.Sprite), () => {});
        }
    },

    initSkin() {
        this.skinArr = localConfig.getTableArr('skin');
        playerData.isRefreshSkinData = false;
        // 生成皮肤
        for (const skin of this.skinArr) {
            const swordItem = pool.getPrefab(this.swordItemPrefab.name);
            let script = swordItem.getComponent('skinPanelSwordItem');
            script.show(skin, this);

            this.skinItemArr.push(swordItem);
            this.nodeSwordContent.addChild(swordItem);
        }
    },

    onSwordItemClick(swordItem) {
        let oldSelectItem = this.skinItemArr[playerData.gameData.skinData.useSkinIndex - 1];
        oldSelectItem.getComponent('skinPanelSwordItem').setSelect(false);

        let swordID = swordItem.swordData.ID;
        this.skinItemArr[this.chooseIndex - 1].getComponent('skinPanelSwordItem').setSelect(false);
        playerData.gameData.skinData.useSkinIndex = swordID;
        this.chooseIndex = swordID;
        swordItem.setSelect(true);
        let isOwn = playerData.gameData.skinData[`s${swordID}`] && playerData.gameData.skinData[`s${swordID}`] === constants.getSkinNum;
        this.updateSkinDisplay(isOwn);
        this.createSword();
    },

    updateSkinDisplay(isOwn) {
        if (isOwn) {
            this.widget['frame']['skinArea']['skinNameLayout']['gold'].active = false;
        } else {
            this.widget['frame']['skinArea']['skinNameLayout']['gold'].active = true;
            this.widget['frame']['skinArea']['skinNameLayout']['gold']['num'].getComponent(cc.Label).string = this.skinArr[this.chooseIndex - 1].num;
            if (playerData.gameData.gold >= this.skinArr[this.chooseIndex - 1].num) {
                this.widget['frame']['skinArea']['skinNameLayout']['gold']['dot'].active = true;
            } else {
                this.widget['frame']['skinArea']['skinNameLayout']['gold']['dot'].active = false;
            }
        }
        playerData.skinId = playerData.gameData.skinData.useSkinIndex;
        this.widget['frame']['skinArea']['skinNameLayout']['skinName'].getComponent(cc.Label).string = this.skinArr[this.chooseIndex - 1].name;
        this.widget['frame']['skinArea']['skinNameLayout']['skinName']['num'].getComponent(cc.Label).string = `初始刀数：${this.skinArr[this.chooseIndex - 1].fansAddition + 1}`;

        this.updateSkinAddition();
    },

    updateSkinAddition() {
        pool.putChildInPool(this.widget['skinAddition']['fans']['progress']);
        const skinData = this.skinArr[this.chooseIndex - 1];
        for (var i = 0; i < skinData.fansAddition + 1; i++) {
            var block = pool.getPrefab(this.progressBlockPref.name);
            this.widget['skinAddition']['fans']['progress'].addChild(block);
        }
    },

    refreshSkinData() {
        let swordScipt = this.skinItemArr[playerData.gameData.skinData.useSkinIndex - 1].getComponent('skinPanelSwordItem');
        if (swordScipt) {
            swordScipt.setSelect(false);
        }

        this.nodeSwordContent.removeAllChildren(true);

        this.skinItemArr = [];
        this.initSkin();
    },

    setSelectPage(page) {
        this.nodeBtnSword.getComponent(cc.Sprite).spriteFrame = page === 'sword' ? this.imgTabSelect : this.imgTabNormal;
        this.nodeBtnSkin.getComponent(cc.Sprite).spriteFrame = page === 'sword' ? this.imgTabNormal : this.imgTabSelect;

        if (page === 'sword') {
            this.widget['frame']['skinArea']['skinNameLayout'].active = true;
            this.widget['frame']['skinArea']['playerNameLayout'].active = false;
            this.nodeSwordPage.active = true;
            this.nodeSkinPage.active = false;
        } else {
            this.widget['frame']['skinArea']['skinNameLayout'].active = false;
            this.widget['frame']['skinArea']['playerNameLayout'].active = true;
            this.nodeSwordPage.active = false;
            this.nodeSkinPage.active = true;
        }
    },

    onBtnTabSwordClick() {
        this.setSelectPage('sword');
    },

    onBtnTabSkinClick() {
        this.setSelectPage('skin');
    },

    onBtnCloseClick() {
        this.skinItemArr[this.chooseIndex - 1].getComponent('skinPanelSwordItem').setSelect(false);
        this.skinItemArr[playerData.gameData.skinData.useSkinIndex - 1].getComponent('skinPanelSwordItem').setSelect(true);

        clientEvent.dispatchEvent('updateUserDataDisplay');
        clientEvent.dispatchEvent("hidePanel", "skinPanel");
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        // this.widget 是访问子控件的方式

        //头像皮肤购买按钮
        this.widget['frame']['skinArea']['playerNameLayout']['gold'].on('click', () => {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
            if (playerData.gameData.gold >= 15000) {
                playerData.gameData.gold -= 15000;
                playerData.gameData.playerSkins.push(this.currentSelectIndex);
                playerData.gameData.playerDefaultSkin = this.currentSelectIndex;
                clientEvent.dispatchEvent('updateUserDataDisplay');
                this.createPlayerNode();
                this.selectPlayer(playerData.gameData.playerDefaultSkin);
            } else {
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', '金币不足');
            }
        });

        //武器购买的按钮
        this.widget['frame']['skinArea']['skinNameLayout']['gold'].on("click", function() {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CLICK);
            var skin = this.skinArr[this.chooseIndex - 1];
            // TODO 测试代码
            // playerData.gameData.gold = 100000;
            if (playerData.gameData.gold >= skin.num) {
                playerData.gameData.gold -= skin.num;
                playerData.gameData.skinData[`s${skin.ID}`] = constants.getSkinNum;
                this.skinItemArr[playerData.gameData.skinData.useSkinIndex - 1].getComponent('skinPanelSwordItem').setSelect(false);
                playerData.gameData.skinData.useSkinIndex = skin.ID;
                let item = this.skinItemArr[playerData.gameData.skinData.useSkinIndex - 1].getComponent('skinPanelSwordItem');
                item.refresh();
                this.refreshSkinData();
                this.updateSkinDisplay(true);
            } else {
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', '金币不足');
            }
        }.bind(this));
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
        this.chooseIndex = playerData.gameData.skinData.useSkinIndex;
        this.skinArr = localConfig.getTableArr('skin');
        this.skinArrOwn = this.skinArr;
        this.skinData = playerData.gameData.skinData;
        this.skinArrOwn = this.skinArrOwn.filter(function(data) {
            if (this.skinData[`s${data.ID}`] && this.skinData[`s${data.ID}`] == constants.getSkinNum) {
                return true;
            }
            return false;
        }.bind(this));
        let isUnlock = false;
        for (var i = 0; i < this.skinArrOwn.length; i++) {
            if (playerData.skinId === this.skinArrOwn[i].ID) {
                isUnlock = true;
                break;
            }
        }
        this.updateSkinDisplay(isUnlock);
        this.refreshSkinData();
        this.createSword();
    },

    update: function(c) {
        if (!this.isValid) {
            return;
        }
        if (this._stopTime < this.stopKeepTime) return void(this._stopTime += c);
        this.nodeSwordParent.angle += this.rotateSpeed * c;

    }
});

kf.addModule('skinPanel.skinPanelUIEvent', () => skinPanelObj);