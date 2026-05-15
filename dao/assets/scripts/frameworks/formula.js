/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by lizhiyi on 2017/2/9.
 */
var constants = null;
if (typeof cc !== "undefined") {
    constants = require("constants");
} else {
    constants = require("./constants");
}

var formula = {


    /**
     * 是否击中概率
     * @param {number} probability 概率(小于1大于0的数)
     * @returns {boolean} 是否击中概率
     */
    isHit (probability) {
        //Math.random()生成[0-1) 的数 并且向下取整，因此需要小于(并且不等于) 概率才算击中
        var value = Math.floor(Math.random() * (100));
        return value < probability * 100;
    },

    /**
     * 是否击中概率
     * @param {number} percent 概率(百分比)
     * @returns {boolean} 是否击中概率
     */
    isHitWithPercent (percent) {
        return this.isHit(percent / 100.0);
    },

    getRequirementByLevel (level) {
        switch (level) {
            case 1:
                return 0;
            case 2:
                return 5000;
            case 3:
                return 100000;
            case 4:
                return 5000000;
        }

        return 0;
    },

    getChipsAmountByLevel (level) {
        switch (level) {
            case 1:
                return [10, 20, 50, 100];
            case 2:
                return [500, 1000, 2500, 5000];
            case 3:
                return [10000, 20000, 50000, 100000];
            case 4:
                return [500000, 1000000, 2500000, 5000000];
        }

        return [10, 20, 50, 100];
    },

    /**
     * 获取筹码价值
     * @param {Number} index 
     */
    getChipAmount (level, index) {
        let arr = this.getChipsAmountByLevel(level);

        return arr[index];
    },
};

module.exports = formula;