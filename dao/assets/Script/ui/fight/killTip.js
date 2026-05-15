const tipWords = ["击杀", "双杀", "三杀", "无人能挡", "大杀特杀", "超神"];
const resourceUtil = require('resourceUtil');


cc.Class({
    extends: cc.Component,

    properties: {
        murder: cc.Label,
        victim: cc.Label,
        spTips: cc.Sprite,

        spMurder: cc.Sprite,
        spVictim: cc.Sprite,
    },

    setName(data) {
        this.murder.string = data.murder.playerName;
        // this.murder.node.color = data.murder.uiColor;
        resourceUtil.setPlayerHead('head' + data.murder.playerHead, this.spMurder, ()=>{});
        this.victim.string = data.victim.playerName;
        // this.victim.node.color = data.victim.uiColor;
        resourceUtil.setPlayerHead('head' + data.victim.playerHead, this.spVictim, ()=>{});


        // let index = data.murder.continueKillCnt >= tipWords.length
        //     ? tipWords.length - 1 : data.murder.continueKillCnt - 1;
        // if (index < 0) index = 0;
        // this.tipWordLb.string = tipWords[index];

        let killCnt = data.murder.continueKillCnt;
        killCnt = killCnt > 5 ? 5: killCnt;
        killCnt = killCnt < 1 ? 1: killCnt;
        resourceUtil.setKillTips(killCnt, this.spTips, ()=>{});

        if (!data.murder.isAI) {
            //玩家触发的击杀
            let cnt = data.murder.continueKillCnt;
            cnt = cnt > 9 ? 9: cnt;
            cnt = cnt < 1 ? 1: cnt;
            cc.gameSpace.audioManager.playSound('kill' + cnt);
        }
    }
});
