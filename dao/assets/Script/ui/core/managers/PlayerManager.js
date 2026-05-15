const maxPlayerCnt = 8;

const constants = require("constants");
const localConfig = require('localConfig');
const playerData = require('playerData');
const resourceUtil = require('resourceUtil');

cc.Class({
    extends: cc.Component,

    properties: {
        playerParent: cc.Node,
        playerPrefab: cc.Prefab,
        trackParent: cc.Node, // 放在 trackPrefab 的父节点
        trackPrefab: cc.Prefab, // 指向敌人的箭头及飞刀数量
        fanCntUIParent: cc.Node,
        fanCntPrefab: cc.Prefab,
        speedUpUIPrefab: cc.Prefab,
        world: cc.Node,
        fansParent: [cc.Node],
        crown: cc.Node,
        spawnPos: [cc.Vec2],
        speedEffect: cc.Prefab,
        dieEffect: cc.Prefab
    },

    getWorldScale() {
        return this.world.scale;
    },

    onLoad() {
        window.PlayerManager = this;
        this.loadPlayerInfo();

        this._knifeMin = 3;
        this._knifeMax = 20;
        this.lastKnifeNum = 0;

        PlayerManager.players = [];
    },

    loadPlayerInfo() {
        Array.prototype.shuffle = function() {
            let array = this;
            let m = array.length,
                t, i;
            while (m) {
                i = Math.floor(Math.random() * m--);
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }
            return array;
        };
        this.spawnPos.shuffle();
        PlayerManager.PlayersInfo = [];
        let playerLvTplt = localConfig.queryOne("growUpLevel", "level", playerData.playerLevel);
        if (!playerLvTplt) {
            console.warn("playerLevel is nil:" + playerData.playerLevel);
            return;
        }
        let nickNameTplt = [].concat(localConfig.getTableArr("nickName"));
        nickNameTplt = [
            {nickName: '张三'}, {nickName: '李四'}, {nickName: '但愿人长久'},
            {nickName: '西瓜'}, {nickName: '小明'}, {nickName: '小美'},
            {nickName: '康康'}, {nickName: '麦克'}, {nickName: '哈哈'}];
        let skinTplt = PlayerManager.getSkinTemplate(maxPlayerCnt, playerData.skinId);
        let alLevelInfo = localConfig.queryOne('AILevel', 'level', playerData.getAILevel());
        let oddsArray = PlayerManager.getPlayerFansCnt(alLevelInfo);
        for (let i = 0; i < maxPlayerCnt; i++) {
            if (i === 0) {
                PlayerManager.PlayersInfo.push(
                    {
                        nickName: playerData.gameData.playerName,
                        skinId: skinTplt[i].ID,
                        level: playerData.gameData.playerLevel,
                        position: this.spawnPos[i],
                        reviveCd: 0,
                        reviveVipRate: 0,
                        propFailCd: 0,
                        propUseRate: 0,
                        propUseTimeDelay: 0,
                        propUseTotalCnt: 0,
                        isAI: false
                    });
            } else {
                let nickNameRandomIndex = _.random(0, nickNameTplt.length - 1);
                let level = _.random(playerLvTplt.minAILv, playerLvTplt.maxAILv);
                let otherNickName = nickNameTplt[nickNameRandomIndex];
                PlayerManager.PlayersInfo.push(
                    {
                        nickName: otherNickName.nickName,
                        skinId: skinTplt[i].ID,
                        level: level,
                        position: this.spawnPos[i],
                        initFansCnt: oddsArray.shift(),
                        reviveCd: alLevelInfo.reviveCd,
                        reviveVipRate: alLevelInfo.reviveVipRate,
                        propFailCd: alLevelInfo.propFailCd,
                        propUseRate: alLevelInfo.propUseRate,
                        propUseTimeDelay: alLevelInfo.propUseTimeDelay,
                        propUseTotalCnt: alLevelInfo.propUseTotalCnt,
                        isAI: true
                    });
                nickNameTplt.splice(nickNameRandomIndex, 1);
            }
        }
    },

    getPlayerFansCnt(alLevelInfo) {
        let odds20 = 0.1;
        let odds10 = 0.2;
        let odds1 = 0.7;
        if (alLevelInfo) {
            odds20 = alLevelInfo.fans20Rate;
            odds10 = alLevelInfo.fans10Rate;
            odds1 = alLevelInfo.fans1Rate;
        }
        let oddsArray = [];
        while (oddsArray.length < maxPlayerCnt - 1) {
            let ran = Math.random();
            let extraFans = 0;//= _.random(alLevelInfo.minExtraFans, alLevelInfo.maxExtraFans);
            if (ran < odds20) {
                oddsArray.push(10 + extraFans);
            } else if (ran < odds20 + odds10) {
                oddsArray.push(5 + extraFans)
            } else {
                oddsArray.push(1 + extraFans);
            }
        }
        return oddsArray;
    },

    getSkinTemplate(maxPlayerCnt, selfSkinId) {
        // let minDefaultSkinCnt = 4;
        // 不与玩家重叠，1/3是普通白模

        // 设置为固定皮肤--
        let minDefaultSkinCnt = 8;

        let newSkinTplt = [];
        let targetSkin = localConfig.queryByID("skin", selfSkinId);
        newSkinTplt.push(targetSkin);
        let skinTplt = [].concat(localConfig.getTableArr("skin"));
        let normalSkinMinId = 0;
        let normalSkinMaxId = 7;
        while (newSkinTplt.length < maxPlayerCnt) {
            if (newSkinTplt.length < minDefaultSkinCnt) {
                let index = _.random(normalSkinMinId, normalSkinMaxId);
                let targetSkin = skinTplt[index];
                if (targetSkin.ID !== selfSkinId) {
                    newSkinTplt.push(targetSkin);
                    skinTplt.splice(index, 1);
                    normalSkinMaxId--;
                }
            } else {
                let index = _.random(0, skinTplt.length - 1);
                let targetSkin = skinTplt[index];
                if (targetSkin.ID !== selfSkinId) {
                    newSkinTplt.push(targetSkin);
                    skinTplt.splice(index, 1);
                }
            }
        }
        return newSkinTplt;
    },

    start() {
        for (let i = 1; i < maxPlayerCnt; i++) {
            let player = cc.instantiate(this.playerPrefab);
            player.parent = this.playerParent;
            let playerScript = player.getComponent("Player");
            // playerScript.fansParent = this.fansParent[i];
            playerScript.setData(this.PlayersInfo[i]);

            let trackNode = cc.instantiate(this.trackPrefab);
            trackNode.parent = this.trackParent;
            let enemyTrackScript = trackNode.getComponent("enemyTrack");
            enemyTrackScript.setHostPlayer(playerScript);

            PlayerManager.players.push(playerScript);
        }
    },

    addSpeedUpUI(player) {
        let speedUpUI = cc.instantiate(this.speedUpUIPrefab);
        speedUpUI.parent = this.fanCntUIParent;
        let follow = speedUpUI.getComponent('Follow');
        follow.target = player.node;
        follow.setPosImmediately();
        return speedUpUI;
    },

    addSpeedEffect(player) {
        let speedEffect = cc.instantiate(this.speedEffect);
        speedEffect.parent = player.nodeBody;
        return speedEffect;
    },

    addDieEffect(player) {
        resourceUtil.createEffect('fight/deadEffect/deadEffect', (err, node)=>{
            if (err) {
                return;
            }

            let worldVec = player.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let localVec = player.node.parent.convertToNodeSpaceAR(worldVec);
            node.parent = this.playerParent;
            node.position = localVec;
            // node.scale = 2;
            let particle = node.getChildByName('particle').getComponent(cc.ParticleSystem);
            particle.startColor = player.uiColor;
            particle.endColor = player.uiColor;

            let ani = node.getComponent(cc.Animation);
            ani.once('finished', ()=>{
                node.destroy();
            }, this);
        }, this.playerParent);


        // let dieEffectNode = cc.instantiate(this.dieEffect);
        // let worldVec = player.node.convertToWorldSpaceAR(cc.v2(0, 0));
        // let localVec = player.node.parent.convertToNodeSpaceAR(worldVec);
        // dieEffectNode.parent = this.playerParent;
        // dieEffectNode.position = localVec;
        // dieEffectNode.scale = 2;
        // for (let i = 0; i < dieEffectNode.children.length; i++) {
        //     for (let j = 0; j < dieEffectNode.children[i].children.length; j++) {
        //         dieEffectNode.children[i].children[j].color = player.uiColor;
        //         for (let m = 0; m < dieEffectNode.children[i].children[j].children.length; m++) {
        //             dieEffectNode.children[i].children[j].children[m].color = player.uiColor;
        //         }
        //     }
        // }


        // setTimeout(function() {
        //     dieEffectNode.destroy();
        // }, 3000);
    },

    speedUp(type) {
        if (PlayerManager.player && PlayerManager.player.speedUp) {
            PlayerManager.player.speedUp(type);
        }
    },

    changeAllAIStrategy() {
        // 新手保护机制 - 返回
        let roundCnt = playerData.gameData.roundCnt;
        if (!roundCnt) roundCnt = 1;
        else roundCnt = parseInt(roundCnt);
        let newbieTplt = localConfig.queryOne('newbieProtectTplt', 'round', roundCnt);
        if (newbieTplt) {
            return;
        }
        for (let i = 0; PlayerManager.players && i < PlayerManager.players.length; i++) {
            PlayerManager.players[i].lastAIStrategy = PlayerManager.players[i].aiStrategy;
            PlayerManager.players[i].lastDangerDetectDistance = PlayerManager.players[i].dangerDetectDistance;

            PlayerManager.players[i].aiStrategy = AIStrategy.Crazy;
            PlayerManager.players[i].dangerDetectDistance = 200;
        }

        setTimeout(function() {
            if (window.PlayerManager && PlayerManager.players) {
                for (let i = 0; i < PlayerManager.players.length; i++) {
                    PlayerManager.players[i].aiStrategy = PlayerManager.players[i].lastAIStrategy;
                    PlayerManager.players[i].dangerDetectDistance = PlayerManager.players[i].lastDangerDetectDistance;
                }
            }
        }, 30000);
    },

    magnet() {
        // 上升两个等级
        // PlayerManager.player.circleChecker.extraLevelUp(3);
        // if (window.wx) {
        //     wx.showToast({
        //         title: '脚下的吸收圈扩大了3级',
        //         icon: 'none',
        //         duration: 1500
        //     });
        // }
    },

    doubleFan() {
        // 双倍当前粉丝
        let nowFanCnt = PlayerManager.player.getFansAmount();
        for (let i = 0; i < nowFanCnt; i++) {
            let fan = FansManager.getFan();
            PlayerManager.player.addFan(fan);
            fan.node.position = PlayerManager.player.node.position;
        }
    },

    addFanCntUI(player) {
        let fanCntUI = cc.instantiate(this.fanCntPrefab);
        fanCntUI.parent = this.fanCntUIParent;
        let fansCntLb = fanCntUI.getChildByName('fanCnt').getComponent(cc.Label);
        if (fansCntLb) {
            fansCntLb.string = player.getFansAmount();
        }
        fanCntUI.color = player.uiColor;
        let follow = fanCntUI.getComponent('Follow');
        follow.target = player.node;
        follow.setPosImmediately();

        return {
            fansCntLb: fansCntLb,
            fansCntBg: fanCntUI
        };
    },

    update(dt) {
        let maxFanPlayer = PlayerManager.players[0];
        this.crown.parent = maxFanPlayer.node;
        this.crown.setPosition(0, 25);
        this.crown.scale = 1 * maxFanPlayer.nodeBody.scale;


        this._knifeNum = PlayerManager.player.getFansAmount();
        var a = PlayerManager.inverseLerp(this._knifeMin, this._knifeMax, this._knifeNum);
        a = PlayerManager.clamp(0, 1, a);
        this._numZoom = cc.misc.lerp(1, .55, a);

        this._moveZoom = PlayerManager.player.isDefence
            ? constants.camera.defence
            : constants.camera.attact;
        this._curZoom = this._numZoom * this._moveZoom;
        let fadeSpeed = 0;
        if (this.world.scale > this._curZoom) {
            fadeSpeed = 2;
        } else {
            if (this.lastKnifeNum > this._knifeNum) {
                fadeSpeed = 5;
            } else {
                fadeSpeed = 3;
            }
        }
        // 游戏中镜头的缩放
        this.world.scale = cc.misc.lerp(this.world.scale, this._curZoom, fadeSpeed * dt);

        this.lastKnifeNum = this._knifeNum;
    },

    inverseLerp: function(a, b, c) {
        return a === b ? 1 : (c - a) / (b - a)
    },

    clamp: function(a, b, c) {
        return Math.max(a, Math.min(b, c));
    },
});
