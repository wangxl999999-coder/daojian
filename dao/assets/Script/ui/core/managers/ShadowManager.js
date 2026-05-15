cc.Class({
    extends: cc.Component,

    properties: {
        shadowPrefab: cc.Prefab,
        shadowParent: cc.Node
    },

    onLoad() {
        window.ShadowManager = this;
    },

    addShadow(target) {
        return;
        let shadow = cc.instantiate(this.shadowPrefab);
        shadow.parent = this.shadowParent;
        let shadowScript = shadow.getComponent('Shadow');
        shadowScript.setHost(target);
        return shadowScript;
    }
});
