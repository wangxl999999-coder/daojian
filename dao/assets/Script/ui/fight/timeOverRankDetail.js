const constants = require('constants');
cc.Class({
    extends: cc.Component,

    properties: {
        // rankIndexLb: cc.Label,
        // ranIndexNode: cc.Node,
        
        fansCntLb: cc.Label,
        playerNameLb: cc.Label,
        coinLb: cc.Label,
        bg: cc.Node,
        fanTag: cc.Node,
        deadTag: cc.Node,

        nodeTop3: cc.Node,
        nodeRank: cc.Node,

        lbTop3: cc.Label,
        lbRank: cc.Label
    },

    onLoad() {
        // this.ranIndexSF = [this.rank1, this.rank2, this.rank3];
    },
    setData(data) {

        if (data.isSelf) {
            data.color = new cc.Color(255, 255, 255, 255);
        } else {
            data.color = cc.color('#aca5c9');
        }

        if (data.rank < 4) {
            this.nodeTop3.active = true;
            this.nodeRank.active = false;

            this.lbTop3.string = data.rank;

            // this.rankIndexLb.node.active = false;
            // this.ranIndexNode.active = true;
            // if (data.rank <= this.ranIndexSF.length) {
            //     this.ranIndexNode.getComponent(cc.Sprite).spriteFrame = this.ranIndexSF[data.rank - 1];
            //     this.ranIndexNode.getChildByName('rankNum').getComponent(cc.Label).string = data.rank;

            //     if (constants.tempName && constants.tempName === 'kjlbd') {
            //         this.ranIndexNode.getChildByName('rankNum').active = false;
            //     }
            // }
        } else {
            this.nodeTop3.active = false;
            this.nodeRank.active = true;

            this.lbRank.string = data.rank;

            // this.rankIndexLb.node.active = true;
            // this.ranIndexNode.active = false;
            // this.rankIndexLb.string = data.rank;
        }

        if (data.fansCnt <= 0) {
            this.deadTag.active = true;
            this.fanTag.active = false;
            // this.deadTag.color = data.color;

        } else {
            this.deadTag.active = false;
            this.fanTag.active = true;

            this.fansCntLb.string = "x" + data.fansCnt;
            // this.fansCntLb.node.color = data.color;
            // this.fanTag.color = data.color;
        }

        this.playerNameLb.string = data.playerName;
        // this.playerNameLb.node.color = data.color;

        // if (constants.tempName && constants.tempName === 'kjlbd') {
        //     if (data.isSelf) {
        //         this.bg.color = new cc.Color(109, 117, 226, 255);
        //     } else {
        //         this.bg.color = new cc.Color(75, 69, 130, 255);
        //     }
        // } else {
        //     if (data.isSelf) {
        //         this.bg.color = new cc.Color(146, 71, 63, 255);
        //     } else {
        //         this.bg.color = new cc.Color(45, 27, 19, 255);
        //     }
        // }

        if (data.isSelf) {
            this.bg.color = cc.color('#1093b9');
        }

        let goldArr = [200, 150, 100, 50, 20, 20, 20, 20];
        let goldNum = 30;
        if (data.rank <= goldArr.length) {
            goldNum = goldArr[data.rank - 1];
        }
        this.coinLb.string = goldNum;
        // this.coinLb.node.color = data.color;
    }
});
