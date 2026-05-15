const playerData = require('playerData');
const douyinAdManager = kf.require('platform.douyinAdManager');
const douyinSidebarManager = kf.require('platform.douyinSidebarManager');

const douyinPlatformObj = cc.Class({
    statics: {
        getInstance() {
            if (!this.instance) {
                this.instance = new douyinPlatformObj();
            }
            return this.instance;
        }
    },

    properties: {
        isDouyinPlatform: false,
        systemInfo: null,
    },

    init() {
        this.isDouyinPlatform = typeof tt !== 'undefined';
        
        if (this.isDouyinPlatform) {
            console.log('抖音小游戏平台初始化');
            
            try {
                this.systemInfo = tt.getSystemInfoSync();
                console.log('设备信息:', this.systemInfo);
                
                this.getUserInfo();
                this.initShare();
                this.initOnShow();
                this.initOnHide();
                
                douyinAdManager.getInstance().init();
                douyinSidebarManager.getInstance().init();
                
            } catch (e) {
                console.error('抖音平台初始化失败:', e);
            }
        } else {
            console.log('非抖音平台运行');
        }
    },

    getUserInfo() {
        try {
            tt.getUserInfo({
                success: (res) => {
                    console.log('获取用户信息成功:', res);
                    if (res.userInfo) {
                        playerData.nickName = res.userInfo.nickName;
                        playerData.avatarUrl = res.userInfo.avatarUrl;
                    }
                },
                fail: (err) => {
                    console.error('获取用户信息失败:', err);
                }
            });
        } catch (e) {
            console.error('调用getUserInfo失败:', e);
        }
    },

    initShare() {
        try {
            tt.showShareMenu({
                withShareTicket: true,
                success: () => {
                    console.log('显示分享菜单成功');
                }
            });

            tt.onShareAppMessage(() => {
                return {
                    title: '快来和我一起玩吧！',
                    imageUrl: '',
                    query: ''
                };
            });
        } catch (e) {
            console.error('初始化分享失败:', e);
        }
    },

    initOnShow() {
        try {
            tt.onShow((res) => {
                console.log('小游戏进入前台:', res);
                playerData.isBackground = false;
                
                // 检查是否是新的一天，重置每日任务
                const today = new Date().toDateString();
                if (playerData.lastLoginDate !== today) {
                    this.resetDailyTasks();
                    playerData.lastLoginDate = today;
                }
                
                // 设置每日登录完成
                playerData.dailyLoginCompleted = true;
            });
        } catch (e) {
            console.error('初始化onShow失败:', e);
        }
    },

    initOnHide() {
        try {
            tt.onHide(() => {
                console.log('小游戏进入后台');
                playerData.isBackground = true;
            });
        } catch (e) {
            console.error('初始化onHide失败:', e);
        }
    },

    resetDailyTasks() {
        playerData.todayPlayCount = 0;
        playerData.todayWinCount = 0;
        playerData.todayWatchAdCount = 0;
        playerData.dailyLoginCompleted = false;
        playerData.dailyLoginClaimed = false;
        playerData.play3GameClaimed = false;
        playerData.watchAdClaimed = false;
        playerData.reachTop1Claimed = false;
        playerData.showedSidebarGuide = false;
    },

    showRewardedVideoAd(callback) {
        douyinAdManager.getInstance().showRewardedVideoAd(callback);
    },

    showBannerAd() {
        douyinAdManager.getInstance().showBannerAd();
    },

    hideBannerAd() {
        douyinAdManager.getInstance().hideBannerAd();
    },

    showInterstitialAd() {
        douyinAdManager.getInstance().showInterstitialAd();
    },

    openSidebar() {
        douyinSidebarManager.getInstance().openSidebar();
    },

    vibrateShort() {
        if (this.isDouyinPlatform) {
            try {
                tt.vibrateShort({
                    success: () => {
                        console.log('短振动成功');
                    }
                });
            } catch (e) {
                console.error('短振动失败:', e);
            }
        }
    },

    vibrateLong() {
        if (this.isDouyinPlatform) {
            try {
                tt.vibrateLong({
                    success: () => {
                        console.log('长振动成功');
                    }
                });
            } catch (e) {
                console.error('长振动失败:', e);
            }
        }
    }
});

kf.addModule('platform.douyinPlatform', () => douyinPlatformObj);
