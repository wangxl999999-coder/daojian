const playerData = require('playerData');

const douyinSidebarManagerObj = cc.Class({
    statics: {
        getInstance() {
            if (!this.instance) {
                this.instance = new douyinSidebarManagerObj();
            }
            return this.instance;
        }
    },

    properties: {
        isSidebarCheck: false,
        sidebarCheckInterval: null,
    },

    init() {
        if (typeof tt === 'undefined') {
            console.log('抖音环境未检测到');
            return;
        }

        this.checkSidebarStatus();
        this.startSidebarMonitor();
    },

    checkSidebarStatus() {
        try {
            tt.checkFavorite({
                success: (res) => {
                    console.log('侧边栏收藏状态:', res);
                    playerData.hasAddedToSidebar = res.isAdded;
                    
                    if (!res.isAdded && !playerData.showedSidebarGuide) {
                        this.showSidebarGuide();
                    }
                },
                fail: (err) => {
                    console.error('检查侧边栏状态失败:', err);
                }
            });
        } catch (e) {
            console.error('调用抖音API失败:', e);
        }
    },

    startSidebarMonitor() {
        if (this.sidebarCheckInterval) {
            clearInterval(this.sidebarCheckInterval);
        }

        this.sidebarCheckInterval = setInterval(() => {
            this.checkSidebarStatus();
        }, 10000);
    },

    showSidebarGuide() {
        if (playerData.showedSidebarGuide) return;
        
        playerData.showedSidebarGuide = true;
        
        const clientEvent = kf.require('basic.clientEvent');
        clientEvent.dispatchEvent('showPanel', 'sidebarGuidePanel');
    },

    openSidebar() {
        if (typeof tt === 'undefined') {
            console.log('非抖音环境，模拟打开侧边栏');
            return;
        }

        try {
            tt.openFavoriteGuide({
                type: 'bar',
                success: (res) => {
                    console.log('打开侧边栏成功:', res);
                },
                fail: (err) => {
                    console.error('打开侧边栏失败:', err);
                }
            });
        } catch (e) {
            console.error('调用抖音API失败:', e);
        }
    },

    destroy() {
        if (this.sidebarCheckInterval) {
            clearInterval(this.sidebarCheckInterval);
            this.sidebarCheckInterval = null;
        }
    }
});

kf.addModule('platform.douyinSidebarManager', () => douyinSidebarManagerObj);
