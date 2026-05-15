window.Direction = {
    Idle: 0,
    Left: 1,// 0000,down,up,right,left
    Right: 2,
    Up: 4,
    LeftUp: 5,
    RightUp: 6,
    Down: 8,
    LeftDown: 9,
    RightDown: 10
};
window.AIStrategy = {
    // 当总人数 === 2，detectionRange = Number.Max
    Crazy: {
        chaseTime: 25,
        fansDelta: 1,
        detectionRange: 450
    },
    Radical: {
        chaseTime: 15,
        fansDelta: 2,
        detectionRange: 450
    },
    Calm: {
        chaseTime: 10,
        fansDelta: 6,
        detectionRange: 400

    },
    Conservatism: {
        chaseTime: 6,
        fansDelta: 10,
        detectionRange: 350
    }
};
const clientEvent = kf.require('basic.clientEvent');
const radius = [40, 80, 120, 160, 200, 240, 300, 340, 380, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000];
const perCircleFanCnt = [2, 5, 8, 12, 17, 23, 30, 38, 47, 57, 67, 77, 87, 97, 107, 117, 127, 137, 147, 157, 167, 177, 187, 197];
const localConfig = require('localConfig');
const playerData = require('playerData');
const constants = require('constants');
const gameLogic = require('gameLogic');
const resourceUtil = require('resourceUtil');

const SPEED_UP_RATIO = 1.7;

