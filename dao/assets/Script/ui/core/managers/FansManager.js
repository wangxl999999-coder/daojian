const localConfig = require('localConfig');
const playerData = require('playerData');
const constants = require('constants');
const gameLogic = require('gameLogic');

cc.Class({
    extends: cc.Component,

    properties: {
        fanPrefab: cc.Prefab,
        fanParent: cc.Node,
        addTip: cc.Prefab,
        addFansTipParent: cc.Node,
        lightRing: cc.Prefab,
        addFansTipRingParent: cc.Node,
        sparkPrefab: cc.Prefab,
        sparkParent: cc.Node
    },

    onLoad() {
        window.FansManager = this;
    },

    start() {
        this.fans = [];
        this.addTipLbPool = new cc.NodePool();
        this.addTipRingPool = new cc.NodePool();

        this.sparkPool = new cc.NodePool();

        setTimeout(function() {
            this.generateFansRandomInterval();
        }.bind(this), 500);
    },

    getFan(hostPlayer) {
        if (!this.isValid) {
            return;
        }
        let fan = cc.instantiate(this.fanPrefab);
        if (window.ShadowManager) {
            ShadowManager.addShadow(fan);
        }
        if (hostPlayer) {
            let worldVec = hostPlayer.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let localVec = this.fanParent.convertToNodeSpaceAR(worldVec);
            fan.position = localVec;
        }
        fan.parent = this.fanParent;
        let fanScript = fan.getComponent('fan');
        this.fans.push(fanScript);
        return fanScript;
    },

    // + 1 和光圈
    addFansTip(fan, hostPlayer) {
        return;
        if (hostPlayer === PlayerManager.player) {
            this.addFansLbTip(fan, hostPlayer);
        }
        this.addFansRingTip(fan, hostPlayer);
    },

    // + 10 和光圈
    addFans10Tip(victim, muder) {
        if (muder === PlayerManager.player) {
            let tip = cc.instantiate(this.addTip);
            tip.parent = this.addFansTipParent;
            let tipLabel = tip.children[0].getComponent(cc.Label);
            tipLabel.node.color = muder.uiColor;
            tipLabel.fontSize = 100;
            tipLabel.lineHeight = 120;
            tipLabel.string = ",5";
            let worldVec = victim.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let localVec = this.addFansTipParent.convertToNodeSpaceAR(worldVec);
            tip.position = localVec;

            let tipAnim = tip.getComponent(cc.Animation);
            if (tipAnim) {
                tipAnim.play();
            }
            setTimeout(function() {
                if (!this.isValid) {
                    return;
                }
                tip.destroy();
            }.bind(this), 5000);
        }
    },

    playSpark(position) {
        let spark = this.sparkPool.get();
        if (!spark) {
            spark = cc.instantiate(this.sparkPrefab);
        }
        spark.parent = this.sparkParent;
        let localVec = this.sparkParent.convertToNodeSpaceAR(position);
        spark.position = localVec;
        let sparkAnim = spark.getComponent(cc.Animation);
        if (sparkAnim) {
            sparkAnim.play();
        }

        setTimeout(function() {
            if (this && this.sparkPool) {
                this.sparkPool.put(spark);
            }
        }.bind(this), 2000);
    },

    addFansLbTip(fan, hostPlayer) {
        let tip = this.addTipLbPool.get();
        if (!tip) {
            tip = cc.instantiate(this.addTip);
        }
        tip.parent = this.addFansTipParent;
        tip.children[0].color = hostPlayer.uiColor;

        let worldVec = fan.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let localVec = this.addFansTipParent.convertToNodeSpaceAR(worldVec);
        tip.position = localVec;

        let tipAnim = tip.getComponent(cc.Animation);
        if (tipAnim) {
            tipAnim.play();
        }
        setTimeout(function() {
            if (this && this.addTipLbPool) {
                this.addTipLbPool.put(tip);
            }
        }.bind(this), 5000);
    },

    addFansRingTip(fan, hostPlayer) {
        let tip = this.addTipRingPool.get();
        if (!tip) {
            tip = cc.instantiate(this.lightRing);
        }
        tip.parent = this.addFansTipRingParent;
        // 最高只支持两层子节点
        for (let i = 0; i < tip.children.length; i++) {
            tip.children[i].color = hostPlayer.uiColor;
            for (let j = 0; j < tip.children[i].children.length; j++) {
                tip.children[i].children[j].color = hostPlayer.uiColor;
            }
        }

        let follow = tip.getComponent('Follow');
        if (follow) {
            follow.target = fan.node;
        }
        // let worldVec = fan.node.convertToWorldSpaceAR(cc.v2(0, 0));
        // let localVec = this.addFansTipRingParent.convertToNodeSpaceAR(worldVec);
        // tip.position = localVec;

        let tipAnim = tip.getComponent(cc.Animation);
        if (tipAnim) {
            tipAnim.play();
        }
        setTimeout(function() {
            if (this && this.addTipRingPool) {
                this.addTipRingPool.put(tip);
            }
        }.bind(this), 5000);
    },

    // 地图上随机生成粉丝
    generateFansRandomInterval() {
        let maxFan = 80; // 最大的粉丝数量
        let fanSpawnCd = 200;
        let minX = -playerData.BoundSize.x * 0.5;
        let maxX = playerData.BoundSize.x * 0.5;
        let minY = -playerData.BoundSize.y * 0.5;
        let maxY = playerData.BoundSize.y * 0.5;

        let initFansCnt = 0;
        let initFanCnt = 20;
        let deltaSpawnFanCnt = 1; // 每次生成的次数
        // 优化Android机型
        // if (gameLogic.SystemInfo) {
        //     if (gameLogic.SystemInfo.platform === 'android') {
        //         if (gameLogic.SystemInfo.benchmarkLevel) {
        //             let lvTplt = localConfig.queryOne("benchmarkLevel", "benchmarkLevel", gameLogic.SystemInfo.benchmarkLevel);
        //             if (lvTplt) {
        //                 initFanCnt = lvTplt.initFanCnt;
        //                 deltaSpawnFanCnt = lvTplt.deltaSpawnFanCnt;
        //                 // cc.game.setFrameRate(lvTplt.fps);
        //             }
        //         }
        //     }
        // }
        let generateFanId = setInterval(() => {
            if (!this.isValid) {
                clearInterval(generateFanId);
                return;
            }
            let fan = FansManager.getFan();
            if (fan) {
                let pos = cc.v2((maxX - minX) * (Math.random() - 0.5),
                    (maxY - minY) * (Math.random() - 0.5));
                let result = ObstaclesManager.detectIfInObstacle(pos);
                if (result) {
                    pos = result;
                }
                fan.node.x = pos.x;
                fan.node.y = pos.y;
            }
            initFansCnt++;
            if (initFansCnt > initFanCnt) {
                clearInterval(generateFanId);
            }
        }, 10);

        // 新手保护机制 - 派别之争
        let protectFanCnt = 0;
        let range = maxX - minX;
        let durTime = 0;
        
        let roundCnt = playerData.gameData.roundCnt;
        if (!roundCnt) roundCnt = 1;
        else roundCnt = parseInt(roundCnt);
        let newbieTplt = localConfig.queryOne('newbieProtectTplt', 'round', roundCnt);
        if (newbieTplt) {
            protectFanCnt = newbieTplt.fanCnt;
            range = 2 * newbieTplt.range;
            durTime = newbieTplt.durTime;
        }

        this.fanSpawnId = setInterval(function() {
            if (playerData.gameState !== constants.GAME_STATE.PLAY ) {
                return;
            }
            for (let i = 0; i < deltaSpawnFanCnt; i++) {
                if (!this.isValid || this.fans.length > maxFan) {
                    clearInterval(this.fanSpawnId);
                    return;
                }
                let fan = this.getFan();
                if (fan) {
                    let pos = cc.v2(0, 0);
                    if (i < protectFanCnt && durTime > 0) {
                        if (PlayerManager.player) {
                            let posX = PlayerManager.player.node.x + (Math.random() - 0.5) * range;
                            if (posX > maxX) posX = maxX;
                            else if (posX < minX) posX = minX;

                            let posY = PlayerManager.player.node.y + (Math.random() - 0.5) * range;
                            if (posY > maxY) posY = maxY;
                            else if (posY < minY) posY = minY;

                            pos = cc.v2(posX, posY);
                        }
                    } else {
                        pos = cc.v2((maxX - minX) * (Math.random() - 0.5),
                            (maxY - minY) * (Math.random() - 0.5));
                        let result = ObstaclesManager.detectIfInObstacle(pos);
                        if (result) pos = result;
                    }
                    fan.node.x = pos.x;
                    fan.node.y = pos.y;
                }
            }
            durTime -= (fanSpawnCd / 1000);
        }.bind(this), fanSpawnCd)
    },

    onDestroy() {
        clearInterval(this.fanSpawnId);
    }
});
