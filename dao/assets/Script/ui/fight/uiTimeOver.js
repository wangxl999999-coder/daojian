const constants = require('constants');
const panel = kf.require('component.panel');
const gameLogic = require('gameLogic');
const playerData = require('playerData');
cc.Class({
    extends: panel,

    properties: {
        backToMainBtn: cc.Node,
        rankPrefab: cc.Prefab,
        layoutParent: cc.Node,
        timeOver: cc.Label,

    },
    setData(screenShootPath) {
        this.screenShootPath = screenShootPath;
        console.log('screenShootPath :' + screenShootPath);
    },

    start() {
        this.randomIndex1 = 0;
        this.randomIndex2 = 1;
        this.showMoreMaxCd = 3;
        this.showMoreCurCd = this.showMoreMaxCd;
        this.backToMainBtn.on('click', function() {
            cc.director.loadScene('mainScene');
        });

        if (PlayerManager.players) {
            PlayerManager.players.sort(function(a, b) {
                return b.fans.length - a.fans.length;
            });
        }

        let selfRank = 1;
        for (let i = 0; PlayerManager.players && i < PlayerManager.players.length; i++) {
            let rankNode = cc.instantiate(this.rankPrefab);
            rankNode.parent = this.layoutParent;
            let rankDetail = rankNode.getComponent('timeOverRankDetail');
            let player = PlayerManager.players[i];
            if (player) {
                let data = {
                    rank: i + 1,
                    fansCnt: player.fans.length,
                    playerName: player.playerName,
                    color: player.uiColor,
                    isSelf: player === PlayerManager.player
                };
                rankDetail.setData(data);
                if (data.isSelf) {
                    selfRank = data.rank;
                }
            }
            let anim = rankNode.getComponent(cc.Animation);
            if (anim) {
                setTimeout(function() {
                    if (!anim.isValid) {
                        return;
                    }
                    anim.play('timeOverRank');
                }, i * 100);
            }
        }

        if (playerData.killLastAi) {
            this.timeOver.string = '还有谁';
            this.timeOver.node.getChildByName('notime').getComponent(cc.Label).string = '还有谁';
        } else if (selfRank === 1) {
            this.timeOver.string = '恭喜吃鸡';
            this.timeOver.node.getChildByName('notime').getComponent(cc.Label).string = '恭喜吃鸡';
        } else {
            
            this.timeOver.string = '没时间了';
            this.timeOver.node.getChildByName('notime').getComponent(cc.Label).string = '没时间了';
        }

        cc.gameSpace.audioManager.stop(constants.AUDIO_MUSIC.FIGHT);

        if (selfRank === 1 || playerData.killLastAi) {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.WIN);
        } else {
            cc.gameSpace.audioManager.playSound(constants.AUDIO_SOUND.LOSE);
        }
    },

});
