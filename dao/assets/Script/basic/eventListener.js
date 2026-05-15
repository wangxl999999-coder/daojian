/**
 * Created by leo on 15/12/28.
 *
 * 事件处理类
 */

kf.addModule('basic.eventListener', () => {
    const oneTooOneListener = {};

    oneTooOneListener.on = function(eventName, handler) {
        if (this[eventName]) {
            console.error(`${eventName}had already register`);
        }

        this[eventName] = handler;
    };

    oneTooOneListener.dispatch = function(...params) {
        const [eventName] = params;
        const handler = this[eventName];
        const args = [];
        for (let i = 1; i < params.length; i++) {
            args.push(params[i]);
        }

        if (handler) {
            try {
                handler.apply(this, args);
            } catch (e) {
                console.error(e);
            }
        } else {
            cc.log(`not register ${eventName}    callback func`);
        }
    };

    const oneToMultiListener = {};

    oneToMultiListener.on = function(eventName, handler) {
        let handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (let i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = handler;
                return i;
            }
        }

        handlerList.push(handler);

        return handlerList.length;
    };

    oneToMultiListener.dispatch = function(eventName, ...args) {
        const handlerList = this.handlers[eventName];
        let i;
        if (!handlerList) {
            return;
        }

        const len = handlerList.length;
        for (i = 0; i < len; i++) {
            const handler = handlerList[i];
            if (handler) {
                try {
                    handler(...args);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    oneToMultiListener.off = function(eventName, handler) {
        const handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (let i = 0; i < handlerList.length; i++) {
            const oldHandler = handlerList[i];
            if (oldHandler === handler) {
                handlerList.splice(i, 1);
                break;
            }
        }
    };

    const eventListener = {};
    eventListener.create = function(type) {
        let newEventListener = {};

        if (type === 'multi') {
            newEventListener = Object.create(oneToMultiListener);
            newEventListener.handlers = {};
        } else {
            newEventListener = Object.create(oneTooOneListener);
        }

        return newEventListener;
    };

    return eventListener;
});
