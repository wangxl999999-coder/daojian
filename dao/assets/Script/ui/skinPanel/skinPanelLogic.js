// 界面逻辑层
kf.addModule('skinPanel.skinPanelLogic', function() {
    var logicObj = {};
    logicObj.init = function() {
        this.registerNetMsg();
    };

    // 专门用于注册网络事件返回
    logicObj.registerNetMsg = function() {

    };

    return logicObj;
});

