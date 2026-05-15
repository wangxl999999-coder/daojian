const pool = kf.require('basic.pool');

const SCROLL_NUM = cc.Enum({
    TOP_BOTTOM: 0,
    LEFT_RIGHT: 1,
});
const SCROLL_TYPE = cc.Enum({
    '上下滑动': SCROLL_NUM.TOP_BOTTOM,
    '左右滑动': SCROLL_NUM.LEFT_RIGHT,
});
cc.Class({
    extends: cc.Component,

    properties: {
        _scrollType: SCROLL_NUM.TOP_BOTTOM,
        modelType: {
            get () {
                return this._scrollType;
            },
            set (value) {
                this._scrollType = value;
            },
            type: SCROLL_TYPE,
            tooltip: '选择滚动模式',
            displayName: '滚动模式',
        },
        itemTemplate: { // item template to instantiate other items
            default: null,
            type: cc.Prefab,
            tooltip: '被复用的subPanel',
        },
        spawnCount: {
            default: 0,
            type: cc.Integer,
            tooltip: '实际克隆的个数',
        },
        spacing: {
            default: 0,
            type: cc.Float,
            tooltip: '每个之间的间隔',
        },
        topOrLeft: {
            default: 0,
            type: cc.Float,
            tooltip: '顶部或左边的偏移量',
        },
        bottomOrRight: {
            default: 0,
            type: cc.Float,
            tooltip: '底部或右边的偏移量',
        },
    },

    // use this for initialization
    onLoad () {
        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;
        this.items = []; // array to store spawned items
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.lastContentPosY = 0; // use this variable to detect if we are scrolling up or down

        // 设置滚动框属性
        this.scrollView.vertical = true;
        this.scrollView.horizontal = false;
        this.content.setAnchorPoint(0.5, 1);
        const widgetComponent = this.content.getComponent(cc.Widget);
        if (!widgetComponent) {
            console.warn('no widget component in content, please add it!');
            return;
        }
        widgetComponent.left = 2.5;
        widgetComponent.right = 2.5;
        widgetComponent.isAlignTop = false;
        widgetComponent.isAlignBottom = false;
        this.content.y = this.node.getChildByName('view').height / 2;
        if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
            this.scrollView.vertical = false;
            this.scrollView.horizontal = true;
            this.content.setAnchorPoint(0, 0.5);
            widgetComponent.top = 2.5;
            widgetComponent.bottom = 2.5;
            widgetComponent.isAlignLeft = false;
            widgetComponent.isAlignRight = false;
            widgetComponent.isAlignTop = true;
            widgetComponent.isAlignBottom = true;
        }
        this.initialize();
    },

    setData (dataArr) {
        this.dataArr = dataArr;
        this.totalCount = this.dataArr.length;// 总个数

        let i;
        for (i = 0; i < this.spawnCount; ++i) {
            if (i >= this.dataArr.length) {
                break;
            }

            if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
                this.items[i].setPosition(this.topOrLeft + this.items[i].width * (0.5 + i) + this.spacing * (i + 1), 0);
            } else {
                this.items[i].setPosition(0, -this.topOrLeft + -this.items[i].height * (0.5 + i) - this.spacing * (i + 1));
            }

            if (!this.items[i].getComponent(this.itemTemplate.name)) {
                console.error('-------------- reuseScrollview报错');
                console.log(this.itemTemplate.name);
                console.log(this.items[i].getComponent(this.itemTemplate.name));
            }

            this.items[i].getComponent(this.itemTemplate.name).itemIndex = i;
            this.items[i].getComponent(this.itemTemplate.name).setData(this.dataArr[i]);
            this.items[i].active = true;
        }

        for (i = this.dataArr.length; i < this.spawnCount; ++i) {
            this.items[i].active = false;
        }

        if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
            // get total content width
            this.content.width = (this.totalCount * (this.items[0].width + this.spacing)) + this.spacing - this.topOrLeft + this.bottomOrRight;
        } else {
            // get total content height
            this.content.height = (this.totalCount * (this.items[0].height + this.spacing)) + this.spacing - this.topOrLeft + this.bottomOrRight;
        }
    },

    initialize () {
        pool.createPrefabPool(this.itemTemplate);

        for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
            const item = pool.getPrefab(this.itemTemplate.name);
            this.content.addChild(item);
            if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
                item.setPosition(this.topOrLeft + item.width * (0.5 + i) + this.spacing * (i + 1), 0);
            } else {
                item.setPosition(0, -this.topOrLeft + -item.height * (0.5 + i) - this.spacing * (i + 1));
            }
            item.active = false;
            this.items.push(item);
        }
    },

    getPositionInView (item) { // get item position in scrollview's node space
        const worldPos = item.parent.convertToWorldSpaceAR(item.position);
        const viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    update (dt) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return; // we don't need to do the math every frame
        this.updateTimer = 0;
        const items = [...this.items];
        let scrollDirect = this.scrollView.content.y < this.lastContentPosY; // 往下滑
        let offset = (this.items[0].height + this.spacing) * items.length;
        if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
            scrollDirect = this.scrollView.content.x > this.lastContentPosX; // 往右滑
            offset = (this.items[0].width + this.spacing) * items.length;
        }
        let item;
        let itemIndex;
        for (let i = 0; i < items.length; ++i) {
            const viewPos = this.getPositionInView(items[i]);
            if (scrollDirect) {
                let condition = viewPos.y < -(items[i].height + this.node.height / 2 + this.spacing) && items[i].y + offset < 0;
                if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
                    condition = viewPos.x > (items[i].width + this.node.width / 2 + this.spacing) && items[i].x - offset > 0;
                }

                if (condition) {
                    item = items[i].getComponent(this.itemTemplate.name);
                    itemIndex = item.itemIndex - items.length; // update item id
                    if (itemIndex < 0) {
                        return;
                    }
                    if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
                        items[i].x -= offset;
                    } else {
                        items[i].y += offset;
                    }

                    this.items[i].getComponent(this.itemTemplate.name).itemIndex = itemIndex;
                    item.setData(this.dataArr[itemIndex]);
                }
            } else {
                let condition = viewPos.y > (this.node.height / 2 + items[i].height + this.spacing) && items[i].y - offset > -this.content.height;
                if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
                    condition = -viewPos.x > (this.node.width / 2 + items[i].width + this.spacing) && items[i].x + offset < this.content.width;
                }
                if (condition) {
                    item = items[i].getComponent(this.itemTemplate.name);
                    itemIndex = item.itemIndex + items.length;

                    if (itemIndex >= this.dataArr.length) {
                        return;
                    }

                    if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
                        items[i].x += offset;
                    } else {
                        items[i].y -= offset;
                    }

                    this.items[i].getComponent(this.itemTemplate.name).itemIndex = itemIndex;
                    item.setData(this.dataArr[itemIndex]);
                }
            }
        }

        // update lastContentPosY or lastContentPosX
        if (this._scrollType === SCROLL_NUM.LEFT_RIGHT) {
            this.lastContentPosX = this.scrollView.content.x;
        } else {
            this.lastContentPosY = this.scrollView.content.y;
        }
    },

    scrollEvent (sender, event) {
        // switch(event) {
        //     case 0:
        //         this.lblScrollEvent.string = 'Scroll to Top';
        //         break;
        //     case 1:
        //         this.lblScrollEvent.string = 'Scroll to Bottom';
        //         break;
        //     case 2:
        //         this.lblScrollEvent.string = 'Scroll to Left';
        //         break;
        //     case 3:
        //         this.lblScrollEvent.string = 'Scroll to Right';
        //         break;
        //     case 4:
        //         this.lblScrollEvent.string = 'Scrolling';
        //         break;
        //     case 5:
        //         this.lblScrollEvent.string = 'Bounce Top';
        //         break;
        //     case 6:
        //         this.lblScrollEvent.string = 'Bounce bottom';
        //         break;
        //     case 7:
        //         this.lblScrollEvent.string = 'Bounce left';
        //         break;
        //     case 8:
        //         this.lblScrollEvent.string = 'Bounce right';
        //         break;
        //     case 9:
        //         this.lblScrollEvent.string = 'Auto scroll ended';
        //         break;
        // }
    },
});
