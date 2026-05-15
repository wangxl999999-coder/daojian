/**
 * Created by leo on 2017/11/12.
 */

/**
 * Created by leo on 16/2/21.
 */

kf.addModule('basic.panelCenter', () => {
    const clientEvent = kf.require('basic.clientEvent');

    const panelCenter = {};
    const ZORDER = cc.Enum({
        SUB_SCENE_ZORDER: 0,
        BATTLE_ROOM_ZORDER: 3,
        SUB_PANEL_ZORDER: 4,
        COMMON_MASK_ZORDER: 1000,
        WORLD_PANEL_ZORDER: 2000,
        WORLD_ANIMATION_ZORDER: 3000,
        MODAL_PANEL_ZORDER: 4000,
        GLOBAL_FLOATING_PANEL_ZORDER: 5000,
        LOADING_PANEL_ZORDER: 6000,
        ALERT_PANEL_ZORDER: 7000,
    });

    panelCenter.init = function() {

    };

    panelCenter.setMaskNodeHide = function() {
        this.maskNode.opacity = 0;
    };

    panelCenter.setMaskNodeShow = function() {
        this.maskNode.opacity = 150;
    };

    panelCenter.addClickMaskEvent = function(maskNode) {
        maskNode.on('touchstart', (event) => {
            event.stopPropagation();
        });

        maskNode.on('touchend', (event) => {
            event.stopPropagation();
        });

        maskNode.on('touchmove', (event) => {
            event.stopPropagation();
        });

        maskNode.on('touchcancel', (event) => {
            event.stopPropagation();
        });

        maskNode.on('mousedown', (event) => {
            event.stopPropagation();
        });

        maskNode.on('mouseenter', (event) => {
            event.stopPropagation();
        });

        maskNode.on('mousemove', (event) => {
            event.stopPropagation();
        });

        maskNode.on('mouseleave', (event) => {
            event.stopPropagation();
        });

        maskNode.on('touchend', (event) => {
            event.stopPropagation();
        });

        maskNode.on('mousewheel', (event) => {
            event.stopPropagation();
        });
    };

    panelCenter.initGraphic = function(scene, maskNode, uiRoot) {
        this.clearEvent();

        this.subScenes = {};
        this.subPanels = {};
        this.subPanelActives = {};

        this.newestSubPanelName = '';

        this.runningScene = scene;

        this.initEventDispatcherStack();
        clientEvent.bindEventListener();

        this.curActiveSubScene = uiRoot;
        this.maskNode = maskNode;
        this.maskNode.active = false;
        this.maskNode.width = cc.winSize.width;
        this.maskNode.height = cc.winSize.height;

        this.addClickMaskEvent(this.maskNode);

        this.curCommonSubPanelZorder = ZORDER.WORLD_PANEL_ZORDER;
        this.curModalSubPanelZorder = ZORDER.MODAL_PANEL_ZORDER;

        this.registerEvent();
    };

    panelCenter.clearEvent = function() {
        this.subScenes = {};
        this.subPanels = {};

        this.newestSubPanelName = '';

        this.initEventDispatcherStack();
    };

    panelCenter.getWinSize = function() {
        if (this.curActiveSubScene) {
            return this.curActiveSubScene.getContentSize();
        }

        return this.runningScene.getContentSize();
    };

    panelCenter.initEventDispatcherStack = function() {
        this.subPanelStack = [];

        this.curActiveSubScene = null;
        this.nextSubScene = null;

        this.subPanelStackIndex = -1;

        this.subSceneStack = [];
        this.subSceneStackIndex = 0;

        this.eventDispatcherStack = [];
        this.eventDispatcherStackIndex = 0;
    };

    panelCenter.pushEventDispatcher = function(eventDispatcher) {
        this.eventDispatcherStackIndex = this.eventDispatcherStackIndex + 1;
        this.eventDispatcherStack[this.eventDispatcherStackIndex] = eventDispatcher;

        cc.director.setEventDispatcher(eventDispatcher);
    };

    panelCenter.popEventDispatcher = function() {
        this.eventDispatcherStackIndex = this.eventDispatcherStackIndex - 1;
        const eventDispatcher = this.eventDispatcherStack[this.eventDispatcherStackIndex];

        cc.director.setEventDispatcher(eventDispatcher);
    };

    panelCenter.getSubPanel = function(name) {
        return this.subPanels[name];
    };

    // 判断panel是否显示
    panelCenter.getPanelIsVisible = function(name) {
        if (this.subPanelActives[name]) {
            return true;
        }
        if (this.getSubPanel(name) && this.getSubPanel(name) && this.getSubPanel(name).active) {
            return true;
        }

        return false;
    };


    panelCenter.getAndCreateSubPanel = function(name, cb) {
        let parent;

        if (!this.curActiveSubScene) {
            parent = this.runningScene;
        } else {
            parent = this.curActiveSubScene;
        }

        const loadOverCallFunc = (subPanel1) => {
            const subPanel = subPanel1;
            if (!subPanel) {
                cc.error('can not find sub panel class ', name);
                return;
            }

            if (!subPanel.getComponent('panel')) {
                cc.error(name, '没有加载panel脚本');
                return;
            }

            const panelComponent = subPanel.getComponent('panel');
            subPanel.setName(name.replace(/\//g, '.'));
            this.subPanels[name] = subPanel;

            // if (panelComponent.customOrder) {
            //     parent = this.runningScene;
            // }

            if (subPanel.getParent() !== parent) {
                subPanel.parent = parent;
                if (panelComponent.isModal) {
                    subPanel.zIndex = ZORDER.MODAL_PANEL_ZORDER;
                } else if (panelComponent.customFlag && panelComponent.customOrder) {
                    subPanel.zIndex = panelComponent.customOrder;
                } else {
                    subPanel.zIndex = ZORDER.WORLD_PANEL_ZORDER;
                }
            }

            cb(subPanel);
        };

        let subPanel = this.subPanels[name];
        if (!subPanel) {
            let pathName = name;
            let paths = [];
            // if (cc.loader._resources.getAllPaths) {
            //     // creator 1.6.2的写法
            //     paths = cc.loader._resources.getAllPaths();
            // } else {
                // paths = Object.keys(cc.loader._resources._pathToUuid);
                // cc.resources._config.getDirWithPath(this.root, null, paths);
                cc.resources.getDirWithPath('panel',null, paths);
            // }
            for (let i = 0; i < paths.length; i++) {
                const aliasPath = paths[i].path;
                const aliasArr = aliasPath.split('/');
                if (aliasArr[aliasArr.length - 1] === name) {
                    pathName = aliasPath;
                    break;
                }
            }
            cc.loader.loadRes(pathName, cc.Prefab, (err, prefab) => {
                subPanel = null;
                if (this.subPanels[name]) {
                    subPanel = this.subPanels[name];
                } else if (!err) {
                    if (cc.supportJit) {
                        cc.supportJit = false;
                        subPanel = cc.instantiate(prefab);
                        cc.supportJit = true;
                    } else {
                        subPanel = cc.instantiate(prefab);
                    }

                    subPanel.active = false;
                }
                loadOverCallFunc(subPanel);
            });
        } else {
            loadOverCallFunc(subPanel);
        }
    };

    panelCenter.getAndCreateSubPanelNotHide = function (name, cb) {
        var parent;

        if (!this.curActiveSubScene) {
            parent = this.runningScene;
        } else {
            parent = this.curActiveSubScene;
        }

        var loadOverCallFunc = function(subPanel) {
            if (!subPanel) {
                cc.error("can not find sub panel class ", name);
                return;
            }

            if (!subPanel.getComponent("panel")) {
                cc.error(name, "没有加载panel脚本");
                return;
            }

            var panelComponent = subPanel.getComponent("panel");
            subPanel.setName(name.replace(/\//g, "."));
            this.subPanels[name] = subPanel;

            // if (panelComponent.customOrder) {
            //     parent = this.runningScene;
            // }

            // if (subPanel.getParent() !== parent) {
            //     subPanel.parent = parent;
            //     if (panelComponent.isModal) {
            //         parent.setLocalZOrder(ZORDER.MODAL_PANEL_ZORDER);
            //     } else if (panelComponent.customOrder) {
            //         parent.setLocalZOrder(panelComponent.customOrder);
            //     } else {
            //         parent.setLocalZOrder(ZORDER.WORLD_PANEL_ZORDER);
            //     }
            // }

            cb(subPanel);
        }.bind(this);

        var subPanel = this.subPanels[name];
        if (!subPanel) {
            var pathName = name;
            var paths = [];
            // if (cc.loader._resources.getAllPaths) {
            //     // creator 1.6.2的写法
            //     paths = cc.loader._resources.getAllPaths();
            // } else {

                // cc.resources._config.getDirWithPath(this.root, null, paths);
                cc.resources.getDirWithPath('panel',null, paths);
                // paths = Object.keys(cc.loader._resources._pathToUuid);
            // }
            for (var i = 0; i < paths.length; i++) {
                var aliasPath = paths[i].path;
                var aliasArr = aliasPath.split("/");
                if (aliasArr[aliasArr.length - 1] === name) {
                    pathName = aliasPath;
                    break;
                }
            }
            cc.loader.loadRes(pathName, cc.Prefab, function(err, prefab) {
                subPanel = null;

                if (this.subPanels[name]) {
                    subPanel = this.subPanels[name];
                } else if (!err) {
                    if (cc.supportJit) {
                        cc.supportJit = false;
                        subPanel = cc.instantiate(prefab);
                        cc.supportJit = true;
                    } else {
                        subPanel = cc.instantiate(prefab);
                    }
                }
                loadOverCallFunc(subPanel);
            }.bind(this));
        } else {
            loadOverCallFunc(subPanel);
        }
    };

    panelCenter.finishChangeSubScene = function() {
        if (this.curActiveSubScene) {
            this.curActiveSubScene.hide(this.nextSubScene.getName());
            this.curActiveSubScene.setPosition(0, 0);
        }

        this.curActiveSubScene = this.nextSubScene;
        this.nextSubScene = null;

        this.subPanelStack = [];
        this.subPanelStackIndex = -1;
        cc.eventManager.setEnabled(true);
    };

    panelCenter.registerEvent = function(...params) {
        clientEvent.on('showSubScene', (subSceneName) => {
            this.hideAllSubPanel();
            cc.log(`show_world_subScene:${subSceneName}`);

            const subScene = this.getSubScene(subSceneName);
            if (subScene.active) {
                return;
            }

            this.nextSubScene = subScene;

            if (this.curActiveSubScene) {
                if (subScene.isRememberFromScene()) {
                    this.pushSubScene(this.curActiveSubScene);
                } else {
                    this.subSceneStackIndex = 0;
                }
            }

            this.finishChangeSubScene();

            const args = [];
            for (let i = 1; i < params.length; i++) {
                args.push(params[i]);
            }

            subScene.show(params);
        });

        clientEvent.on('showPanel', (...params1) => {
            // pass arguments to panel.show except panelName
            const [panelName] = params1;
            const args = [];
            let i;
            for (i = 1; i < params1.length; ++i) {
                args[args.length] = params1[i];
            }
            this.subPanelActives[panelName] = true;
            this.getAndCreateSubPanel(panelName, (panel1) => {
                const panel = panel1;
                if (!panel) {
                    cc.error(`can't find ${panelName}`);
                    return;
                }

                console.log(`showPanel:${panelName}`);

                if (!this.subPanelActives[panelName]) {
                    return;
                }
                this.newestSubPanelName = panelName;

                if (panel.active) {
                    clientEvent.dispatchEvent('hidePanel', panelName);
                }

                i = 0;
                let subPanel;
                const panelComponent = panel.getComponent('panel');
                if (panelComponent.isModal) {
                    let index = -1;
                    for (i = 0; i <= this.subPanelStackIndex; i++) {
                        subPanel = this.subPanelStack[i];
                        if (subPanel.getName() === panel.getName()) {
                            index = i;
                            break;
                        }
                    }

                    if (index !== -1) {
                        this.subPanelStack.splice(index, 1);
                        this.subPanelStackIndex = this.subPanelStackIndex - 1;
                        this.curModalSubPanelZorder = this.curModalSubPanelZorder - 1;
                        // for (i = index; i < this.subPanelStackIndex; i++) {
                        //     subPanel = this.subPanelStack[i];
                        //     subPanel.setLocalZOrder(subPanel.getLocalZOrder());
                        // }
                    }

                    this.curModalSubPanelZorder = this.curModalSubPanelZorder + 2;

                    this.pushSubPanel(panel);
                    panel.zIndex = this.curModalSubPanelZorder;
                } else if (panelComponent.customFlag && panelComponent.customOrder) {
                    panel.zIndex = panelComponent.customOrder;
                } else {
                    this.curCommonSubPanelZorder = this.curCommonSubPanelZorder + 2;
                    panel.zIndex = this.curCommonSubPanelZorder;
                }

                if (panelComponent.show) {
                    panelComponent.show(...args);
                }
                clientEvent.dispatchEvent('showPanelOver', ...params1);
            });
        });

        clientEvent.on('hidePanel', (panelName) => {
            this.subPanelActives[panelName] = false;
            this.getAndCreateSubPanel(panelName, (panel1, ...params2) => {
                const hideParams = params2;
                const panel = panel1;
                const panelComponent = panel.getComponent('panel');
                if (!panel || (!panel.active && !panelComponent.isModal)) {
                    if (panel) {
                        if (panelComponent.hide) {
                            panelComponent.hide(...hideParams);
                        }
                    }
                    return;
                }

                panel.active = false;

                let i;
                // 隐藏遮罩层;
                let subPanel;
                do {
                    if (panelComponent.isModal) {
                        subPanel = this.subPanelStack[this.subPanelStackIndex];
                        if (!subPanel && this.subPanelStack.length > 0) {
                            this.subPanelStackIndex = this.subPanelStack.length - 1;
                            subPanel = this.subPanelStack[this.subPanelStackIndex];
                        }

                        if (!subPanel) {
                            break;
                        }

                        if (subPanel.getName() !== panelName) {
                            let index = -1;
                            for (i = 0; i <= this.subPanelStackIndex; i++) {
                                subPanel = this.subPanelStack[i];
                                if (subPanel.getName() === panel.getName()) {
                                    index = i;
                                    break;
                                }
                            }

                            if (index >= 0) {
                                for (i = index + 1; i <= this.subPanelStackIndex; i++) {
                                    subPanel = this.subPanelStack[i];
                                    const curIndex = subPanel.zIndex;
                                    subPanel.zIndex = curIndex - 2;
                                }

                                this.subPanelStack.splice(index, 1);
                                this.subPanelStackIndex = this.subPanelStackIndex - 1;
                                this.curModalSubPanelZorder = this.curModalSubPanelZorder - 2;
                                this.maskNode.zIndex = this.curModalSubPanelZorder - 1;
                            }

                            break;
                        }

                        this.popSubPanel();
                        subPanel = this.subPanelStack[this.subPanelStackIndex];
                        this.curModalSubPanelZorder = this.curModalSubPanelZorder - 2;

                        if (subPanel) {
                            this.showMaskNode(subPanel);
                        } else {
                            this.maskNode.active = false;
                        }
                    } else {
                        // this.curCommonSubPanelZorder = this.curCommonSubPanelZorder - 1;
                    }
                } while (0);

                // pass all arguments to prompt_panel except panel name
                if (panelComponent.hide) {
                    panelComponent.hide(...hideParams);
                }
                clientEvent.dispatchEvent('hidePanelOver', panelName);
            });
        });
    };

    panelCenter.pushSubPanel = function(subPanel) {
        this.subPanelStackIndex = this.subPanelStackIndex + 1;
        this.subPanelStack[this.subPanelStackIndex] = subPanel;

        this.showMaskNode(subPanel);
    };

    panelCenter.showMaskNode = function(subPanel) {
        this.maskNode.parent = subPanel.getParent();
        this.maskNode.zIndex = this.curModalSubPanelZorder - 1;
        this.maskNode.active = true;
    };

    panelCenter.popSubPanel = function() {
        const subPanel = this.subPanelStack.splice(this.subPanelStackIndex, 1)[0];
        this.subPanelStackIndex = this.subPanelStackIndex - 1;

        return subPanel;
    };

    panelCenter.getSubPanelStack = function() {
        return this.subPanelStack;
    };

    panelCenter.hideAllSubPanel = function() {
        const subPanelStack = this.subPanelStack;
        for (let idx = this.subPanelStackIndex; idx >= 0; idx--) {
            clientEvent.dispatchEvent('hidePanel', subPanelStack[idx]['__name']);
        }

        this.subPanelStackIndex = -1;
    };

    /**
     * 获取最新的subpanel的名称，主要部分界面在初始化的时候需要了解当前最新的subPanel是谁
     * */
    panelCenter.getNewestPanel = function() {
        return this.newestSubPanelName;
    };

    panelCenter.getCurSubScene = function() {
        return this.curActiveSubScene;
    };

    // 晃panel rootNode:panel的rootNode, time:s
    panelCenter.shakePanel = function(rootNode, time) {
        const perTime = time / 4;
        rootNode.runAction(cc.sequence(
            cc.delayTime(0.07),
            cc.scaleTo(perTime, 1.01, 1.01),
            cc.jumpBy(perTime, cc.p(0, 0), 5, 12),
            cc.scaleTo(perTime, 0.99, 0.99),
            cc.scaleTo(perTime, 1, 1),
        ));
    };

    return panelCenter;
});
