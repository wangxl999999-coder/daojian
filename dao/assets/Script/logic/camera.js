/**
 * by Super 2019/03/30
 */

const localConfig = require('localConfig');

kf.addModule('logic.camera', () => {
    
    const camera = {
        cameraComp: null, // 相机组件
        cameraConfig: null, // 相机缩放的配置信息
        minWeaponNum: null, // 配置文件中最小的刀剑数量
        maxWeaponNum: null, // 配置文件中最大的刀剑数量
        oldNum: 0, // 旧的刀剑数量
        targetRatio: 1, // 目标相机缩放比率
        chagneWeaponNumTimmer: null, // 定时器
    };

    camera.init = function() {

    };

    /**
     * 获取对应数量的配置
     */
    camera._getConfig = function (num) {
        if (!this.cameraConfig) {
            return;
        }
        if (num <= this.minWeaponNum) {
            return this.cameraConfig[this.minWeaponNum];
        }
        if (num >= this.maxWeaponNum) {
            return this.cameraConfig[this.maxWeaponNum];
        }
        return this.cameraConfig[num];
    }
    /**
     * 设置相机
     */
    camera.setCamera = function (cameraComp) {
        this.cameraConfig = localConfig.getTable('camera');
        for (const key in this.cameraConfig) {
            if (!this.minWeaponNum || this.minWeaponNum > Number(key)) {
                this.minWeaponNum = Number(key);
            }
            if (!this.maxWeaponNum || this.maxWeaponNum < key) {
                this.maxWeaponNum = Number(key);
            }
        }
        this.cameraComp = cameraComp;
    };

    /**
     * 增加武器 角色半径瞬时变化,镜头缓慢变化
     */
    camera.chagneWeaponNum = function (num) {
        return;
        if (this.oldNum === num) {
            return;
        }
        const config = this._getConfig(num);
        clearInterval(this.chagneWeaponNumTimmer);
        if (this.oldNum < num) { // 武器数量变多
            this.targetRatio = config.zoomRatio;
            this.chagneWeaponNumTimmer = setInterval(() => {
                let diffRatio = this.cameraComp.zoomRatio - this.targetRatio;
                if (Math.abs(diffRatio) < 0.01) {
                    this.cameraComp.zoomRatio = this.targetRatio;
                } else if (diffRatio > 0) {
                    this.cameraComp.zoomRatio -= 0.001;
                } else {
                    this.cameraComp.zoomRatio += 0.001;
                }
            }, 16);
        } else { // 武器数量变少
            this.cameraComp.zoomRatio = config.zoomRatio;
        }

    };

    return camera;
});