cc.Class({
    extends: cc.Component,
    properties: {
        bodySprite: cc.Sprite,
        invincibilityTag: cc.Node,
        fansParent: cc.Node,
        defenseEffect: cc.Node,
        nameNode: cc.Node,
        nodeBody: cc.Node,
        nodeRageParent: cc.Node,
        nodeDefenseFgParent: cc.Node,
    },

    onLoad() {
        this.aiStrategy = AIStrategy.Conservatism;
        // 当前这条命复活的次数
        this.propUseCnt = 0;
        this.propUseTotalCnt = 3;
        this.killCnt = 0;
        // 距离玩家一定距离，是否要渲染
        // this.isRender = true;
        this.playerLv = 1;
        this.maxFansCnt = 0;
        this.direction = Direction.IDLE;
        this.lastPos = this.node.position;
        this.goldSpeedNum = 0;
        this.continueKillCnt = 0;
        this.stopMoveTime = 0;
        this.limitTimeArr = [4, 3, 2, 1];
        this.limitTimeIndex = 0;
        this.currentBodyScale = 1;
        this.isDefence = true;
        this.defenseEffect.active = true;
        this.nodeDefenseFgParent.active = true;
        this.defenseAnim = this.defenseEffect.getComponent(cc.Animation);
        this.defenseAnim.play();

        this.angleDelta = _.random(90, 270);

        this.indexflame = 0; // 跳帧计数器

        this.AILogicTimmer = 0;

        resourceUtil.createEffect('fight/defenseEffect/defenseEffect', (err, node)=>{
            if (err) {
                return;
            }

            this.nodeDefenseEffect = node;
            this.showDefenceAni();
        }, this.nodeDefenseFgParent);
    },

    showDefenceAni () {
        if (this.nodeDefenseEffect) {
            let ani = this.nodeDefenseEffect.getComponent(cc.Animation);
            ani.play('defenseEffectStart');
            ani.once('finished', ()=>{
                ani.play('defenseEffectIdle');
            }, this);
        }
    },

    setData(info) {
        this.info = info;
        this.characterLv = info.level;

        this.reviveCd = info.reviveCd;
        this.reviveVipRate = info.reviveVipRate;
        this.propFailCd = info.propFailCd;
        this.propUseRate = info.propUseRate;
        this.propUseTimeDelay = info.propUseTimeDelay;
        this.propUseTotalCnt = info.propUseTotalCnt;

        this.lvInfo = localConfig.queryOne('growUpLevel', 'level', this.characterLv);
        if (this.lvInfo) {
            this.initSpeed = this.lvInfo.speed * 1.5; // TODO: 暂时增加移动速度
        } else {
            this.initSpeed = 600;
            console.log("playerLevel Tplt level:" + this.characterLv + 'is nil');
        }
        this.node.position = info.position;
        this.speed = this.initSpeed;
        this.playerName = info.nickName;
        this.isAI = info.isAI;
        this.fans = [];
        let targetSkin = localConfig.queryByID("skin", info.skinId);
        this.uiColor = cc.color(targetSkin.uiColorValue);

        // 设置角色名字
        if (this.nameNode) {
            this.nameNode.getComponent(cc.Label).string = this.playerName;
            this.nameNode.color = this.uiColor;
        }

        for (let i = 0; i < this.defenseEffect.children.length; i++) {
            this.defenseEffect.children[i].color = this.uiColor;
        }
        // 装扮人物的皮肤
        let self = this;
        if (targetSkin) {
            // 武器--
            // cc.loader.loadRes('mainSkins/' + targetSkin.prefabName, cc.Prefab, (err, prefab) => {
            //     if (!this.isValid) {
            //         return;
            //     }
            //     if (!err) {
            //         let weaponNode = cc.instantiate(prefab);
            //         self.weaponSf = weaponNode.getChildByName('image').getComponent(cc.Sprite).spriteFrame;
            //     }
            // });

            resourceUtil.loadWeaponIcon(`weapon${info.skinId}`, (err, sfImg)=>{
                this.weaponSf = sfImg;
            });

            if (!this.isAI) {
                // self.Idle = gameLogic.randomPlayerIdle;
                // self.bodySprite.spriteFrame = self.Idle[0];

                resourceUtil.setPlayerHead(`head${playerData.gameData.playerDefaultSkin + 1}`, this.bodySprite, ()=>{});
                this.playerHead = playerData.gameData.playerDefaultSkin + 1;
                // self.anim = self.Idle;
            } else {
                resourceUtil.setPlayerHead(`head${targetSkin.prefabName}`, this.bodySprite, ()=>{});
                this.playerHead = targetSkin.prefabName;
                // cc.loader.loadRes('subPackage/skinsPrefabs/' + targetSkin.prefabName, cc.Prefab, (err, prefab) => {
                //     if (!this.isValid) {
                //         return;
                //     }
                //     if (!err) {
                //         let skinNode = cc.instantiate(prefab);
                //         let skinInfo = skinNode.getComponent('skinInfo');
                //         if (skinInfo) {
                //             self.Idle = skinInfo.Idle;
                //         }
                //     }
                //     self.bodySprite.spriteFrame = self.Idle[0];
                //     self.anim = self.Idle;
                // });
            }
        } else {
            // self.bodySprite.spriteFrame = self.Idle[0];
            // self.anim = self.Idle;
            this.playerHead = '1';
            resourceUtil.setPlayerHead(`head1`, this.bodySprite, ()=>{});
            console.warn("skinId:" + skinId + "is nil");
        }

        // 危险检测范围
        this.dangerDetectDistance = 350;
        this.deltaAnimFrame = 0.1;
        // AI
        this.targetFan = null;
        this.targetPlayer = null;
        // 禁用粉丝
        this.forbiddenFans = [];
        // 禁用玩家
        this.forbiddenPlayers = [];
        // 清除频率 5s
        this.clearForbiddenCd = 5;
        // 禁用危险玩家
        this.forbiddenDangers = [];
        this.clearDangersCd = 0.5;

        this.speedUpNowTime = 0;
        this.speedUpMaxTime = 10;

        this.eatNowTime = 0;
        this.eatMaxCd = 0.05;

        this.setInvincibility(false);

        // 设置相机
        if (!this.isAI) {
            this.camera = kf.require('logic.camera');
            this.camera.setCamera(cc.Camera.findCamera(this.node));
        }

        clientEvent.on('_touchEndEvent', this._touchEndEvent.bind(this));
        clientEvent.on('_touchStartEvent', this._touchStartEvent.bind(this));
    },

    _touchStartEvent() {
        if (this === PlayerManager.player) {
            this.stopMoveTime = 0;
            this.limitTimeIndex = 0;
            this.isDefence = false;
            this.defenseEffect.active = false;
            
            this.nodeDefenseFgParent.active = false;
            this.defenseAnim.stop();
            this.changeFansToAttack();

            this.nodeBody.scale = this.currentBodyScale + 0.2;
        }
    },

    _touchEndEvent() {
        if (this === PlayerManager.player) {
            if (this.isCollision()) {
                return;
            }

            this.isDefence = true;
            this.defenseEffect.active = true;
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.SHIELD);
            this.nodeDefenseFgParent.active = true;
            this.showDefenceAni();

            this.defenseAnim.play();
            // clientEvent.dispatchEvent("startChangeToDefence", this);
            this.changeFansToDefence();

            this.nodeBody.scale = this.currentBodyScale;
        }
    },

    isCollision() {
        let paddingOffset = 20;
        let padding = this.nodeBody.width * 0.5 * this.node.scale + paddingOffset;
        if (this.node.x < -0.5 * playerData.BoundSize.x + padding) {
            return true;
        }
        if (this.node.x > 0.5 * playerData.BoundSize.x - padding) {
            return true;
        }
        if (this.node.y < -0.5 * playerData.BoundSize.y + padding) {
            return true;
        }
        if (this.node.y > 0.5 * playerData.BoundSize.y - padding) {
            return true;
        }
        return false;
    },

    AIMoveStartEvent() {
        this.stopMoveTime = 0;
        this.limitTimeIndex = 0;
        this.isDefence = false;
        this.defenseEffect.active = false;
        this.nodeDefenseFgParent.active = false;
        this.defenseAnim.stop();

        this.changeFansToAttack();
    },

    changeFansToAttack () {
        this.fans.forEach((fan)=>{
            fan.startChangeToAttack(this);
        }, this);
    },

    changeFansToDefence () {
        this.fans.forEach((fan)=>{
            fan.startChangeToDefence(this);
        }, this);
    },

    AIMoveEndEvent() {
        if (this.isCollision()) {
            return;
        }
        this.isDefence = true;
        this.defenseEffect.active = true;
        this.nodeDefenseFgParent.active = true;
        this.defenseAnim.play();

        this.changeFansToDefence();
        // clientEvent.dispatchEvent("startChangeToDefence", this);
    },

    start() {
        let initFansCnt = 1;
        if (this.info) {
            initFansCnt = this.info.initFansCnt;
        }
        if (this.isAI) {
            let angle = _.random(-180, 180);
            if (angle < -90) this.aiStrategy = AIStrategy.Radical;
            else if (angle > 90) this.aiStrategy = AIStrategy.Calm;
            else this.aiStrategy = AIStrategy.Conservatism;
        } else {
            PlayerManager.player = this;
            PlayerManager.players.unshift(this);
            this.setData(PlayerManager.PlayersInfo[0]);
            this.node.position = PlayerManager.spawnPos[0];

            initFansCnt = playerData.superStart;
            initFansCnt += playerData.miniGameExtraFan;
            initFansCnt += playerData.gameData.fansCountLevel;
            //皮肤加成
            if (this.info && this.info.skinId) {
                let targetSkin = localConfig.queryByID("skin", this.info.skinId);
                if (targetSkin) {
                    initFansCnt += targetSkin.fansAddition;
                }
            }
        }
        this.invincibilityTag.color = this.uiColor;
        let fanUIDetail = PlayerManager.addFanCntUI(this);
        this.fansCntLb = fanUIDetail.fansCntLb;
        this.fansCntBg = fanUIDetail.fansCntBg;

        let weaponEquipInterval = setInterval(function() {
            if (this.weaponSf) {
                clearInterval(weaponEquipInterval);
                let initTotalFan = 0;
                let delay = setInterval(function() {
                    if (initTotalFan < initFansCnt) {
                        let fan = FansManager.getFan();
                        this.addFan(fan, true);
                        initTotalFan++;
                    } else {
                        clearInterval(delay);
                    }
                }.bind(this), 10);
            }
        }.bind(this), 10);


        
        this.newbieProtect();
    },

    newbieProtect() {
        if (this.isAI) {
            // 新手保护机制
            let roundCnt = playerData.gameData.roundCnt;
            if (!roundCnt) roundCnt = 1;
            else roundCnt = parseInt(roundCnt);
            let newbieTplt = localConfig.queryOne('newbieProtectTplt', 'round', roundCnt);
            if (newbieTplt) {
                switch (newbieTplt.aiType) {
                    case 1:
                        this.aiStrategy = AIStrategy.Radical;
                        break;
                    case 2:
                        this.aiStrategy = AIStrategy.Calm;
                        break;
                    case 3:
                        this.aiStrategy = AIStrategy.Conservatism;
                        break;
                }
                this.dangerDetectDistance = newbieTplt.dangerDetectDistance;
                this.speed = newbieTplt.speed;
            }
        }
    },

    getFansAmount() {
        return this.fans.length;
    },

    addFan(fan, isInit) {
        if (!fan) {
            fan = FansManager.getFan();
        }
        if (!fan) {
            return;
        }

        if (!this.node.active) {
            return;
        }

        // 变成自己属性的刀剑--

        let weaponSp = fan.node.getComponent(cc.Sprite);
        if (weaponSp) {
            weaponSp.spriteFrame = this.weaponSf;
        }
        let worldVec = fan.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let localVec = this.fansParent.convertToNodeSpaceAR(worldVec);

        fan.node.position = localVec;
        fan.hostPlayer = this;
        fan.isDefence = this.isDefence;
        fan.isReleased = false;
        fan.knifeCountComp.index = this.fans.length;

        fan.node.parent = this.fansParent;
        this.fans.push(fan);

        // 镜头的缩放
        this.camera && this.camera.chagneWeaponNum(this.fans.length);

        if (this.fans.length > this.maxFansCnt) {
            this.maxFansCnt = this.fans.length;
        }
        if (isInit) {
            fan.knifeState = KnifeState.Init;
        } else {
            fan.knifeState = KnifeState.Normal;
        }

        this.fansCntLb.string = this.fans.length;
        // this.fansCntBg.width = 128 + 30 * (this.fans.length > 100 ? 2 : this.fans.length > 10 ? 1 : 0);
        let lv = this.fans.length / 1000;
        if (lv > 0.2) lv = 0.2;
        // this.node.scale = 0.6 + 3 * lv;
        this.node.scale = 1 + 3 * lv;
        this.currentBodyScale = 1 + 0.02 * (this.fans.length > 20 ? 20 : this.fans.length);
        this.nodeBody.scale = this.currentBodyScale + (this.isDefence?0:0.2);
        let lastLv = this.playerLv;
        let levelTplt = [].concat(localConfig.getTableArr("level"));
        for (let i = 0; i < levelTplt.length; i++) {
            if (this.fans.length >= levelTplt[i].fanCnt) {
                this.playerLv = levelTplt[i].level;
            } else {
                break;
            }
        }
        if (this.playerLv > lastLv) {
            this.eatMaxCd -= 0.003;
        }
        clientEvent.dispatchEvent('addFan', this);
        setTimeout(() => {
            if (!this.fans) {
                return;
            }
            for (const aFan of this.fans) {
                aFan.rotateKnife();
                aFan.setScale();
            }
        }, 50);
    },

    levelUp() {
        this.playerLv++;
    },

    /**
     * 丢掉刀剑的时候
     * @param {*} fan
     */
    removeFan(fan) {
        this.eatNowTime = this.eatMaxCd;

        for (let i = 0; i < this.fans.length; i++) {
            if (this.fans[i] === fan) {
                this.fans[i].hostPlayer = null;
                this.fans.splice(i, 1);
                break;
            }
        }

        // 镜头的缩放
        this.camera && this.camera.chagneWeaponNum(this.fans.length);

        for (let i = 0; i < this.fans.length; i++) {
            this.fans[i].knifeCountComp.index = i + 1;
        }
        this.fansCntLb.string = this.fans.length;
        // this.fansCntBg.width = 128 + 30 * (this.fans.length > 100 ? 2 : this.fans.length > 10 ? 1 : 0);

        if (this.fans.length <= 0) {
        } else {
            let lastLv = this.playerLv;
            let levelTplt = [].concat(localConfig.getTableArr("level"));
            for (let i = 0; i < levelTplt.length; i++) {
                if (this.fans.length >= levelTplt[i].fanCnt) {
                    this.playerLv = levelTplt[i].level;
                } else {
                    break;
                }
            }
            if (this.playerLv < lastLv) {
                this.eatMaxCd += 0.003;
            }
            let lv = this.fans.length / 1000;
            if (lv > 0.2) lv = 0.2;
            // this.node.scale = 0.6 + 3 * lv;
            this.node.scale = 1 + 3 * lv;

            this.currentBodyScale = 1 + 0.02 * (this.fans.length > 20 ? 20 : this.fans.length);
            this.nodeBody.scale = this.currentBodyScale + (this.isDefence?0:0.2);
        }
        setTimeout(() => {
            if (!this.fans) {
                return;
            }

            for (const aFan of this.fans) {
                aFan.rotateKnife();
                aFan.setScale();
            }
        }, 10);
    },

    reviveNormal() {
        this.revive(2);
    },

    reviveVip() {
        // this.revive(Math.floor(this.maxFansCnt / 2));
        this.revive(this.maxFansCnt + 10); //现在改为复活固定给10把
    },

    // 复活，粉丝数为巅峰时期最高人数
    revive(fanCnt) {
        this.node.active = true;

        for (let i = 0; i < fanCnt; i++) {
            let fan = FansManager.getFan();
            this.addFan(fan, true);
        }
        if (this.nameNode) {
            this.nameNode.active = true;
        }
        if (this.fansCntLb) {
            this.fansCntLb.node.active = true;
        }
        if (this.fansCntBg) {
            this.fansCntBg.active = true;
        }

        this.setInvincibility(true);
        setTimeout(function() {
            this.setInvincibility(false);
        }.bind(this), 5000);
    },

    setInvincibility(value) {
        if (!this || !this.node) return;
        this.invincibility = value;
        // 得到等级
        let levelTplt = localConfig.getTableArr('level');
        if (levelTplt) {
            let targetLv = this.playerLv;
            for (let i = 0; i < levelTplt.length; i++) {
                if (levelTplt[i].level === targetLv || i === levelTplt.length - 1) {
                    if (!this.invincibilityTag.initWidth) {
                        this.invincibilityTag.initWidth = this.invincibilityTag.width;
                    }
                    if (!this.invincibilityTag.initHeight) {
                        this.invincibilityTag.initHeight = this.invincibilityTag.height;
                    }
                    this.invincibilityTag.width = levelTplt[i].invincibilitySizeFactor
                        * this.invincibilityTag.initWidth;
                    this.invincibilityTag.height = levelTplt[i].invincibilitySizeFactor *
                        this.invincibilityTag.initHeight;
                    break;
                }
            }
        }
        this.invincibilityTag.active = this.invincibility;
    },

    getInvincibility() {
        return this.invincibility;
    },

    destroySpeedUp () {
        this.speed = this.initSpeed;

        if (this.speedUpUI && this.speedUpUI.isValid) {
            this.speedUpUI.destroy();
        }

        if (this.speedUpEffect) {
            this.speedUpEffect.destroy();
        }

        if (this.speedUpInterval) {
            clearInterval(this.speedUpInterval);   
        }
    },

    speedUp(type) {
        this.destroySpeedUp();

        this.speedUpUI = PlayerManager.addSpeedUpUI(this);
        this.speedUpEffect = PlayerManager.addSpeedEffect(this);

        this.speed = (constants.speedGoldAddPra / 100) * this.initSpeed;
        let targetSprintLevel = localConfig.queryOne("growUpLevel", "level", playerData.sprintLevel);
        if (targetSprintLevel && !this.isAI) {
            this.speedUpNowTime = targetSprintLevel.sprintTime;
        } else {
            this.speedUpNowTime = constants.speedGoldTime;
        }
        let animationState = this.speedUpUI.getChildByName("speeduping").getComponent(cc.Animation).play("goldSpeedUp");
        animationState.speed = 3 / this.speedUpNowTime;

        this.speedUpInterval = setInterval(function() {
            if (!this || !this.node || !this.isValid) {
                clearInterval(this.speedUpInterval);
                return;
            }
            if (this.speedUpNowTime <= 0) {
                this.destroySpeedUp();
            }
        }.bind(this), 1000);

        this.propUseCnt++;
    },

    reRenderFans() {
        for (let i = 0; i < this.fans.length; i++) {
            this.fans[i].node.active = true;
        }
    },

    hideFans() {
        for (let i = 0; i < this.fans.length; i++) {
            this.fans[i].node.active = false;
        }
    },

    circleIntersect (len, pos1, pos2) {
        const x1 = pos1.x;
        const x2 = pos2.x;
        const y1 = pos1.y;
        const y2 = pos2.y;

        if (len * len < (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) {
            return false;
        }
        return true;
    },
    update(dt) {
        if (playerData.gameState !== constants.GAME_STATE.PLAY) return;
        if (this.isAI) {
            this.indexflame++;
            if (cc.gameSpace.gameLogic.isInScreenExternal(this.node) && this.indexflame % 9 !== 0) { // 在屏幕外
                return;
            }
            this.indexflame = 0;
            this.updateBattleArray();
            this.AILogic(dt);
        } else {
            this.TrySpeedUpGuide();
            this.updateBattleArray();
            this.detectObstacle();
        }
        this.checkOutBound();
        let deltaX = this.node.x - this.lastPos.x;
        let deltaY = this.node.y - this.lastPos.y;
        this.lastPos = this.node.position;
        this.directionUpdate(deltaX, deltaY);
        this.detectIfInObstacle();
        this.playAnimation(dt);

        this.eatNowTime -= dt;
        this.speedUpNowTime -= dt;

        this.danceLogic(dt);
    },

    checkOutBound() {
        let isOut = false;
        let padding = this.nodeBody.width * 0.5 * this.node.scale;
        if (this.node.x < -0.5 * playerData.BoundSize.x + padding) {
            this.node.x = -0.5 * playerData.BoundSize.x + padding;
            isOut = true;
        }
        if (this.node.x > 0.5 * playerData.BoundSize.x - padding) {
            this.node.x = 0.5 * playerData.BoundSize.x - padding;
            isOut = true;
        }
        if (this.node.y < -0.5 * playerData.BoundSize.y + padding) {
            this.node.y = -0.5 * playerData.BoundSize.y + padding;
            isOut = true;
        }
        if (this.node.y > 0.5 * playerData.BoundSize.y - padding) {
            this.node.y = 0.5 * playerData.BoundSize.y - padding;
            isOut = true;
        }
        return isOut;
    },

    /**
     * 飞刀跟随的逻辑
     * @param {*} dt 每帧的时间
     */
    danceLogic(dt) {
        if (this.isDefence) {
            this.stopMoveTime += dt;
            if (this.stopMoveTime > this.limitTimeArr[this.limitTimeIndex] && this.fans.length > 0) {
                this.fans[0].knifeState = KnifeState.Release;
                this.fans[0].isRelease = true;
                this.fans[0].throwKnife(ThrowType.SelfRelease);
                this.removeFan(this.fans[0]);
                this.stopMoveTime = 0;
                this.limitTimeIndex++;
                if (this.limitTimeIndex >= this.limitTimeArr.length) {
                    this.limitTimeIndex = this.limitTimeArr.length - 1;
                }
            }
            if (this.fans.length > 0) {
                let danceTime = this.limitTimeArr[this.limitTimeIndex] * 100;
                if (this.stopMoveTime > danceTime) {
                    this.fans[0].dance(danceTime);
                }
            }
        }
    },

    updateBattleArray() {

        return;
        let angle = gameLogic.Joystick._angle;
        if (!this.lastAngle) {
            this.lastAngle = angle;
        }

        if (Math.abs(angle - this.lastAngle) > 90) {
            this.lastAngle = angle;
            for (let i = 0; i < this.fans.length; i++) {
                this.fans[i].resetRandomFactor();
            }
        }
        let radiusIndex = 0;
        let totalFansCnt = this.fans.length;
        for (let i = 0; i < perCircleFanCnt.length; i++) {
            totalFansCnt -= perCircleFanCnt[i];
            if (totalFansCnt < 0) {
                radiusIndex = i;
                break;
            }
        }

        let rad1 = 2 * Math.PI / 360 * angle;
        let deltaX = Math.cos(rad1) * radius[radiusIndex];
        let deltaY = Math.sin(rad1) * radius[radiusIndex];

        let index = 0;
        for (let i = 0; i < perCircleFanCnt.length; i++) {
            let cnt = perCircleFanCnt[i];
            let angleDelta = 360 / cnt;
            for (let j = 0; j < cnt; j++) {
                let rad = 2 * Math.PI / 360 * angleDelta * j;
                let x = radius[i] * Math.cos(rad);
                let y = radius[i] * Math.sin(rad);
                let pos = cc.v2(this.node.x - deltaX + x, this.node.y - deltaY + y);
                if (index < this.fans.length) {
                    this.fans[index].setTargetPos(pos);
                    index++;
                } else {
                    return;
                }
            }
        }
    },

    calcAngleDegrees(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    },

    detectIfInObstacle() {
        let result = ObstaclesManager.detectIfInObstacle(this.node.position);
        if (result) {
            this.node.position = result;
            if (this.isAI) {
                if (this.targetFan) {
                    this.forbiddenFans.push(this.targetFan);
                    this.targetFan = null;
                }
                if (this.targetPlayer) {
                    this.forbiddenPlayers.push(this.targetPlayer);
                    this.targetPlayer = null;
                }
                if (this.dangerList && this.dangerList.length > 0) {
                    for (let i = 0; i < this.dangerList.length; i++) {
                        let exist = false;
                        for (let j = 0; j < this.forbiddenDangers.length; j++) {
                            if (this.forbiddenDangers[j].player === this.dangerList[i].player) {
                                exist = true;
                                break;
                            }
                        }
                        if (!exist) {
                            this.forbiddenDangers.push(this.dangerList[i].player);
                        }
                    }
                }
            }
        }
    },

    directionUpdate(deltaX, deltaY) {
        // 0000,down,up,right,left
        let binary = '' + (deltaY < -5 ? 1 : 0) +
            (deltaY > 5 ? 1 : 0) +
            (deltaX > 5 ? 1 : 0) +
            (deltaX < -5 ? 1 : 0);
        this.direction = parseInt(binary, 2);
    },


    // 随机选点，rotation 判断该点是否在障碍物内

    AILogic(dt) {
        this.AILogicTimmer += dt;
        if (this.AILogicTimmer < 0.03) {
            return;
        }
        this.AILogicTimmer = 0;
        // 其他玩家
        this.dangerList = this.getDanger();
        this.gestureState();
        let angle = 0;
        if (this.dangerList.length > 0) {
            if (this.dangerList.length === 1) {
                let subVec = this.node.position.sub(this.dangerList[0].player.node.position);
                if (this.dangerList[0].player === PlayerManager.player) {
                    angle = this.calcAngleDegrees(subVec.x, subVec.y) % 360;
                    let targetPlayerAngle = gameLogic.Joystick._angle % 360;
                    // 如果玩家面向AI跑去
                    if (Math.abs(targetPlayerAngle - angle) > 60) {
                        // 其他粉丝
                        let targetFan = this.getTargetFan();
                        if (targetFan) {
                            let subVec = targetFan.node.position.sub(this.node.position);
                            angle = this.calcAngleDegrees(subVec.x, subVec.y);
                        }
                        if (this.fans.length < 8 && this.fans.length > 2) {
                            this.AIMoveEndEvent();
                        } else {
                            this.AIMoveStartEvent();
                        }
                    } else {
                        this.AIMoveStartEvent();
                    }
                } else {
                    angle = this.calcAngleDegrees(subVec.x, subVec.y);
                }
            } else {
                let subVec1 = this.node.position.sub(this.dangerList[0].player.node.position);
                let subVec2 = this.node.position.sub(this.dangerList[1].player.node.position);
                let angle1 = this.calcAngleDegrees(subVec1.x, subVec1.y);
                let angle2 = this.calcAngleDegrees(subVec2.x, subVec2.y);
                angle = (angle1 + angle2) / 2;

                this.AIMoveStartEvent();
            }
            this.AITrySpeedUp();
        } else {
            this.targetPlayer = this.getTargetPlayer();
            if (this.targetPlayer) {
                let subVec = this.targetPlayer.node.position.sub(this.node.position);
                angle = this.calcAngleDegrees(subVec.x, subVec.y);
                this.AITrySpeedUp();
            } else {
                // 其他粉丝
                let targetFan = this.getTargetFan();
                if (targetFan) {
                    let subVec = targetFan.node.position.sub(this.node.position);
                    angle = this.calcAngleDegrees(subVec.x, subVec.y);
                }
            }
            this.AIMoveStartEvent();
        }

        if (this.detectObstacle(angle)) {
            angle += this.angleDelta;
            this.angleDelta = _.random(90, 270);
            if (this.targetFan) {
                this.forbiddenFans.push(this.targetFan);
                this.targetFan = null;
            }
            if (this.targetPlayer) {
                this.forbiddenPlayers.push(this.targetPlayer);
                this.targetPlayer = null;
            }

            // 单个压入队列即可 ：1个 和 2个危险敌人的时候角度是不一样的
            if (this.dangerList.length > 0) {
                this.forbiddenDangers.push(this.dangerList[0]);
            }
        }

        if (!this.isDefence) {
            let speedVec = cc.v2(Math.cos(angle * (Math.PI / 180)) * this.speed,
                Math.sin(angle * (Math.PI / 180)) * this.speed);
            this.node.x += speedVec.x * dt;
            this.node.y += speedVec.y * dt;
        }
        // 超出边界
        if (this.node.x < -0.5 * playerData.BoundSize.x) {
            this.node.x = -0.5 * playerData.BoundSize.x;
        }
        if (this.node.x > 0.5 * playerData.BoundSize.x) {
            this.node.x = 0.5 * playerData.BoundSize.x;
        }
        if (this.node.y < -0.5 * playerData.BoundSize.y) {
            this.node.y = -0.5 * playerData.BoundSize.y;
        }
        if (this.node.y > 0.5 * playerData.BoundSize.y) {
            this.node.y = 0.5 * playerData.BoundSize.y;
        }

        // 粉丝及猎物清除
        if (!this.curForbiddenTime) {
            this.curForbiddenTime = 0;
        }
        this.curForbiddenTime += dt;
        if (this.curForbiddenTime > this.clearForbiddenCd) {
            this.curForbiddenTime = dt;
            this.forbiddenFans = [];
            this.forbiddenPlayers = [];
        }
        // 危险玩家清除
        if (!this.curClearDangersTime) {
            this.curClearDangersTime = 0;
        }
        this.curClearDangersTime += dt;
        if (this.curClearDangersTime > this.clearDangersCd) {
            this.curClearDangersTime = dt;
            this.forbiddenDangers = [];
        }
    },

    // AIDefence() {
    //
    // },

    detectObstacle(angle) {
        let rad = cc.misc.degreesToRadians(angle)
        let detectPoint = cc.v2(200, 0).rotate(rad);
        let f = Math.random() + 2;
        detectPoint = detectPoint.mul(f);

        let worldVec = this.node.convertToWorldSpaceAR(detectPoint);
        let localVec = ObstaclesManager.obstacle.convertToNodeSpaceAR(worldVec);
        if (ObstaclesManager.detectIfInObstacle(localVec)) {
            return true;
        }
        return false;
    },

    TrySpeedUpGuide() {
        if (this.isAI) {
            return;
        }
        if (this.speedUpNowTime > 0) {
            return;
        }
        let speedUpGuided = playerData.gameData.speedUpGuide;
        if (speedUpGuided) {
            return;
        }
        for (let i = 0; PlayerManager.players && i < PlayerManager.players.length; i++) {
            let player = PlayerManager.players[i];
            if (player !== this && player.node.active) {
                let index = this.forbiddenDangers.indexOf(player);
                if (index > 0) {
                    continue;
                }
                if (this.circleIntersect(cc.Canvas.instance.node.width, this.node.position, player.node.position)) {
                    clientEvent.dispatchEvent('speedUpGuide', this);
                    break;
                }
            }
        }
    },

    // AI 尝试加速
    AITrySpeedUp() {
        return;
        if (this.propUseCnt >= this.propUseTotalCnt) {
            return;
        }
        // AI 延迟使用道具
        if (playerData.fadeTime < this.propUseTimeDelay) {
            return;
        }
        // -- 加速 --
        if (this.speedUpNowTime < 0) {
            let random = Math.random();
            if (random > this.propUseRate) {
                this.speedUpNowTime = this.propFailCd;
            } else {
                this.speedUp(constants.speedType.gold);
            }
        }
    },

    // 危险检测
    getDanger() {
        let dangerList = [];
        for (let i = 0; PlayerManager.players && i < PlayerManager.players.length; i++) {
            let player = PlayerManager.players[i];
            if (player !== this && player.node.active) {
                let index = this.forbiddenDangers.indexOf(player);
                if (index > 0) {
                    continue;
                }
                if (this.circleIntersect(this.dangerDetectDistance, this.node.position, player.node.position) &&
                    player.getFansAmount() > this.getFansAmount()) {
                    let dis = this.node.position.sub(player.node.position).mag();
                    dangerList.push({
                        distance: dis,
                        player: player
                    });
                }
            }
        }
        dangerList.sort(function(a, b) {
            return a.distance - b.distance;
        });
        return dangerList;
    },

    /**
     * 判断是否显示加速的手势
     */
    gestureState() {
        if (!this.isAI) {
            return;
        }

        let frameGestureJudge = false;

        for (let i = 0; i < PlayerManager.players.length; i++) {
            let player = PlayerManager.players[i];
            if (player !== this && player.node.active) {
                let index = this.forbiddenDangers.indexOf(player);
                if (index > 0 || player.isAI) {
                    continue;
                }

                if (this.circleIntersect(1000, this.node.position, player.node.position)) {
                    // console.log("玩家接近敌人，加速");
                    if (this.setTime) {
                        this.setTime = null;
                    }
                    clientEvent.dispatchEvent('showGestures', true);
                    frameGestureJudge = true;
                }
            }
        }

        if (!frameGestureJudge) {
            this.setTime = setTimeout(() => {
                clientEvent.dispatchEvent('showGestures', false);
            }, 1000);
        }
    },


    getTargetPlayer() {
        if (!this.aiStrategy) {
            return;
        }
        let targetPlayer = null;
        for (let i = 0; PlayerManager.players && i < PlayerManager.players.length; i++) {
            let player = PlayerManager.players[i];
            if (player !== this && player.node.active && !player.getInvincibility()) {
                // 是否已禁用玩家
                let index = this.forbiddenPlayers.indexOf(player);
                if (index >= 0) {
                    continue;
                }
                if (this.getFansAmount() - player.getFansAmount() >= this.aiStrategy.fansDelta) {
                    if (!targetPlayer) {
                        if (this.circleIntersect(this.aiStrategy.detectionRange, this.node.position, player.node.position)) {
                            targetPlayer = player;
                        }
                    } else {
                        if (this.circleIntersect(this.aiStrategy.detectionRange, this.node.position, targetPlayer.node.position) &&
                            this.circleIntersect(this.aiStrategy.detectionRange, this.node.position, player.node.position)) {
                            targetPlayer = null;
                        } else {
                            let dis1 = this.node.position.sub(targetPlayer.node.position).mag();
                            let dis2 = this.node.position.sub(player.node.position).mag();
                            targetPlayer = dis1 < dis2 ? targetPlayer : player;
                        }
                    }
                }
            }
        }
        // 新手保护机制
        if (targetPlayer === PlayerManager.player) {
            if (PlayerManager.player.characterLv < 6 && playerData.protectTime > 0) {
                targetPlayer = null
            }
        }
        return targetPlayer;
    },

    getTargetFan() {
        if (this.targetFan && !this.targetFan.hostPlayer && !this.targetFan.node.active) {
            return this.targetFan;
        }
        this.targetFan = null;
        let minDistance = Number.MAX_VALUE;
        for (let i = 0; i < FansManager.fans.length; i++) {
            let fan = FansManager.fans[i];
            if (!fan.node.active) {
                return;
            }
            // 是否已禁用粉丝
            let index = this.forbiddenFans.indexOf(fan);
            if (index >= 0) {
                continue;
            }
            if (!fan.hostPlayer) {
                // 模糊匹配，减缓吃粉丝速度
                let fuzzyMatching = false;
                if (this.lvInfo) {
                    fuzzyMatching = Math.random() > this.lvInfo.errorRate;
                }

                if (this.circleIntersect(minDistance, this.node.position, fan.node.position) && fan.isReleased) {
                    let dis = fan.node.position.sub(this.node.position).mag();
                    minDistance = dis;
                    this.targetFan = fan;

                    if (fuzzyMatching && minDistance < 2000) {
                        break;
                    }
                }
            }
        }
        return this.targetFan;
    },

    playAnimation(dt) {
        return;
    },

    showKillEffect () {
        resourceUtil.createEffect('fight/killEffect/killEffect', (err, node)=>{
            if (err) {
                return;
            }

            let ani = node.getComponent(cc.Animation);
            ani.once('finished', ()=>{
                node.destroy();
            }, this);

            ani.play();
        }, this.nodeBody);
    },

    onRageOver () {
        //速度初始化
        if (this.speedUpNowTime <= 0) {
            this.speed = this.initSpeed;
        }

        //去除无敌
        this.invincibility = false;

        if (this.rageEffect) {
            this.rageEffect.destroy();
            this.rageEffect = null;
        }
    },

    /**
     * 触发暴走
     */
    showRage () {
        resourceUtil.createEffect('fight/rage/rage', (err, node)=>{
            if (err) {
                return;
            }

            let ani = node.getComponent(cc.Animation);
            ani.play();

            this.rageEffect = node;
        }, this.nodeRageParent);

        //定时5秒
        //加速
        this.speed = SPEED_UP_RATIO * this.initSpeed;
        //无敌
        this.invincibility = true;

        this.scheduleOnce(this.onRageOver, 5);
    },

    //击杀某人后
    onKillSomeone (who) {
        //播放击杀特效
        this.showKillEffect();

        //累积击杀人数
        this.killCnt++;
        this.continueKillCnt++;

        if (!this.isAI) {
            if (this.continueKillCnt > 0 && this.continueKillCnt % 3 === 0) {
                //触发暴走,每连续杀3个触发一次
                this.showRage();
            }
        }
    
    },

    // 被击杀
    beKilled(murder) {
        if (this.invincibility) {
            return;
        }
        if (!this.node.active) {
            return;
        }
        this.node.active = false;

        this.continueKillCnt = 0;

        while (this.fans.length > 0) {
            let targetFan = this.fans[this.fans.length - 1];
            targetFan.throwKnife(ThrowType.Dead);
            this.removeFan(targetFan);
        }

        // if (PlayerManager.player === this) {
        //     cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.DEAD);
        // }

        if (this.playerHead) {
            let playerInfo = localConfig.queryByID('player', this.playerHead);
            if (playerInfo.sex === 0) {
                //男性
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.DEAD_BOY);
            } else {
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.DEAD_GIRL);
            }   
        }
        

        this.destroySpeedUp();

        PlayerManager.addDieEffect(this);

        if (this.nameNode) {
            this.nameNode.active = false;
        }
        if (this.fansCntLb) {
            this.fansCntLb.node.active = false;
        }
        if (this.fansCntBg) {
            this.fansCntBg.active = false;
        }
        murder.targetPlayer = null;
        murder.onKillSomeone(this);

        clientEvent.dispatchEvent('killPlayerUI',
            {murder: murder, victim: this});
    },

    onDestroy() {
        
        clientEvent.off('_touchEndEvent', this._touchEndEvent.bind(this));
        clientEvent.off('_touchStartEvent', this._touchStartEvent.bind(this));
    }
});
