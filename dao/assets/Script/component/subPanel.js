const panel = kf.require('component.panel');
const subPanelObj = cc.Class({
    extends: panel,
    properties: {
        _dataReady: false,
        _isShow: false,
        isModal: {
            default: false,
            visible: false,
            override: true,
        },

        customFlag: {
            default: false,
            visible: false,
            override: true,
        },
    },

    // use this for initialization
    onLoad () {
        this._super();
    },

    // 避免onEnable不被调用
    start () {
        this.onEnable();
    },

    setData (data) {
        this._data = data;
        this._dataReady = true;
        if (this._isShow) {
            this.show();
        }
    },

    getData () {
        return this._data;
    },

    isDataReady () {
        return this._dataReady;
    },

    // 需要子类去实现
    show () {

    },

    onDisable () {
        this._isShow = false;
    },

    // 负责调用UI界面刷新，在设定数据有效
    onEnable () {
        this._isShow = true;

        if (!this.isDataReady()) return;
        this.show();
        this._dataReady = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('component.subPanel', () => subPanelObj);
