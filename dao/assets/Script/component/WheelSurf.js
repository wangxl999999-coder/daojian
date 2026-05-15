/**
 * @description 转盘抽奖功能
 *  将本脚本放在转盘节点上
 * @author super
 */
cc.Class({
    extends: cc.Component,

    properties: {
        acc: {
            default: 99,
            type: cc.Integer,
            displayName: '加速度',
            tooltip: '设置转盘的加速度, 正整数',
        },
        gearNum: {
            default: 8,
            type: cc.Integer,
            displayName: '物品数量',
            tooltip: '转盘按照物品数量进行等分, 正整数',
        },
        maxSpeed: {
            default: 300,
            type: cc.Integer,
            displayName: '转盘的速度',
            tooltip: '速度要尽量低,避免不能准确进入',
        },
        duration: {
            default: 4,
            type: cc.Integer,
            displayName: '转动时间',
            tooltip: '转盘最小的转动时间',
        },
        radius: {
            default: 200,
            type: cc.Integer,
            displayName: '转盘半径',
            tooltip: '会影响到转盘上物品的摆放(靠近中心或远离)',
        },
        rotaNode: {
            default: null,
            type: cc.Node,
            displayName: '转动的节点',
            tooltip: '需要转动的节点,如果没有设置将转动当前节点',
        },
        isRandom: {
            default: false,
            displayName: '开启随机指向',
            tooltip: '开启此选项会在目标的左右随机停下,达到拟真效果',
        },
        // isSpringback: {
        //     default: false,
        //     type: cc.Boolean,
        //     displayName: '开启回弹',
        //     tooltip: '开启回弹后会超过目标一点,然后再往回运动一段距离'
        // }

    },

    editor: {
        // https://docs.cocos.com/creator/manual/zh/scripting/reference/class.html#type
        disallowMultiple: true,
        menu: 'Component/WheelSurf',
    },

    // use this for initialization
    onLoad() {
        this.wheel = {
            curSpeed: 0, // 当前运动速度
            spinTime: 0, // 转动运行时间
            gearAngle: 360, // 每个齿轮的角度
            finalAngle: 0, // 最终结果指定的角度
        };
        this.state = 0; // 0: 还没转, 1: 加速中及达到最大运行速度, 2: 减速
        this.wheel.gearAngle = 360 / this.gearNum; // 设置每个奖品的角度
        this.rotaNode = this.rotaNode || this.node;

        this.startFunc = null;
        this.endFunc = null;
        this.speedUpFunc = null;
        this.speedCutFunc = null;

        this.itemsArr = []; // 转盘上节点数组;
        this.calAngle(30, 90);
    },

    update(dt) {
        if (this.state === 0) { // 没有转动
            return;
        }

        if (this.state === 1) { // 开始转动
            this.wheel.spinTime += dt;

            this.rotaNode.angle += this.wheel.curSpeed * dt - this.acc * dt * dt * 0.5; // s = vt * t - a * t^2/ 2

            if (this.wheel.curSpeed <= this.maxSpeed) { // 没到最大时间继续转
                this.wheel.curSpeed += this.acc * dt;
            } else {
                if (this.wheel.spinTime < this.duration) { // 没到减速时间继续转
                    return;
                }

                // 减速前准备 设置目标角度
                this.wheel.curSpeed = this.maxSpeed; // 同步速度

                if (this.calAngle(this.rotaNode.angle + this.wheel.distance, this.wheel.finalAngle) < this.wheel.gearAngle) { // 避免在接近当前位置停止
                    let nowRotation = this.wheel.finalAngle - this.wheel.distance;
                    if (this.isRandom) { // 开启在目标左右随机停下
                        nowRotation += (Math.random() - 0.5) * this.wheel.gearAngle * 0.8;
                    }

                    // if (this.isSpringback) {
                    //     nowRotation += (this.wheel.gearAngle / 2);
                    // }
                    this.rotaNode.angle = nowRotation; // 同步角度同步

                    this.state = 2; // 将状态转为减速状态
                    if (this.speedCutFunc) {
                        this.speedCutFunc(this.data);
                    }
                }
            }
        } else if (this.state === 2) { // 减速
            this.rotaNode.angle += this.wheel.curSpeed * dt - this.acc * dt * dt * 0.5;

            if (this.wheel.curSpeed > 0) { // 没到最大时间继续转
                this.wheel.curSpeed -= (this.acc * dt);
            } else {
                this.state = 0;
                this.wheel.spinTime = 0; // 记录转动的时间改为0
                if (this.endFunc) {
                    this.endFunc(this.data);
                }
            }
        }
    },

    /**
     * @description 返回两个角度的差值, 在目标角度左边为负值, 右边为正值
     * @param {*} angle 角度1
     * @param {*} tarAngle 角度2
     */
    calAngle (angle, tarAngle) {
        let resultA = null;
        let resultB = null;
        angle %= 360;
        tarAngle %= 360;
        resultA = Math.abs(tarAngle - angle);
        resultB = Math.abs(360 - tarAngle) + angle;
        return resultA > resultB ? resultB : resultA;
    },

    /**
     * @description 设置转盘的相关参数
     * @param {*} param 配置的对象
     * @param {function} func 生成奖品项目的函数
     * @returns {Boolean}
     */
    setParameters(param, func) {
        if (this.state !== 0) {
            cc.error('请在转盘未转动时设置');
            return false;
        }
        const {
            acc = this.acc,
            gearNum = this.gearNum,
            maxSpeed = this.maxSpeed,
            duration = this.duration,
            dataArr,
        } = param;
        if (acc) {
            this.acc = acc;
        }
        if (gearNum) {
            this.gearNum = gearNum;
        }
        if (maxSpeed) {
            this.maxSpeed = maxSpeed;
        }
        if (duration) {
            this.duration = duration;
        }

        if (dataArr.length < 1) {
            cc.warn('没有奖品数据');
            return false;
        }

        this.wheel.gearAngle = 360 / this.gearNum; // 设置每个奖品的角度
        for (const item of this.itemsArr) {
            item.removeFromParent();
        }
        for (const value of dataArr) {
            const item = func(value);
            this.itemsArr.push(item);
            item.zIndex = value.ID;
            item.angle = (value.ID - 1) * this.wheel.gearAngle;
            item.parent = this.rotaNode;
            item.y = (this.radius * Math.cos(item.angle * Math.PI / 180));
            item.x = (this.radius * Math.sin(item.angle * Math.PI / 180));
            item.active = true;
        }
        this.wheel.distance = (this.maxSpeed ** 2) / (2 * this.acc); // 计算满速度到停止时所花费的角度(路程) 2as = vt^2 - v0^2
        return true;
    },

    /**
     * @description 转盘开始转动
     * @param {*} data 转动的参数
     */
    run(data) {
        if (this.state !== 0) {
            cc.warn('转盘还未停止');
            return false;
        }
        const { target, type, isFull } = data;
        this.ID = target;
        this.type = type;
        this.isFull = 0;
        this.target = target - 1;

        this.data = data;
        if (this.startFunc) {
            this.startFunc(this.data);
        }

        this.state = 1; // 0: 还没转, 1: 加速中及达到最大运行速度, 2: 减速
        // this.wheel.finalAngle = (target * this.wheel.gearAngle + this.wheel.defaultAngle) % 360 + (this.wheel.gearAngle / 2); // 计算最终角度
        this.wheel.finalAngle = 360 - (this.target * this.wheel.gearAngle) % 360; // 计算最终角度

        if (this.speedUpFunc) {
            this.speedUpFunc(this.data);
        }
        return true;
    },

    /**
     * 获取运行状态
     */
    getState () {
        return this.state;
    },

    /**
     * 转盘开始时调用
     * @param {*} cb
     */
    onStart (cb) {
        this.startFunc = cb;
    },

    /**
     * 转盘结束时调用
     * @param {*} cb
     */
    onEnd (cb) {
        this.endFunc = cb;
    },

    /**
     * 速度开始时的事件
     * @param {*} cb
     */
    onSpeedUp (cb) {
        this.speedUpFunc = cb;
    },

    /**
     * 速度减缓时的事件
     * @param {*} cb
     */
    onSpeedCut (cb) {
        this.speedCutFunc = cb;
    },
});
