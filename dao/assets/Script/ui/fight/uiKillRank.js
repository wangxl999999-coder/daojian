let rankDetail = require('rankDetail');
const clientEvent = kf.require('basic.clientEvent');

cc.Class({
    extends: cc.Component,

    properties: {
        rankDetails: [rankDetail],
        selfRankDetail: rankDetail
    },

    onLoad() {
        clientEvent.on('addFan', this.addFan.bind(this));
        clientEvent.on('killPlayerUI', this.killPlayerUI.bind(this));
    },

    addFan() {
        if (!this.rankDetails) {
            return;
        }
        PlayerManager.players.sort(function(a, b) {
            return b.fans.length - a.fans.length;
        });
        for (let i = 0; i < PlayerManager.players.length && i < this.rankDetails.length; i++) {
            let player = PlayerManager.players[i];
            if (player) {
                let data = {
                    rank: i + 1,
                    fansCnt: player.node.active ? player.fans.length : 0,
                    playerName: player.playerName,
                    color: player.uiColor,
                    isAI: player.info.isAI,
                };
                this.rankDetails[i].setData(data);
            }
        }
        let index = PlayerManager.players.indexOf(PlayerManager.player);
        let data = {
            rank: index + 1,
            fansCnt: PlayerManager.player.fans.length,
            playerName: PlayerManager.player.playerName,
            color: PlayerManager.player.uiColor,
            isMainPlayer: true
        };
        this.selfRankDetail.setData(data);
    },

    killPlayerUI(data) {
        if (!data.victim.info.isAI) {
            return; // 自己可能会复活，不处理
        }

        for (let i = this.rankDetails.length - 1; i >= 0; i--) {
            if (this.rankDetails[i].node.active) {
                this.rankDetails[i].node.active = false;
                this.rankDetails[i].playerNameLb.node.active = false;
                break;
            }
        }
    },

    onDestroy() {
        clientEvent.off('addFan', this.addFan.bind(this));
        clientEvent.off('killPlayerUI', this.killPlayerUI.bind(this));
    },
});
