const clientEvent = kf.require('basic.clientEvent');
const localConfig = require('localConfig');
const playerData = require('playerData');
const gameLogic = require('gameLogic');
const constants = require('constants');
const resourceUtil = require('resourceUtil');

const PropType = {
    Magnet: 0,
    DoubleFan: 1,
    SpeedUp: 2
};
cc.Class({
    extends: cc.Component,
    properties: {
        killTipUI: cc.Node,
        countDownLb: cc.Label,
        timeOverPrefab: cc.Prefab,
        deadPanelPrefab: cc.Prefab,
        killCntLb: cc.Label,
        propBtn: cc.Node,
        speedBtn: cc.Node,
        speedUpSf: cc.SpriteFrame,
        leftTimeTip: cc.Node,
        leftTimeTipLb: cc.Label,
        readyGo: cc.Node,
        guideUI: cc.Node,
        readyEnd: cc.Node,
        readyEndLb: cc.Label,
        freePrompt: cc.Node, // 免费提示
        gestures: cc.Node, // 点击的手势
        screenShootAnim: cc.Animation,
        victoryAnim: cc.Animation,
        aniSpeedIcon: cc.Animation,

        otherBtn1: cc.Node,
        image1: cc.Node,
        nameLb1: cc.Label,

        speedUpGuide1: cc.Node,
        speedUpGuide2: cc.Node,
        curTishi: cc.Sprite,
        tishiArr: [cc.SpriteFrame]
    },

    onLoad() {
        this.isKillPlayerTipPlaying = false;
        this.leftTimeTip.active = false;
        this.propAnim = this.propBtn.getComponent(cc.Animation);
        this.propAnim.on('finished', this.propAnimFinish.bind(this));
        this.speedAnim = this.speedBtn.getComponent(cc.Animation);
        this.speedAnim.on('finished', this.goldSpeedAnimFinish.bind(this));
        this.killTipUIAnim = this.killTipUI.getComponent(cc.Animation);

        this.guideLogic();
        playerData.gameState = constants.GAME_STATE.PLAY;
        if (playerData.todayFirstLogin) {
            this.freePrompt.active = true;
            this.gestures.active = true;
        } else {
            this.freePrompt.active = false;
            this.gestures.active = false;
        }

        this.killTipQueue = [];

        clientEvent.on('_touchStartEvent', this._touchStartEvent.bind(this));
        clientEvent.on('speedUpGuide', this.speedUpGuide.bind(this));
    },

    onEnable () {
        cc.gameSpace.audioManager.stop(constants.AUDIO_MUSIC.BACKGROUND);
        cc.gameSpace.audioManager.playMusic(constants.AUDIO_MUSIC.FIGHT, true);
    },

    onDisable () {
        cc.gameSpace.audioManager.stop(constants.AUDIO_MUSIC.FIGHT);
        cc.gameSpace.audioManager.playMusic(constants.AUDIO_MUSIC.BACKGROUND, true);
    },

    speedUpGuide() {
        this.speedUpGuide2.active = true;
    },

    update(dt) {
        if (!this.isKillPlayerTipPlaying && this.killTipQueue.length > 0) {
            let data = this.killTipQueue.shift();
            this.killPlayerTip(data);
        }
    },

    showOtherGameBtn(image, nameLb, randomIndex) {
        let gameData = this.arrOtherGame[randomIndex];
        resourceUtil.setGameIcon(gameData.icon, image.getComponent(cc.Sprite), ()=>{});
        nameLb.string = gameData.name;
        this.recommendGame = gameData;
    },

    propAnimFinish() {
        if (!this.isValid) {
            return;
        }

        this.aniSpeedIcon.play();
    },

    goldSpeedAnimFinish() {
        if (!this.isValid) {
            return;
        }

        if (this.speedAnim.currentClip.name === 'goldPropCd') {
            this.speedAnim.play('speedBtnAnim');
        }
    },

    _touchStartEvent() {
        this.guideClose();
    },

    guideLogic() {
        this.speedUpGuide1.active = false;
        this.speedUpGuide2.active = false;
        this.guideUI.active = false;
        let roundCnt = playerData.gameData.roundCnt;
        if (roundCnt) {
            let cnt = parseInt(roundCnt);
            if (cnt < 2) {
                this.guideUI.active = true;
            } else {
                this.guideUI.active = false;
            }
            cnt++;
            playerData.updateRoundCnt(cnt);
        } else {
            this.guideUI.active = true;
            playerData.updateRoundCnt(1);
        }
    },

    start() {
        this.propType = PropType.SpeedUp;

        // 新手保护
        playerData.protectTime = 30;
        playerData.fadeTime = 0;
        playerData.BoundSize = cc.v2(4500, 4500);
        this.totalTime = 150;
        this.setLeftTime();
        this.killCnt = 0;
        this.killCntLb.string = this.killCnt;
        this.killTipUI.opacity = 0;
        this.cdId = setInterval(function() {
            if (!this.isValid) {
                return;
            }
            if (playerData.gameState === constants.GAME_STATE.PLAY) {
                this.totalTime -= 1;
                playerData.fadeTime++;
                playerData.protectTime--;
                this.setLeftTime();
                if (this.totalTime <= 5) {
                    this.readyEnd.active = true;
                    if (this.totalTime === 0) {
                        this.readyEndLb.string = "没时间了";
                    } else {
                        this.readyEndLb.string = this.totalTime;
                    }
                    cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.COUNT_DOWN);
                }
                if (this.totalTime <= 0) {
                    this.timeOver();
                    clearInterval(this.cdId);
                    return;
                }
                if (this.totalTime === 60) {
                    PlayerManager.changeAllAIStrategy();
                }
                if (this.totalTime === 60 || this.totalTime === 30 || this.totalTime === 10) {
                    this.leftTimeTipLb.string = this.totalTime;
                    this.leftTimeTip.active = true;
                    setTimeout(function() {
                        if (this && this.leftTimeTip) {
                            this.leftTimeTip.active = false;
                        }
                    }.bind(this), 2000);
                }
            }
            if (playerData.gameState === constants.GAME_STATE.GAME_OVER) {
                this.gameOver();
                clearInterval(this.cdId);
                return;
            }
        }.bind(this), 1000);

        // 道具
        this.propBtn.on('click', this.prop.bind(this));
        this.speedBtn.on('click', this.speed.bind(this));
        // todo 隐藏冲刺功能
        this.speedBtn.active = false;
        clientEvent.on('killPlayerUI', this.killPlayerUI.bind(this));
        clientEvent.on("showGestures", this.showGestures.bind(this));

        // 随机文案
        if (this.tishiArr.length > 0) {
            this.curTishi.spriteFrame = this.tishiArr[0];
            var actionFunc = function() {
                var action = cc.fadeOut(0.5);
                var action1 = cc.fadeIn(0.5);
                var allAction = cc.sequence(action1, cc.delayTime(5), action, cc.delayTime(2), cc.callFunc(function() {
                    var index = 0;
                    if (MapManager.isAboutToReduceMap()) {
                        index = 5;
                    } else {
                        index = (Math.random() * this.tishiArr.length) | 0;
                        if (index === 5) {
                            index++;
                        }
                    }
                    this.curTishi.active = false;
                    this.curTishi.spriteFrame = this.tishiArr[index];
                    actionFunc();
                }.bind(this)));
                this.curTishi.active = true;
                this.curTishi.node.stopAllActions();
                this.curTishi.node.runAction(allAction);
            }.bind(this);
            actionFunc();
        }
    },

    showGestures(state) {
        let animState = this.propAnim.getAnimationState('propCd');
        if (animState.isPlaying) {
            this.gestures.active = false;
            return;
        }
        this.gestures.active = state;
    },

    guideClose() {
        if (this && this.guideUI && playerData.gameState === constants.GAME_STATE.PLAY) {
            this.guideUI.active = false;
        }
    },

    showPropReward () {
        if (!this.isValid) {
            return;
        }
        switch (this.propType) {
            case PropType.Magnet:
                PlayerManager.magnet();
                break;
            case PropType.DoubleFan:
                PlayerManager.doubleFan();
                break;
            case PropType.SpeedUp:
                PlayerManager.speedUp();
                break;
        }

        this.propBtn.active = false;

        this.aniSpeedIcon.setCurrentTime(0);
        this.aniSpeedIcon.stop();
        this.propAnim.play("propCd");
        setTimeout(() => {
            if (PlayerManager && PlayerManager.player) {
                PlayerManager.player.setInvincibility(false);
            }
        }, 2000);
        playerData.gameState = constants.GAME_STATE.PLAY;
    },

    prop() {
        if (playerData.gameState !== constants.GAME_STATE.PLAY) {
            return;
        }

        let animState = this.propAnim.getAnimationState('propCd');
        if (animState.isPlaying) {
            return;
        }

        if (PlayerManager.player.speedUpNowTime > 0) {
            return;
        }

        PlayerManager.player.setInvincibility(true);
        this.showPropReward();
    },

    speed() {
        if (playerData.gameState !== constants.GAME_STATE.PLAY) {
            return;
        }

        let animState = this.speedAnim.getAnimationState('goldPropCd');
        if (animState.isPlaying) {
            return;
        }

        if (PlayerManager.player.speedUpNowTime > 0) {
            return;
        }

        PlayerManager.speedUp(constants.speedType.gold);
        this.speedAnim.play("goldPropCd");

        // 加速引导
        playerData.finishSpeedGuide();
        this.speedUpGuide1.active = false;
        this.speedUpGuide2.active = false;
        let targetSprintLevel = localConfig.queryOne("growUpLevel", "level", playerData.sprintLevel);
        if (targetSprintLevel) {
            if (++PlayerManager.player.goldSpeedNum >= targetSprintLevel.sprintCount) {
                this.speedBtn.active = false;
            }
        }
    },

    setLeftTime() {
        let time = this.totalTime < 0 ? 0 : this.totalTime;
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        if (minutes > 0) {
            if (seconds < 10) {
                this.countDownLb.string = minutes + "/0" + seconds;
            } else {
                this.countDownLb.string = minutes + "/" + seconds;
            }
        } else {
            if (seconds < 10) {
                this.countDownLb.string = "0/0" + seconds;
            } else {
                this.countDownLb.string = "0/" + seconds;
            }
        }
    },

    gameOver() {
        playerData.gameState = constants.GAME_STATE.GAME_OVER;
        this.overLogic();
    },

    overLogic() {
        if (!this.node) {
            return;
        }
        if (this.deadPanel) {
            this.deadPanel.destroy();
        }

        gameLogic.saveScore();

        setTimeout(function() {
            if (!this.isValid) {
                return;
            }
            this.readyEnd.active = false;
            let rank = PlayerManager.players.indexOf(PlayerManager.player);
            switch (rank) {
                case 0:
                    this.victoryAnim.play();
                    playerData.AILevelUp();
                    break;
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                case 5:
                case 6:
                case 7:
                    playerData.AILevelDown();
                    break;
            }
            // 截图音效
            setTimeout(function() {
                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.SCREEN_SHOOT);
                let startY = (cc.Canvas.instance.node.height - 576) / 2;
                let tempFilePath = null;
                if (window.wx) {
                    try {
                        canvas.toTempFilePath({
                            x: 0,
                            y: startY,
                            width: 720,
                            height: 576,
                            destWidth: 720,
                            destHeight: 576,
                            success: (res) => {
                                tempFilePath = res.tempFilePath;
                            }
                        })
                    } catch (e) {
                    }
                }
                this.screenShootAnim.play();
                setTimeout(function() {
                    if (!this.isValid) {
                        return;
                    }
                    let timeOverUI = cc.instantiate(this.timeOverPrefab);
                    timeOverUI.parent = this.node;
                    let timeOverScript = timeOverUI.getComponent('uiTimeOver');
                    if (timeOverScript) {
                        timeOverScript.setData(tempFilePath);
                    }
                }.bind(this), 400);
            }.bind(this), 500);
        }.bind(this), 800);

    },

    timeOver() {
        playerData.gameState = constants.GAME_STATE.TIME_OVER;
        this.overLogic();
    },

    killPlayerUI(data) {
        if (!this.killCntLb) {
            return;
        }
        if (data.victim === PlayerManager.player) {
            gameLogic.saveScore();
            this.deadPanel = cc.instantiate(this.deadPanelPrefab);
            this.deadPanel.parent = this.node;
            this.deadPanel.position = cc.v2(0, 0);
        }
        if (PlayerManager.player) {
            this.killCntLb.string = PlayerManager.player.killCnt;
        }

        this.killTipQueue.push(data);

        // 如果所有AI死亡，游戏结束
        let allAiDie = true;
        for (let i = 0; i < PlayerManager.players.length; i++) {
            if (PlayerManager.player !== PlayerManager.players[i]) {
                if (PlayerManager.players[i].node.active) {
                    allAiDie = false;
                }
            }
        }
        if (allAiDie) {
            if (data.murder === PlayerManager.player) { // 主角击杀了最后一ai
                playerData.killLastAi = true;
            } else {
                playerData.killLastAi = false;
            }
            playerData.gameState = constants.GAME_STATE.GAME_OVER;
        } else {
            playerData.killLastAi = false;
        }
    },

    killPlayerTip(data) {
        this.isKillPlayerTipPlaying = true;
        let tipScript = this.killTipUI.getComponent('killTip');
        tipScript.setName(data);
        this.killTipUIAnim.play();
        cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.KILL);

        if ((data.murder && !data.murder.isAI) || (data.victim && !data.victim.isAI)) {
            if (window.wx && playerData.vibrateOn) {
                wx.vibrateLong();
            }
        }

        setTimeout(function() {
            this.isKillPlayerTipPlaying = false;
        }.bind(this), 1000);
    },

    onDestroy() {
        clearInterval(this.cdId);
        clientEvent.off('_touchStartEvent', this._touchStartEvent.bind(this));
        clientEvent.off('killPlayerUI', this.killPlayerUI.bind(this));
        clientEvent.off("showGestures", this.showGestures.bind(this));
        clientEvent.off('speedUpGuide', this.speedUpGuide.bind(this));

    }

});
