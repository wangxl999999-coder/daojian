const sceneFactoryObj = cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: {
            default: null,
            type: cc.Node,
            displayName: '蒙板',
            readonly: false, // optional, default is false
        },

        uiRoot: cc.Node,
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad () {
        const panelCenter = kf.require('basic.panelCenter');
        panelCenter.initGraphic(this.node, this.maskNode, this.uiRoot);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

kf.addModule('component.sceneFactory', () => sceneFactoryObj);
