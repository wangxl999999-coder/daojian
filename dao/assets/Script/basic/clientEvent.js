kf.addModule('basic.clientEvent', () => {
    const eventListener = kf.require('basic.eventListener');

    const clientEvent = {};

    const _EVENT_TYPE = [
        'testEvent',
        'showPanel',
        'hidePanel',
        'showPanelOver',
        'hidePanelOver',

        'dispatchWxEvent', // 派发消息到微信子域中
        'wxSubPanelStart', // 微信子域先开始
        'wxSubPanelStop', // 微信子域显示停止

        'showNetLoading',
        'hideNetLoading',

        'updateNetworkState',

        'userlogined',
        'updateUserDataDisplay',
        'addFan',
        'killPlayerLogic',
        "killPlayerUI",
        "timeOver",
        "levelDown",
        "_touchStartEvent",
        "_touchEndEvent",
        "showGestures", // 显示加速的手势
        "updateNavigateData", //跳转到推荐游戏回来后更新试玩数据
        "showLoginBtn",
        "speedUpGuide", // 冲刺引导
        "startChangeToDefence",
        "startChangeToAttack",
        'stopParentRotate'
    ];

    clientEvent.EVENT_TYPE = {};
    for (const i in _EVENT_TYPE) {
        const v = _EVENT_TYPE[i];
        clientEvent.EVENT_TYPE[v] = 1;
    }

    clientEvent.init = function() {
        this.eventListener = eventListener.create('multi');
    };

    clientEvent.addEvent = function(eventName) {
        if (clientEvent.EVENT_TYPE[eventName]) {
            cc.error(`already have the event ${eventName}`);
            return;
        }

        clientEvent.EVENT_TYPE[eventName] = 1;
    };

    clientEvent.on = function(eventName, handler) {
        if (typeof eventName !== 'string') {
            return;
        }

        this.eventListener.on(eventName, handler);
    };

    clientEvent.off = function(eventName, handler) {
        if (typeof eventName !== 'string') {
            return;
        }

        this.eventListener.off(eventName, handler);
    };

    clientEvent.dispatchEvent = function(...params) {
        const [eventName] = params;
        if (typeof eventName !== 'string') {
            return;
        }

        const eventIndex = clientEvent.EVENT_TYPE[eventName];

        if (!eventIndex) {
            cc.error(`please add${eventName}the event into clientEvent.js`);
            return;
        }

        // this.eventListener.dispatch.apply(this.eventListener, arguments);
        this.eventListener.dispatch(...params);
    };

    clientEvent.bindEventListener = function() {
        this.eventListener = eventListener.create('multi');
    };

    return clientEvent;
});
