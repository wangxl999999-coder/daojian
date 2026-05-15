cc.Class({
    'extends': cc.Component,
    properties: {
        rotateSpeed: 150,
        isStop: !1,
        stopKeepTime: .1,
        _stopTime: 0
    },
    onLoad () {
        
    },
    stopRotate () {
        this.isStop = true;
        this._stopTime = 0;
    },
    update (c) {
        if (this.isStop) {
            if (this._stopTime < this.stopKeepTime)
                return void(this._stopTime += c);
            this.isStop = !1
        }
        if (this.node.parent.getComponent('Player').isAI && cc.gameSpace.gameLogic.isInScreenExternal(this.node)) {
            // 在屏幕外
            return;
        }
        this.node.angle += this.rotateSpeed * c
    },
});
