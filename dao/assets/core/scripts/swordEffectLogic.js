cc.Class({
    extends: cc.Component,
    onLoad: function() {
        this.changeTime = 0.2;
        this.isDefence = true;
        this.changeSpeed = 500;
        this.adjustMoreSpeed = 200;
        this.adjustLessSpeed = 400;
        this.captureSpeed = 600;
        this.releaseSpeed = 1500;
        this.releaseRotation = 1E3;
        this.rollRotation = 0;
        this.totalCnt = 0;
    },

    setData(totalCnt, index) {
        this.totalCnt = totalCnt;
        this.knifeCountComp = {maxCount: 20, index: index};
    },

    getFinalPosition: function() {
        this.acceleration = 0;
        var a = this.totalCnt;
        var b = this.knifeCountComp.index;
        var d = this.getRadiusByKnifeCount(a);
        d = this.isDefence ? d - 90 : d;
        this.rollRotation = 360 / a * b;
        a = Math.sin(this.rollRotation * Math.PI / 180) * d;
        b = Math.cos(this.rollRotation * Math.PI / 180) * d;
        return cc.v2(b, a)
    },

    rotateKnife: function() {
        let self = this;
        if (this.node) {
            let targetRotation = this.isDefence ? 90 - this.rollRotation : 540 - this.rollRotation;
            if (this.lastRotation !== targetRotation) {
                this.isRotating = true;
                this.lastRotation = targetRotation;
                let rotateAction = cc.rotateTo(this.changeTime, targetRotation);
                let rotateActionEnd = cc.callFunc(function() {
                    self.isRotating = false;
                });
                this.node.stopAllActions();
                this.node.runAction(cc.sequence(rotateAction, rotateActionEnd));
            } else if (this.isRotating || this.node.angle !== targetRotation) {
                this.node.angle = targetRotation;
            }
        }
    },

    setScale: function() {
        var a = .05 * this.knifeCountComp.index + 1.1;
        a = 1.65 < a ? 1.65 : a;
        this.node.scaleY !== a && (this.node.scaleY = a)
        this.node.scaleX !== a && (this.node.scaleX = a)

    },

    update: function(a) {
        this.finalPosition = this.getFinalPosition();
        this.rotateKnife();
        this.setScale();
        var c = this;
        if (this.finalPosition && (this.finalPosition.x !== this.node.position.x || this.finalPosition.y !== this.node.position.y)) {
            var d = this.finalPosition.sub(this.node.position),
                h = d.mag();
            if (this.moveDistance = this.changeSpeed * a, this.isAdjust && (this.isMore ? this.moveDistance = this.adjustMoreSpeed * a : this.moveDistance = this.adjustLessSpeed *
                    a), this.isCapture && (this.moveDistance = this.captureSpeed * a), this.isRelease && (this.moveDistance = this.releaseSpeed * a, this.node.angle += this.releaseRotation * a), this.acceleration += 50 * a, this.moveDistance += this.acceleration, this.moveDistance < h) this.node.position = this.node.position.add(d.mul(this.moveDistance / h));
            else if (this.node.position = this.finalPosition, this.isAdjust && (this.isAdjust = !1), this.isCapture && (this.isCapture = !1), this.isRelease) a = cc.rotateBy(.5, this.releaseRotation / 2), d = cc.callFunc(function() {
                c.isRelease = false
            }),
                this.node.runAction(cc.sequence(a, d))
        }
    },

    getRadiusByKnifeCount: function(a) {
        return 250 * this.getRadioByCount(a)
    },

    getRadioByCount: function(a) {
        return (8 > a ? 0 : 20 < a ? 12 : a - 8) / 12 + 1
    },
});
