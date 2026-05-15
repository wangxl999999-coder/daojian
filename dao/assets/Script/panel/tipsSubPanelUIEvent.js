// 引入subpanel模版
const clientEvent = kf.require('basic.clientEvent');
const subPanel = kf.require('component.subPanel');
const tipSubPanel = cc.Class({
    extends: subPanel,

    properties: {
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
        this._super();
    },

    hideTxt () {
        this.node.stopAllActions();

        const fadeOutAction = cc.fadeOut(1);
        this.node.runAction(cc.sequence(fadeOutAction, cc.callFunc(() => {
            this.node.active = false;
            clientEvent.dispatchEvent('hidePanel', 'tipsPanel');
        })));
    },

    show () {
        this._super();
        const curTxt = this.getData();
        this.node.opacity = 255;
        this.node.stopAllActions();
        this.node.position = cc.v2(0, 0);

        this.widget['tipTxt'].getComponent(cc.Label).string = curTxt;
        const size = this.widget['tipTxt'].getContentSize();
        const contentSize = this.widget['tipBg'].getContentSize();

        let floatWidth = size.width;

        if (floatWidth > cc.winSize.width) {
            floatWidth = cc.winSize.width;
        }

        this.widget['tipBg'].setContentSize(80 + floatWidth, contentSize.height);

        const moveAction = cc.sequence(cc.moveBy(0.3, 0, 40).easing(cc.easeIn(0.6)), cc.delayTime(0.7), cc.callFunc(() => {
            this.hideTxt(() => {
                this.node.active = false;
            });
        }));

        this.node.runAction(moveAction);
    },
});

kf.addModule('tipsPanel.tipsSubPanelUIEvent', () => tipSubPanel);
