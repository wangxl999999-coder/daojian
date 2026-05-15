var clientEvent = kf.require('basic.clientEvent');
// 每个界面的基础类
var panel = kf.require('component.panel');
const pool = kf.require('basic.pool');
const constants = require('constants');
const localConfig = require('localConfig');
const gameLogic = require('gameLogic');
const playerData = require('playerData');
const resourceUtil = require('resourceUtil');

var matchingPanelObj = cc.Class({
    // 每个界面要注意继承panel
    extends: panel,

    properties: {
        // guidePos: cc.Node,
        // guideUI: cc.Node,
        imageItemPrefab: cc.Prefab,
        otherBtn1: cc.Node,
        image1: cc.Node,
        nameLb1: cc.Label,
        // defaultSkin: cc.Node,
        // miniGameArea: cc.Node,
        addTip: cc.Prefab
    },

    // use this for initialization
    onLoad() {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();

        // 固定函数名称，用于统一注册ui事件
        this.registerWidgetEvent();

        // 固定函数名称，用于统一注册客户端事件
        this.registerEvent();

        pool.createPrefabPool(this.imageItemPrefab);

        this.imageItemArr = [];
        this.initImageItems();
        this.matchingNum = 0; // 进入匹配界面次数
    },

    initImageItems() {
        for (var i = 0; i < 8; i++) {
            var imageItem = pool.getPrefab(this.imageItemPrefab.name);
            this.widget['imageLayout'].addChild(imageItem);
            this.imageItemArr.push(imageItem);
        }
    },

    onBtnCloseClick () {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
            this.timeOut = null;
        }
        playerData.inGame = false;
        playerData.inGameOver = false;
        clientEvent.dispatchEvent("showPanel", "mainPanel");
        clientEvent.dispatchEvent("hidePanel", "matchingPanel");
    },

    // 固定函数名称，用于统一注册ui事件
    registerWidgetEvent() {
        // this.widget 是访问子控件的方式
        this.widget["closeBtn"].on("click", function() {
                   
        }.bind(this));
    },

    // 固定函数名称，用于统一注册客户端事件
    registerEvent() {
        // 注册客户端事件的方式，在这个界面被销毁的时候，以这种方式注册的客户端事件会被自动反注册
    },

    clearImages() {
        for (var i = 0; i < this.imageItemArr.length; i++) {
            this.imageItemArr[i].getChildByName('image').getComponent(cc.Sprite).spriteFrame = null;
        }
    },

    updateImages(cb) {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
            this.timeOut = null;
        }
        // 从数组中随机取不重复的项
        var numArr = this.random(8, 1, 101);
        for (let i = 0; i < this.imageItemArr.length; i++) {
            if (numArr[i]) {
                
                resourceUtil.loadMatchAvatar(numArr[i], (err, spriteframe) => {
                    if (this.imageItemArr && this.imageItemArr[i]) {
                        let randomTime = Math.ceil(Math.random() * 4000);
                        setTimeout(function() {
                            if (this.imageItemArr && this.imageItemArr[i]) {
                                this.imageItemArr[i].getChildByName('image')
                                    .getComponent(cc.Sprite).spriteFrame = spriteframe;
                            }
                        }.bind(this), randomTime);
                    }
                });
            }
        }

        this.timeOut = setTimeout(function() {
            if (cb) {
                cb();
            }
            clearTimeout(this.timeOut);
            this.timeOut = null;
        }.bind(this), this.maxDelayTime * 1500);
    },

    random(len, start, end) {
        var arr = [];

        function _inner(start, end) {
            var span = end - start;
            return parseInt(Math.random() * span + start)
        }

        while (arr.length < len) {
            var num = _inner(start, end);
            if (arr.indexOf(num) == -1) {
                arr.push(num);
            }
        }
        return arr;
    },

    // 界面在每次被显示的时候调用,可以传参数，非常方便的进行界面数据调试
    show(cb) {
        // 要注意调用 super,使panel中的框架代码生效
        this._super();
        if (cb) cb();
        this.maxDelayTime = _.random(1, 2);
        this.widget['matchingDesc'].getComponent(cc.Label).string = constants.matchingDesc[this.matchingNum];
        this.matchingNum++;
        if (this.matchingNum > (constants.matchingDesc.length - 1)) {
            this.matchingNum = 0;
        }

        // 停留2秒后，隐藏返回按钮
        this.widget['closeBtn'].active = true;
        this.scheduleOnce(function() {
            this.widget['closeBtn'].active = false;
        }.bind(this), 2);

        let isReady = false;
        this.clearImages();

        // this.updatePropertyLevel();
        this.updateImages(function() {
            let gameStartDelay = 2500;
            setTimeout(function() {
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.GAME_START);
                clientEvent.dispatchEvent("hidePanel", "matchingPanel");
                let loadSceneId = setInterval(function() {
                    if (isReady) {
                        playerData.inGame = true;
                        clearInterval(loadSceneId);
                        cc.director.loadScene('swordWorld');
                    }
                }, 100);
                // clientEvent.dispatchEvent("showPanel", "gamePanel");
            }, gameStartDelay);
        }.bind(this));

        gameLogic.loadUserSkin();
        cc.director.preloadScene('swordWorld', function() {
            isReady = true;
        });
    },

    updatePropertyLevel() {
        //todo 直接在这边加会导致数据一致累加，错误！
        this.skinArr = localConfig.getTableArr('skin');
        const skinData = this.skinArr[playerData.skinId - 1];
        playerData.playerLevel += skinData.speedAddition;
        playerData.sprintLevel += skinData.speedAddition;
        playerData.gameData.fansCountLevel += skinData.fansAddition;

        playerData.playerLevel = playerData.playerLevel > 60 ? 60 : playerData.playerLevel;
        playerData.sprintLevel = playerData.sprintLevel > 30 ? 30 : playerData.sprintLevel;
        playerData.gameData.fansCountLevel = playerData.gameData.fansCountLevel > 30 ? 30 : playerData.gameData.fansCountLevel;
    },

    hide() {
        clearInterval(this.miniGameInterval);
    },

    createRoleNode() {
        var moreRolePosition = [
            cc.v2(-32, 63),
            cc.v2(17, 60),
            cc.v2(70, 76),
            cc.v2(57, 17),
            cc.v2(117, 66),
            cc.v2(-72, 107),
            cc.v2(-126, 63),
            cc.v2(-110, 22),
            cc.v2(-46, 0),
            cc.v2(0, 0),
        ];
        let skinTplt = localConfig.queryByID("skin", playerData.skinId);
        if (!skinTplt) {
            return;
        }
        cc.loader.loadRes(`mainSkins/${skinTplt.prefabName}`, cc.Prefab, (err, skinPrefab) => {
            if (err) {
                return;
            }
            if (!this.isValid) {
                return;
            }
            var roleArr = moreRolePosition;
            for (var i = 0; i < roleArr.length; i++) {
                let skinNode = cc.instantiate(skinPrefab);
                skinNode.getChildByName('image').color = cc.color(skinTplt.characterColorValue);
                // this.widget['matchingComplete']['morePlayer'].addChild(skinNode);
                skinNode.setPosition(roleArr[i]);
                if (i !== roleArr.length - 1) {
                    skinNode.setScale(0.5);
                } else {
                    skinNode.setScale(0.7);
                }
            }
        });
    },
});

kf.addModule('matchingPanel.matchingPanelUIEvent', () => matchingPanelObj);
