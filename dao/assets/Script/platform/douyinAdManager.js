const constants = require('constants');
const playerData = require('playerData');

const douyinAdManagerObj = cc.Class({
    statics: {
        getInstance() {
            if (!this.instance) {
                this.instance = new douyinAdManagerObj();
            }
            return this.instance;
        }
    },

    properties: {
        rewardedVideoAd: null,
        isRewardedVideoLoaded: false,
        bannerAd: null,
        interstitialAd: null,
    },

    init() {
        if (typeof tt === 'undefined') {
            console.log('抖音环境未检测到，广告功能不可用');
            return;
        }

        this.initRewardedVideoAd();
        this.initBannerAd();
        this.initInterstitialAd();
    },

    initRewardedVideoAd() {
        if (typeof tt === 'undefined') return;

        try {
            this.rewardedVideoAd = tt.createRewardedVideoAd({
                adUnitId: 'YOUR_REWARDED_VIDEO_AD_UNIT_ID'
            });

            this.rewardedVideoAd.onLoad(() => {
                console.log('激励视频广告加载成功');
                this.isRewardedVideoLoaded = true;
            });

            this.rewardedVideoAd.onError((err) => {
                console.error('激励视频广告加载失败:', err);
                this.isRewardedVideoLoaded = false;
            });

            this.rewardedVideoAd.onClose((res) => {
                if (res && res.isEnded) {
                    console.log('激励视频观看完成，发放奖励');
                    this.onRewardedVideoCompleted();
                } else {
                    console.log('激励视频未看完');
                    this.onRewardedVideoCanceled();
                }
            });
        } catch (e) {
            console.error('激励视频广告初始化失败:', e);
        }
    },

    showRewardedVideoAd(callback) {
        this.rewardCallback = callback;

        if (typeof tt === 'undefined') {
            console.log('非抖音环境，模拟激励视频观看完成');
            setTimeout(() => {
                if (this.rewardCallback) {
                    this.rewardCallback(true);
                }
            }, 1000);
            return;
        }

        if (this.rewardedVideoAd) {
            if (this.isRewardedVideoLoaded) {
                this.rewardedVideoAd.show().catch((err) => {
                    console.error('激励视频展示失败:', err);
                    if (this.rewardCallback) {
                        this.rewardCallback(false);
                    }
                });
            } else {
                this.rewardedVideoAd.load().then(() => {
                    this.rewardedVideoAd.show().catch((err) => {
                        console.error('激励视频展示失败:', err);
                        if (this.rewardCallback) {
                            this.rewardCallback(false);
                        }
                    });
                }).catch((err) => {
                    console.error('激励视频加载失败:', err);
                    if (this.rewardCallback) {
                        this.rewardCallback(false);
                    }
                });
            }
        } else {
            console.log('激励视频广告未初始化');
            if (this.rewardCallback) {
                this.rewardCallback(false);
            }
        }
    },

    onRewardedVideoCompleted() {
        if (this.rewardCallback) {
            this.rewardCallback(true);
        }
    },

    onRewardedVideoCanceled() {
        if (this.rewardCallback) {
            this.rewardCallback(false);
        }
    },

    initBannerAd() {
        if (typeof tt === 'undefined') return;

        try {
            const systemInfo = tt.getSystemInfoSync();
            this.bannerAd = tt.createBannerAd({
                adUnitId: 'YOUR_BANNER_AD_UNIT_ID',
                style: {
                    left: 0,
                    top: systemInfo.windowHeight - 100,
                    width: systemInfo.windowWidth
                }
            });

            this.bannerAd.onLoad(() => {
                console.log('Banner广告加载成功');
            });

            this.bannerAd.onError((err) => {
                console.error('Banner广告加载失败:', err);
            });
        } catch (e) {
            console.error('Banner广告初始化失败:', e);
        }
    },

    showBannerAd() {
        if (this.bannerAd) {
            this.bannerAd.show().catch((err) => {
                console.error('Banner展示失败:', err);
            });
        }
    },

    hideBannerAd() {
        if (this.bannerAd) {
            this.bannerAd.hide();
        }
    },

    initInterstitialAd() {
        if (typeof tt === 'undefined') return;

        try {
            this.interstitialAd = tt.createInterstitialAd({
                adUnitId: 'YOUR_INTERSTITIAL_AD_UNIT_ID'
            });

            this.interstitialAd.onLoad(() => {
                console.log('插屏广告加载成功');
            });

            this.interstitialAd.onError((err) => {
                console.error('插屏广告加载失败:', err);
            });
        } catch (e) {
            console.error('插屏广告初始化失败:', e);
        }
    },

    showInterstitialAd() {
        if (this.interstitialAd) {
            this.interstitialAd.show().catch((err) => {
                console.error('插屏广告展示失败:', err);
            });
        }
    },

    destroy() {
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.destroy();
        }
        if (this.bannerAd) {
            this.bannerAd.destroy();
        }
        if (this.interstitialAd) {
            this.interstitialAd.destroy();
        }
    }
});

kf.addModule('platform.douyinAdManager', () => douyinAdManagerObj);
