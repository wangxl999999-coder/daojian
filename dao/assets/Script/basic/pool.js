/**
 * Created by john on 18/10/16.
 * 对象池模块
 */

kf.addModule('basic.pool', () => {
    const pool = {
        _name1: 'Pool',
        _name2: 'Prefab',
        init () {
        },

        getPool (name) {
            return this[name + this._name1];
        },

        isPool (name) {
            return this[name + this._name1] && this[name + this._name2];
        },

        // prefab, 任意类型的对象或者预制体
        // size，初始对象池的大小，推荐使用默认大小1
        createPrefabPool (prefab, count1) {
            let count = count1;
            if (!this.isPool(prefab.name)) {
                this[prefab.name + this._name1] = new cc.NodePool();
                this[prefab.name + this._name2] = prefab;
            }

            const prefabPool = this[prefab.name + this._name1];
            count = count || 1;
            count -= prefabPool.size();
            for (let k = 0; k < count; k++) {
                this[prefab.name + this._name1].put(cc.instantiate(prefab));
            }
        },

        // 从对象池中获取对象
        getPrefab (name) {
            let prefab = null;
            if (this.isPool(name)) {
                const prefabPool = this[name + this._name1];
                if (prefabPool.size() > 0) {
                    prefab = prefabPool.get();
                } else {
                    prefab = cc.instantiate(this[name + this._name2]);
                }
            }
            return prefab;
        },

        // 从对象池中获取对象,同时初始化
        getPrefabEx (name, data) {
            const prefab = this.getPrefab(name);
            if (prefab) prefab.getComponent(name).setData(data);

            return prefab;
        },

        putInPool (name, node) {
            if (!this.isPool(name)) return;
            this[name + this._name1].put(node);
        },

        // 回收子节点中属于对象池的对象
        putChildInPool (node) {
            if (!cc.isValid(node) || node.children.length === 0) return;
            const count = node.children.length;
            for (let i = 0; i < count; i++) {
                const child = node.children[0];
                if (!this.isPool(child.name)) continue;
                this.putChildInPool(child);
                this.putInPool(child.name, child);
            }
        },
    };

    return pool;
});
