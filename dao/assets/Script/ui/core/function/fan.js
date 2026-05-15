const clientEvent = kf.require('basic.clientEvent');
const playerData = require('playerData');
const constants = require('constants');

window.KnifeState = cc.Enum({
    Normal: -1,
    Capture: -1,
    CaptureFinish: -1,
    Attack: -1,
    Defence: -1,
    Release: -1,
    Init: -1
});

window.ThrowType = cc.Enum({
    SelfRelease: -1,
    Collision: -1,
    Dead: -1
});

cc.Class({
    extends: cc.Component,
    properties: {
        changeSpeed: 500,
        adjustMoreSpeed: 200,
        adjustLessSpeed: 400,
        captureSpeed: 600,
        releaseSpeed: 1500,
        releaseRotation: 1E3,
        rollRotation: 0,
    },
    onLoad: function() {
        this.changeTime = 0.2;
        this.knifeCountComp = {maxCount: 20, index: 1};
        this.knifeState = KnifeState.Normal;
        this.isDefence = true;
        this.isRelease = false;
        this.isReleased = true;
        this.node.on("dance", this.dance, this);

        clientEvent.on("startChangeToDefence", this.startChangeToDefence.bind(this), this);
        clientEvent.on("startChangeToAttack", this.startChangeToAttack.bind(this), this);
    },

    dance: function(a) {
        if (this.startDance) {
            return;
        }
        var b;
        this.startDance = true;
        for (var c, d = 40, e = [], m = 5; 0 < m; m--) c = m / 15 * a / 4, d -= 2, c = cc.sequence(cc.rotateBy(c, d), cc.rotateBy(c,
            -d), cc.rotateBy(c, -d), cc.rotateBy(c, d)), e.push(c);
        a = (b = cc).sequence.apply(b, e);
        this.node.runAction(a)
    },

    getFinalPosition: function() {
        if (!this.hostPlayer) {
            return;
        }
        this.acceleration = 0;
        var a = this.hostPlayer.getFansAmount();
        var b = this.hostPlayer.fans.indexOf(this);
        var d = this.getRadiusByKnifeCount(a);
        d = this.isDefence ? d - 90 : d;
        this.rollRotation = 360 / a * b;
        a = Math.sin(this.rollRotation * Math.PI / 180) * d;
        b = Math.cos(this.rollRotation * Math.PI / 180) * d;
        return cc.v2(b, a)
    },

    startChangeToAttack: function(player) {
        if (!this.hostPlayer || this.hostPlayer !== player) {
            return;
        }

        if (!this.isDefence) {
            return;
        }

        let self = this;
        self.isDefence = false;
        this.finalPosition = this.getFinalPosition();
        if (cc.gameSpace.gameLogic.isInScreenExternal(player.node)) { // 在屏幕外
            this.rotateKnifeNoAnim();
        } else {
            let delay = (this.knifeCountComp.index > 20 ? 20 : this.knifeCountComp.index) * 20;
            setTimeout(function() {
                self.rotateKnife();
            }, delay)
        }
    },

    startChangeToDefence: function(player) {
        if (!this.hostPlayer || this.hostPlayer !== player) {
            return;
        }

        if (this.isDefence) {
            return;
        }

        this.isDefence = true;
        this.finalPosition = this.getFinalPosition();

        if (cc.gameSpace.gameLogic.isInScreenExternal(player.node)) { // 在屏幕外
            this.rotateKnifeNoAnim();
        } else {
            let delay = (this.knifeCountComp.index > 20 ? 20 : this.knifeCountComp.index) * 20;
            setTimeout(function() {
                this.rotateKnife();
            }.bind(this), delay);
        }

    },

    /**
     * 没动画版本的转动刀
     */
    rotateKnifeNoAnim: function() {
        if (this.node) {
            let targetRotation = this.isDefence ? 90 - this.rollRotation : 540 - this.rollRotation;
            this.node.angle = targetRotation;
        }
    },

    // 转动到 从横刀到直刀
    rotateKnife: function() {
        let self = this;
        if (this.node) {
            let targetRotation = this.isDefence ? 90 - this.rollRotation : 540 - this.rollRotation;
            if (this.lastRotation !== targetRotation) {
                this.isRotating = true;
                this.lastRotation = targetRotation;
                let fanNode = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
                let playerNode = PlayerManager.player.node.convertToWorldSpaceAR(cc.v2(0, 0));
                if (!this.circleIntersect(1600, fanNode, playerNode)) {
                    this.node.angle = targetRotation;
                    self.isRotating = false;
                } else {
                    let rotateAction = cc.rotateTo(this.changeTime, targetRotation);
                    let rotateActionEnd = cc.callFunc(function() {
                        self.isRotating = false;
                    });
                    this.node.stopAllActions();
                    this.node.runAction(cc.sequence(rotateAction, rotateActionEnd));
                }
            } else if (this.isRotating || this.node.angle !== targetRotation) {
                this.node.angle = targetRotation;
            }
        }
    },

    getThrowPosition: function() {
        return this.releasePosition;
    },

    updateLogic: function() {
        switch (this.knifeState) {
            case KnifeState.Init:
                if (!this.hostPlayer) {
                    return;
                }
                this.finalPosition = this.getFinalPosition();
                this.node.position = this.finalPosition;
                this.knifeState = KnifeState.Normal;
                break;
            case KnifeState.Capture:
                this.isCapture = true;
                this.finalPosition = this.getFinalPosition();
                break;
            case KnifeState.Attack:
                this.startDance = false;
                break;
            case KnifeState.Release:
                this.isRelease = true;
                this.startDance = false;
                this.finalPosition = this.getThrowPosition();
                break;
            case KnifeState.Normal:
                this.finalPosition = this.getFinalPosition();
                break;
        }
        // 只在吃刀的时候进行更新
        // this.rotateKnife();
        // this.setScale();
    },

    setScale: function() {
        var a = 0.05 * this.knifeCountComp.index + 0.8;
        a = 1.4 < a ? 1.4 : a;
        // this.node.scale !== a && (this.node.scale = a)
        this.node.scale = a;
    },

    circleIntersect(len, pos1, pos2) {
        const x1 = pos1.x;
        const x2 = pos2.x;
        const y1 = pos1.y;
        const y2 = pos2.y;

        if (len * len < (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) {
            return false;
        }
        return true;
    },

    update: function(a) {
        this.updateLogic();
        if (PlayerManager.player) {
            // 屏幕外的飞刀暂时去掉皮肤
            let fanNode = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let playerNode = PlayerManager.player.node.convertToWorldSpaceAR(cc.v2(0, 0));
            if (!this.circleIntersect(1600, fanNode, playerNode)) {
                this.node.getComponent(cc.Sprite).enabled = false;
            } else {
                this.node.getComponent(cc.Sprite).enabled = true;
            }
        }

        if (!this.hostPlayer) {
            let result = ObstaclesManager.detectIfInObstacleByNode(this.node);
            if (result) {
                this.node.position = result;
            }
            // 超出边界就回缩--
            let padding = this.node.width / 2;
            result = this.checkOutBound(padding);
            if (result) {
                this.node.position = result;
            }
            return;
        }
        var c = this;
        if (this.finalPosition && (this.finalPosition.x !== this.node.position.x || this.finalPosition.y !== this.node.position.y)) {
            var d = this.finalPosition.sub(this.node.position),
                h = d.mag();
            if (this.moveDistance = this.changeSpeed * a, this.isAdjust && (this.isMore ? this.moveDistance = this.adjustMoreSpeed * a : this.moveDistance = this.adjustLessSpeed *
                    a), this.isCapture && (this.moveDistance = this.captureSpeed * a), this.isRelease && (this.moveDistance = this.releaseSpeed * a, this.node.angle += this.releaseRotation * a), this.acceleration += 150 * a, this.moveDistance += this.acceleration, this.moveDistance < h) this.node.position = this.node.position.add(d.mul(this.moveDistance / h));
            else if (this.node.position = this.finalPosition, this.isAdjust && (this.isAdjust = !1), this.isCapture && (this.isCapture = !1), this.isRelease) a = cc.rotateBy(.5, this.releaseRotation * 0.5), d = cc.callFunc(function() {
                c.isRelease = false
            }),
                this.node.runAction(cc.sequence(a, d)) // 飞刀被吃刀正确位置上的动画
        }

        // 超出边界就回缩--
        let padding = this.node.width / 2;
        let result = this.checkOutBound(padding);
        if (result) {
            this.node.position = result;
        }
    },

    checkOutBound(padding) {
        let worldVec = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let localVec = PlayerManager.playerParent.convertToNodeSpaceAR(worldVec);
        // 不能超出边界
        let isOut = false;
        if (localVec.x < -0.5 * playerData.BoundSize.x + padding) {
            localVec.x = -0.5 * playerData.BoundSize.x + padding;
            worldVec = PlayerManager.playerParent.convertToWorldSpaceAR(localVec);
            localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            return localVec;
        }
        if (localVec.x > 0.5 * playerData.BoundSize.x - padding) {
            localVec.x = 0.5 * playerData.BoundSize.x - padding;
            worldVec = PlayerManager.playerParent.convertToWorldSpaceAR(localVec);
            localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            return localVec;
        }
        if (localVec.y < -0.5 * playerData.BoundSize.y + padding) {
            localVec.y = -0.5 * playerData.BoundSize.y + padding;
            worldVec = PlayerManager.playerParent.convertToWorldSpaceAR(localVec);
            localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            return localVec;
        }
        if (localVec.y > 0.5 * playerData.BoundSize.y - padding) {
            localVec.y = 0.5 * playerData.BoundSize.y - padding;
            worldVec = PlayerManager.playerParent.convertToWorldSpaceAR(localVec);
            localVec = this.node.parent.convertToNodeSpaceAR(worldVec);
            return localVec;
        }
        return false;
    },

    getRadiusByKnifeCount: function(a) {
        return 120 + 120 * this.getRadioByCount(a);
    },

    getRadioByCount: function(a) {
        return (8 > a ? 0 : 20 < a ? 12 : a - 8) / 12 + 1;
    },

    onCollisionEnter: function(other, self) {
        if (playerData.gameState !== constants.GAME_STATE.PLAY) {
            return;
        }
        switch (other.node.group) {
            case "knife":
                // 其他人碰撞和防御攻击判断
                if (this.hostPlayer) {
                    let otherFanComp = other.node.getComponent("fan");
                    if (otherFanComp) {
                        if (!otherFanComp.hostPlayer) {
                            if (!otherFanComp.isReleased) {
                                return;
                            }
                            this.hostPlayer.addFan(otherFanComp);
                            if (this.hostPlayer === PlayerManager.player) {
                                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.GRAB);
                            }
                            FansManager.addFansTip(otherFanComp, this.hostPlayer);
                        } else {
                            // 相互碰撞--
                            if (otherFanComp.hostPlayer.node.active &&
                                this.hostPlayer && this.hostPlayer.node.active &&
                                otherFanComp.hostPlayer !== this.hostPlayer &&
                                !this.isDefence) {
                                
                                if (!this.hostPlayer.isAI && window.wx && playerData.vibrateOn) {
                                    wx.vibrateShort();
                                }

                                this.node.parent.getComponent('PlayerRotate').stopRotate();
                                this.throwKnife(ThrowType.Collision, other, self);
                                this.hostPlayer.removeFan(this);
                                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                                FansManager.playSpark(worldPos);
                            }
                        }
                    }
                }
                break;
            case "block":
                if (this.hostPlayer) {
                    if (!this.hostPlayer.isAI && window.wx && playerData.vibrateOn) {
                        wx.vibrateShort();
                    }

                    this.node.parent.getComponent('PlayerRotate').stopRotate();
                    this.throwKnife(ThrowType.Collision, other, self);
                    this.hostPlayer.removeFan(this);
                    let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    FansManager.playSpark(worldPos);
                }
                break;
            case "player":
                let player = other.node.getComponent("Player");
                if (player) {
                    if (!this.hostPlayer) {
                        if (this.isReleased) {
                            player.addFan(this);
                            if (this.hostPlayer === PlayerManager.player) {
                                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.GRAB);
                            }
                            FansManager.addFansTip(this, this);
                        }
                    } else {
                        if (this.hostPlayer !== player) {
                            player.beKilled(this.hostPlayer);
                        }
                    }
                }
                break;
        }
    },

    onCollisionStay: function(other, self) {
        if (playerData.gameState !== constants.GAME_STATE.PLAY) {
            return;
        }
        switch (other.node.group) {
            case "player":
                let player = other.node.getComponent("Player");
                if (player) {
                    if (!this.hostPlayer) {
                        if (this.isReleased) {
                            player.addFan(this);
                            if (this.hostPlayer === PlayerManager.player) {
                                cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.GRAB);
                            }
                            FansManager.addFansTip(this, this);
                        }
                    } else {
                        if (this.hostPlayer !== player) {
                            player.beKilled(this.hostPlayer);
                        }
                    }
                }
                break;
        }
    },

    onCollisionEnterByCircle() {
        if (this.hostPlayer) { // && !this.isDefence 防御状态下也会掉刀
            if (!this.hostPlayer.isAI) {
                cc.log('碰撞');
                if (window.wx && window.wx.vibrateShort) {
                    window.wx.vibrateShort();
                }
            }

            this.node.parent.getComponent('PlayerRotate').stopRotate();
            this.throwKnife(ThrowType.Collision);
            this.hostPlayer.removeFan(this);
            let worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
            FansManager.playSpark(worldPos);
        }
    },

    /**
     * 掉刀
     * @param {*} throwType
     * @param {*} other
     * @param {*} self
     */
    throwKnife(throwType, other, self) {
        let rotatedPosition = cc.v2(0, 0);
        var pos = this.node.position;
        var posV2 = new cc.v2(pos.x, pos.y);
        let randomRad = 0;
        switch (throwType) {
            case ThrowType.Collision:
                randomRad = -Math.PI / 3;
                posV2.rotate(randomRad, rotatedPosition);
                if (PlayerManager.player === this.hostPlayer) {
                    // setAudio("crashSword", false, 1, true);
                    cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.CRASH_SWORD);
                }
                break;
            case ThrowType.SelfRelease:
                randomRad = -Math.PI / 3;
                posV2.rotate(randomRad, rotatedPosition);
                if (PlayerManager.player === this.hostPlayer) {
                    
                    cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.LOSE_SWORD);
                }
                break;
            case ThrowType.Dead:
                randomRad = Math.random() * Math.PI;
                posV2.rotate(randomRad, rotatedPosition);
                break;
        }

        let f = Math.random() + 2;
        let deltaVec = rotatedPosition.mul(f);
        rotatedPosition = rotatedPosition.add(deltaVec);

        let worldVec1 = this.node.parent.convertToWorldSpaceAR(rotatedPosition);
        let localVec1 = FansManager.fanParent.convertToNodeSpaceAR(worldVec1);

        let worldVec2 = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let localVec2 = FansManager.fanParent.convertToNodeSpaceAR(worldVec2);

        this.node.position = localVec2;
        this.node.scale = 1;
        this.node.parent = FansManager.fanParent;


        let rotateBy = cc.rotateBy(.3, 360 + Math.random() * 180);
        let actionBy = cc.moveTo(.3, localVec1);
        setTimeout(function() {
            if (this && this.isValid) {
                this.isReleased = true;
                this.knifeState = KnifeState.Normal;
            }
        }.bind(this), 1000);

        this.node.runAction(cc.spawn(rotateBy, actionBy));
    },
});
