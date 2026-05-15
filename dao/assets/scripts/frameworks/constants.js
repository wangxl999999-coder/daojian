/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 */
module.exports = {

    //本地缓存KEY值
    LOCAL_CACHE: {
        PLAYER: 'user',             //玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理
        GAME: 'gameData',           //游戏数据
        DATA_VERSION: 'dataVersion',    //数据版本
        ACCOUNT: 'account',                 //玩家账号
        SETTING: 'setting',                 //玩家账号
        // TMP_DATA: 'tmpData',             //临时数据，不会存储到云盘
       
    },

    GUIDE_TYPE: {    //新手引导类型
        SPACE: 0,               //空，不做任何操作，用来判定触发
        GUIDE_ANI: 1,           //引导动画
        TRIGGER_EVENT: 2,       //触发事件
        WAIT_EVENT: 3,          //等待事件触发
        GUIDE: 4                //界面性引导
    },

    //顺时针
    GUIDE_TIPS_DIRECTION: { //tips展示方向
        TOP: 0,
        RIGHT: 1,
        BOTTOM: 2,
        LEFT: 3
    },

    SHARE_TYPE: {                               //分享文案
        SHARE_GAME: 0,                          //游戏分享
        GROUP_RANK: 1,                          //群排行
    },
    
    SHARE_FUNCTION: {
        DAILY_WELFARE: 'dailyWelfare', // 每日登录礼包
        SUPER_START: 'superStart', // 超级开局
        REVIVE: 'revive', // 复活
        GAME_OVER: 'gameOver', // 金币结算
        SECRET_GIFT: 'secretGift', // 神秘大礼
        DAILY_LOGIN: 'dailyLogin', // 每日签到礼包
        DAILY_LOGIN_GET_AGAIN: 'dailyLoginGetAgain', // 每日签到补领
        LUCKY_WHEEL: 'luckyWheel', // 转盘奖励
        POWERFUL_PROP: 'powerfulProp', // 强力道具
        OVER_TIME: 'overtime', // 加时
        INVITE_FRIEND: 'inviteFriend', // 绝版皮肤邀请好友
        DEFAULT_SHARE: 'defaultShare', // 默认分享
        SPEED_PROPERTY_TRAIN: 'speedPropertyTrain', // 速度属性养成
        SHARE_TO_FRIEND: 'shareToFriend', // 游戏结算炫耀
        SUPER_WELFARE: 'superWelfare', // 结算界面超级开局
        SPRINT_PROPERTY_TRAIN: 'sprintPropertyTrain', // 冲刺属性养成
        DAILY_LOGIN_TODAY_GET: 'dailyLoginTodayGet', // 签到今日双倍领取
        SPEED: 'speed', //冲刺
        SKIN_TRY: 'skinTry',// 皮肤试用
        PLAY_AGAIN: 'playAgain',// 再来一局
        GET_SKIN: 'getSkin',        //看广告获得皮肤
    },

    ZORDER: {
        LINK_ITEM_NORMAL: 0,
        LINK_ITEM_SKILL: 1,
        FIGHT_NUM: 20,      //战斗数字特效
        DIALOG: 100,        //弹窗的Z序
        REWARD: 900,        //奖励的弹窗
        WAITING: 998,      //等待界面弹窗
        TIPS: 999,           //提示框
    },

    AUDIO_MUSIC: {
        BACKGROUND: "bgm", //背景音乐
        FIGHT: "fight", //游戏音乐
    },

    AUDIO_SOUND: {
        CLICK: 'btnClick',                  //点击音效
        COUNT_DOWN: 'countDown',            //倒计时
        CRASH_SWORD: 'crashSword',          //武器碰撞
        DEAD: 'dead',                       //死亡
        GAME_START: 'gameStart',            //游戏开始
        GO: 'go',                           //go
        GRAB: 'grab',                       //拾取
        SHIELD: 'shield',                   //护盾
        KILL: 'kill',
        LOSE: 'lose',
        LOSE_SWORD: 'loseSword',
        SCREEN_SHOOT: 'screenShoot',
        TIME_OVER: 'timeOver',
        DEAD_BOY: 'deadBoy',
        DEAD_GIRL: 'deadGirl',
        CHANGE_WEAPON: 'changeWeapon',
        WIN: 'win',
        KILL1: 'kill1',
        KILL2: 'kill2',
        KILL3: 'kill3',
        KILL4: 'kill4',
        KILL5: 'kill5',
        KILL6: 'kill6',
        KILL7: 'kill7',
        KILL8: 'kill8',
        KILL9: 'kill9',
    },

    LEVEL: {
        BASE_SCORE: 100, // 1级分数
        TIMES: 1.2 // 倍数
    },

    GAME_STATE: {
        NONE: 0,
        PLAY: 1,
        PAUSE: 2,
        TIME_OVER: 3,
        GAME_OVER: 4
    },

    //打开奖励的方法
    OPEN_REWARD_TYPE: {
        AD: 0,
        SHARE: 1,
        NULL: 2
    },

    /////////////////////////////// old /////////////////////////////////

    MODE_VALUE: {
        POMELO_MODE: 1,
        NORMAL_MODE: 2,
    },

    aDayTime: 24 * 60 * 60 * 1000,
    aDaySeconds: 24 * 60 * 60,
    integrationLeng: 30,
    TIMEARR: {
        seconds: 1000,
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
    },

    // 动画机
    AnimationState: {
        PLAY: 'play',
        STOP: 'stop',
        PAUSE: 'pause',
        RESUME: 'resume',
        LASTFRAME: 'lastframe',
        FINISHED: 'finished',
    },

    KICK_TYPE: {
        KICK_BY_LOGIN: 'kick by login', // 该账号在异地登陆
        KICK_BY_GM: 'kick by gm', // 该账号被GM踢下线
        KICK_BY_SYSTEM: 'kick by system', // 该账号被系统踢下线（后续可能加入自动检测异常判断之类的可使用）
        KICK_BY_LOGOUT: 'kick by logout', // 该账号被系统踢下线（后续可能加入自动检测异常判断之类的可使用）
    },

    LOGIN: {
        OLD_USER: 1,
        NEW_USER: 2,
    },

    // 登陆渠道信息
    APP: {
        appId: '', // 微信appid 正式版// 这是自己的
    },

    level: {
        baseScore: 100, // 1级分数
        times: 1.2 // 倍数
    },

    props: {
        giftBag: 999, // 礼包
        gold: 1, // 金币
        skin: 2, // 皮肤
        speed: 3, // 速度升级
        sprint: 4 // 冲刺升级
    },
    
    taskId: {
        continuousLogin: 3, // 连续登录
        share: 4, // 分享
        video: 5, // 看视频
        game: 6, // 进行游戏
        invite: 7, // 邀请好友
        oneGameFans: 8, // 单次游戏收集粉丝
        oneGamePlayer: 9, // 单次游戏击杀玩家
        continuousNo1: 10, // 连续第一
        signIn: 11, // 签到
    },

    maxMathcingImageNums: 101,

    getAwardFrom: {
        dailyWelfare: 1, // 每日登录福利
        dailyLogin: 2, // 每日签到
        luckyWheel: 3, // 幸运大转盘
        gameOver: 4, // 金币结算
        secretGift: 5, // 神秘大礼
    },

    shareId: {
        dailyWelfare: 0, // 每日登录礼包
        superStart: 1, // 超级开局
        revive: 2, // 复活
        gameOver: 3, // 金币结算
        secretGift: 4, // 神秘大礼
        dailyLogin: 5, // 每日签到礼包
        dailyLoginGetAgain: 6, // 每日签到补领
        luckyWheel: 7, // 转盘奖励
        powerfulProp: 9, // 强力道具
        overtime: 10, // 加时
        inviteFriend: 11, // 绝版皮肤邀请好友
        defaultShare: 12, // 默认分享
        speedPropertyTrain: 13, // 速度属性养成
        shareToFriend: 14, // 游戏结算炫耀
        superWelfare: 15, // 结算界面超级开局
        sprintPropertyTrain: 16, // 冲刺属性养成
        dailyLoginTodayGet: 17, // 签到今日双倍领取
        speed: 18, //冲刺
        skinTry: 19,// 皮肤试用
        playAgain: 20,// 再来一局
    },

    adPlaceName: {
        mainPanel: 'mainPanel', // 主界面
        gameOverPanel: 'gameOverPanel', // 结算界面 !
        uiGamePanel: 'uiGamePanel', // 游戏里面的banner
        luckyWheelAward: 'luckyWheelAward', // 转盘奖励界面
        gameOverAward: 'gameOverAward', // 结算奖励界面
        dailyWelfarePanel: 'dailyWelfarePanel', // 每日福利界面
        dailyLoginAward: 'dailyLoginAward', // 签到奖励界面
        uiTimeOver: 'uiTimeOver', // 进行游戏到时间结束时的UI中显示的广告
        crazySpotAward: 'crazySpotAward', // 疯狂点击奖励界面显示的广告
        matchingPanel: 'matchingPanel', // 匹配界面显示的广告
        trialSkinPanel: 'trialSkinPanel', // 匹配界面显示的广告
        superStartPanel: 'superStartPanel', // 匹配界面显示的广告
    },

    getSkinNum: 1,
    matchingDesc: ['属性培养可以永久提升速度！', '据说只有长得好看的人才能拥有绝版皮肤！'], // 匹配界面文案轮播
    crazyProgressArr: [0.5, 0.3, 0.2], // 初始50%，每秒减少30%，点击一次加20%

    speedGold: 300,  // 金币加速需要的金币
    speedGoldAddPra: 180,  // 金币加速获得的速度(%)
    speedGoldMaxNum: 2,  // 金币加速最多次数
    speedGoldTime: 3,  // 金币加速持续时间
    speedType: {
        gold: 1     // 金币加速
    },

    shareImgPath: 'xdysyqzShareImage',
    ossGameName: 'djwzCity',

    camera: {
        defence: 1.15,
        attact: 0.85
    },
    

    WX_AD_TYPE: {
        BANNER: 0,
        VIDEO: 1
    },
};
