cc.Class({
    extends: cc.Component,
    properties: {
        // nickNameLb: cc.Label,
        arrowNode: cc.Node,
        bgNode: cc.Node,
        updateTime: 0.03, // 更新的时间,以达到性能优化的目的
        timeDiff: 0, // 设置时间间隔, 不要那么经常更新
    },

    setHostPlayer(hostPlayer) {
        this.hostPlayer = hostPlayer;
        // this.nickNameLb.node.color = this.hostPlayer.uiColor;
        // this.nickNameLb.string = this.hostPlayer.playerName;
        this.bgNode.color = this.hostPlayer.uiColor;
        this.arrowNode.color = this.hostPlayer.uiColor;
        this.playerCamera = cc.Camera.findCamera(this.hostPlayer.node)
    },

    calcAngleDegrees(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    },

    lateUpdate(dt) {
        this.timeDiff += dt;
        if (this.timeDiff < this.updateTime) {
            return;
        }
        this.timeDiff = 0;

        if (this.hostPlayer && this.hostPlayer.node.active) {
            let fanCnt = this.hostPlayer.getFansAmount();
            // this.nickNameLb.string = fanCnt;
            // this.bgNode.width = 128 + 30 * (fanCnt > 100 ? 2 : fanCnt > 10 ? 1 : 0);
            let hostPlayerWorldPos = this.hostPlayer.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let localPos = this.node.parent.convertToNodeSpaceAR(hostPlayerWorldPos);
            let maxX = cc.Canvas.instance.node.width * 0.5;
            let maxY = cc.Canvas.instance.node.height * 0.5;
            let lDPoint = cc.v2(-maxX, -maxY);
            let lUPoint = cc.v2(-maxX, maxY);
            let rDPoint = cc.v2(maxX, -maxY);
            let rUPoint = cc.v2(maxX, maxY);

            let point = this.segmentsIntr(lDPoint, lUPoint, cc.v2(0, 0), localPos);
            if (!point) {
                point = this.segmentsIntr(rDPoint, rUPoint, cc.v2(0, 0), localPos);
            }
            if (!point) {
                point = this.segmentsIntr(lUPoint, rUPoint, cc.v2(0, 0), localPos);
            }
            if (!point) {
                point = this.segmentsIntr(lDPoint, rDPoint, cc.v2(0, 0), localPos);
            }
            if (point) {
                this.node.position = point;
                let angle = this.calcAngleDegrees(localPos.x, localPos.y);
                this.node.angle = -angle;
                this.node.opacity = 255;
            } else {
                let hostPlayerWorldPos = this.hostPlayer.node.convertToWorldSpaceAR(cc.v2(0, 0));
                let cameraPos = cc.v2(0,0);
                this.playerCamera.getWorldToScreenPoint(hostPlayerWorldPos ,cameraPos);
                if(cameraPos.x > 0 && cameraPos.x < cc.Canvas.instance.node.width && cameraPos.y > 0&&cameraPos.y < cc.Canvas.instance.node.height){
                    this.node.opacity = 0;
                }else {
                }
            }
        } else {
            this.node.opacity = 0;
        }
    },

    segmentsIntr(a, b, c, d) {
        /** 1 解线性方程组, 求线段交点. **/
            // 如果分母为0 则平行或共线, 不相交
        var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return false;
        }
        // 线段所在直线的交点坐标 (x , y)
        var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;
        /** 2 判断交点是否在两条线段上 **/
        if (// 交点在线段1上
        (x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
        // 且交点也在线段2上
        && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0
        ) {
            // 返回交点p
            return {
                x: x,
                y: y
            }
        }
        //否则不相交
        return false
    }
});
