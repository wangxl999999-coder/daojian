/**
 * Created by super on 2017/11/29.
 * 提供动画相关操作
 */

kf.addModule('util.animation', () => {
    const animUtil = {};

    /**
     * @description 设置动画的WrapMode并进行播放
     * @param { cc.Animation } anim 挂载在节点上的动画组件
     * @param { String } name 动画名称
     * @param { Number } wrapMode 播放的模式, 使用 cc.WrapMode 来进行获取
     */
    animUtil.playByWrapMode = (anim, name, wrapMode) => {
        // 判断动画模式是否正确
        if (!cc.WrapMode.hasOwnProperty(wrapMode)) {
            cc.error('please use cc.WrapMode to set wrapMode');
        }
        // 获取动画片段
        const as = anim.getAnimationState(name);
        
        as.wrapMode = wrapMode.toString();
        return anim.play(name);
    };

    /**
     * @description 设置动画的回调
     * @param { cc.Animation } anim 挂载在节点上的动画组件
     * @param { String } name 动画名称
     * @param { callback }
     */
    animUtil.setAnimFinished = (anim, name, callback) => {
        const as = anim.getAnimationState(name);
        as.on('finished', callback);
    };

    return animUtil;
});
