require('src/settings');
require('src/cocos2d-js.js');
require('src/physics.js');
require('cc-spine.js');

require('src/main.js');

// 抖音小游戏平台初始化
if (typeof tt !== 'undefined') {
    console.log('抖音小游戏环境初始化');
    
    // 设置不显示状态栏
    tt.setKeepScreenOn({
        keepScreenOn: true
    });
    
    // 性能监控
    if (tt.onMemoryWarning) {
        tt.onMemoryWarning(() => {
            console.warn('内存警告');
            cc.sys.garbageCollect();
        });
    }
}
