var clientEvent = kf.require('basic.clientEvent');
var panel = kf.require('component.panel');
const constants = require('constants');
const playerData = require('playerData');
const douyinAdManager = kf.require('platform.douyinAdManager');

const taskPanelUIEventObj = cc.Class({
    extends: panel,

    properties: {
        taskListContent: cc.Node,
        taskItemPrefab: cc.Prefab,
        btnClose: cc.Node,
    },

    onLoad() {
        this._super();
        this.registerWidgetEvent();
        this.registerEvent();
    },

    registerWidgetEvent() {
        this.btnClose.on('click', this.onBtnCloseClick, this);
    },

    registerEvent() {

    },

    onBtnCloseClick() {
        clientEvent.dispatchEvent('hidePanel', 'taskPanel');
    },

    show() {
        this._super();
        this.refreshTaskList();
    },

    refreshTaskList() {
        this.taskListContent.removeAllChildren();

        const tasks = this.getTaskList();
        tasks.forEach((task, index) => {
            const taskItem = cc.instantiate(this.taskItemPrefab);
            this.taskListContent.addChild(taskItem);
            this.initTaskItem(taskItem, task, index);
        });
    },

    getTaskList() {
        return [
            {
                id: 'daily_login',
                title: '每日登录',
                desc: '今日首次登录游戏',
                reward: 100,
                type: 'daily',
                progress: playerData.dailyLoginCompleted ? 1 : 0,
                target: 1,
                completed: playerData.dailyLoginCompleted,
                claimed: playerData.dailyLoginClaimed
            },
            {
                id: 'play_3_game',
                title: '对战3局',
                desc: '完成3局游戏对战',
                reward: 200,
                type: 'daily',
                progress: Math.min(playerData.todayPlayCount || 0, 3),
                target: 3,
                completed: (playerData.todayPlayCount || 0) >= 3,
                claimed: playerData.play3GameClaimed
            },
            {
                id: 'watch_ad',
                title: '观看视频',
                desc: '观看1次激励视频广告',
                reward: 150,
                type: 'daily',
                progress: Math.min(playerData.todayWatchAdCount || 0, 1),
                target: 1,
                completed: (playerData.todayWatchAdCount || 0) >= 1,
                claimed: playerData.watchAdClaimed
            },
            {
                id: 'reach_top1',
                title: '获得第一名',
                desc: '在对战中获得第1名',
                reward: 300,
                type: 'daily',
                progress: playerData.todayWinCount || 0,
                target: 1,
                completed: (playerData.todayWinCount || 0) >= 1,
                claimed: playerData.reachTop1Claimed
            }
        ];
    },

    initTaskItem(itemNode, taskData, index) {
        const widget = itemNode.getComponent('widget');
        if (widget) {
            widget['title'].getComponent(cc.Label).string = taskData.title;
            widget['desc'].getComponent(cc.Label).string = taskData.desc;
            widget['reward'].getComponent(cc.Label).string = `+${taskData.reward}`;
            
            const progress = widget['progress'].getComponent(cc.ProgressBar);
            progress.progress = taskData.progress / taskData.target;
            
            widget['progressLabel'].getComponent(cc.Label).string = `${taskData.progress}/${taskData.target}`;

            const btnGo = widget['btnGo'];
            const btnClaim = widget['btnClaim'];
            const completedMark = widget['completedMark'];

            if (taskData.completed && !taskData.claimed) {
                btnGo.active = false;
                btnClaim.active = true;
                completedMark.active = false;
                
                btnClaim.on('click', () => {
                    this.claimTaskReward(taskData);
                }, this);
            } else if (taskData.claimed) {
                btnGo.active = false;
                btnClaim.active = false;
                completedMark.active = true;
            } else {
                btnGo.active = true;
                btnClaim.active = false;
                completedMark.active = false;

                btnGo.on('click', () => {
                    this.goTask(taskData);
                }, this);
            }
        }
    },

    claimTaskReward(taskData) {
        if (taskData.claimed) return;

        playerData.gold += taskData.reward;
        
        switch(taskData.id) {
            case 'daily_login':
                playerData.dailyLoginClaimed = true;
                break;
            case 'play_3_game':
                playerData.play3GameClaimed = true;
                break;
            case 'watch_ad':
                playerData.watchAdClaimed = true;
                break;
            case 'reach_top1':
                playerData.reachTop1Claimed = true;
                break;
        }

        clientEvent.dispatchEvent('showPanel', 'tipsPanel', `获得${taskData.reward}金币！`);
        this.refreshTaskList();
        clientEvent.dispatchEvent('updateUserDataDisplay');
    },

    goTask(taskData) {
        switch(taskData.id) {
            case 'daily_login':
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', '请保持登录状态');
                break;
            case 'play_3_game':
                clientEvent.dispatchEvent('hidePanel', 'taskPanel');
                break;
            case 'watch_ad':
                this.watchAdForTask();
                break;
            case 'reach_top1':
                clientEvent.dispatchEvent('hidePanel', 'taskPanel');
                break;
        }
    },

    watchAdForTask() {
        douyinAdManager.getInstance().showRewardedVideoAd((isCompleted) => {
            if (isCompleted) {
                playerData.todayWatchAdCount = (playerData.todayWatchAdCount || 0) + 1;
                this.refreshTaskList();
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', '视频观看完成！');
            } else {
                clientEvent.dispatchEvent('showPanel', 'tipsPanel', '视频未看完');
            }
        });
    },

    hide() {
        this._super();
    }
});

kf.addModule('panel.taskPanelUIEvent', () => taskPanelUIEventObj);
