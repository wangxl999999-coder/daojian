/**
 * Created by john on 16/10/7.
 * 适配creator，做了简化
 */

window.kf = window.kf || {};

kf._loadedItem = {};
kf.ignoreInitArr = [];
kf.addIgnoreInitDir = function(dirStr) {
    kf.ignoreInitArr.push(dirStr);
};

kf.addModule = function(requireName, cb) {
    const splitNameSpace = requireName.split('.');
    let item = window;
    let i;
    for (i = 0; i < splitNameSpace.length - 1; i++) {
        if (!item[splitNameSpace[i]]) {
            item[splitNameSpace[i]] = {};
        }

        item = item[splitNameSpace[i]];
    }

    item[splitNameSpace[splitNameSpace.length - 1]] = cb;
};

kf.require = function(requireName, noInit) {
    if (CC_EDITOR && requireName.indexOf('component') === -1) {
        return null;
    }

    let splitNameSpace;
    if (!kf._loadedItem[requireName]) {
        splitNameSpace = requireName.split('.');
        let item = window;
        let i;
        for (i = 0; i < splitNameSpace.length; i++) {
            if (!item) {
                break;
            }
            item = item[splitNameSpace[i]];
        }
        if (item) {
            kf._loadedItem[requireName] = item();
        } else {
            // 如果有\.的化，进行分割，取最后一个
            splitNameSpace = requireName.split('.');
            kf._loadedItem[requireName] = require(splitNameSpace[splitNameSpace.length - 1]);
            if (!kf._loadedItem[requireName] && cc && cc.require && cc.require !== require) {
                kf._loadedItem[requireName] = cc.require(splitNameSpace[splitNameSpace.length - 1]);
            }

            if (kf._loadedItem[requireName]) {
                if (window.cc && !cc.sys.isNative) {
                    console.error('please use kf.require, parentdir.filename!!!');
                }
            }
        }

        if (!noInit && kf._loadedItem[requireName]) {
            for (i = 0; i < kf.ignoreInitArr.length; i++) {
                const key = kf.ignoreInitArr[i];
                if (requireName.indexOf(key) === 0) {
                    break;
                }
            }

            if (i >= kf.ignoreInitArr.length) {
                if (kf._loadedItem[requireName].init) kf._loadedItem[requireName].init();
            }
        }
    }

    return kf._loadedItem[requireName];
};

let touchDispatchFunc = null;
// 禁用多点触控
kf.enableMulTouch = function(flag) {
    if (flag) {
        cc.eventManager.dispatchEvent = touchDispatchFunc;
        touchDispatchFunc = null;
    } else {
        touchDispatchFunc = cc.eventManager.dispatchEvent;
        let touchId = null;
        cc.eventManager.dispatchEvent = (...params) => {
            const [event] = params;
            if (event.getEventCode && event.getEventCode() === cc.Event.EventTouch.BEGAN) {
                if (event._touches.length > 1) {
                    event._touches.length = 1;
                }

                // 由于同一个点击事件的begin,move,end的id是一样的。所以在begin的时候进行id存储
                touchId = event._touches[0]._id;
            } else if (event.getEventCode && event.getEventCode() === cc.Event.EventTouch.ENDED) {

                // 判断多点触控里面是否有前面存下的touchid，有的话，只响应这一个touch
                let i = 0;
                for (; i < event._touches.length; i++) {
                    if (touchId === event._touches[i]._id) {
                        break;
                    }
                }

                if (i >= event._touches.length) {
                    return;
                }

                // 将点击事件精简成之前缓存的那个
                event._touches[0] = event._touches[i];
                event._touches.length = 1;
            }
            touchDispatchFunc(...params);
        };
    }
};

kf.clone = function(obj) {
    let o;
    if (typeof obj === 'object') {
        if (obj === null) {
            o = null;
        } else if (obj instanceof Array) {
            o = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                o.push(this.clone(obj[i]));
            }
        } else {
            o = {};
            for (const j in obj) {
                if (!obj.hasOwnProperty(j)) continue;
                o[j] = this.clone(obj[j]);
            }
        }
    } else {
        o = obj;
    }
    return o;
};

kf.cmp = function(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
};

/**
 * utf8 byte to unicode string
 * @param utf8Bytes
 * @returns {string}
 */
kf.utf8ByteToUnicodeStr = function(utf8Bytes) {
    let unicodeStr = '';
    for (let pos = 0; pos < utf8Bytes.length;) {
        const flag = utf8Bytes[pos];
        let unicode = 0;
        if ((flag >>> 7) === 0) {
            unicodeStr += String.fromCharCode(utf8Bytes[pos]);
            pos += 1;
        } else if ((flag & 0xFC) === 0xFC) {
            unicode = (utf8Bytes[pos] & 0x3) << 30;
            unicode |= (utf8Bytes[pos + 1] & 0x3F) << 24;
            unicode |= (utf8Bytes[pos + 2] & 0x3F) << 18;
            unicode |= (utf8Bytes[pos + 3] & 0x3F) << 12;
            unicode |= (utf8Bytes[pos + 4] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos + 5] & 0x3F);
            unicodeStr += String.fromCharCode(unicode);
            pos += 6;
        } else if ((flag & 0xF8) === 0xF8) {
            unicode = (utf8Bytes[pos] & 0x7) << 24;
            unicode |= (utf8Bytes[pos + 1] & 0x3F) << 18;
            unicode |= (utf8Bytes[pos + 2] & 0x3F) << 12;
            unicode |= (utf8Bytes[pos + 3] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos + 4] & 0x3F);
            unicodeStr += String.fromCharCode(unicode);
            pos += 5;
        } else if ((flag & 0xF0) === 0xF0) {
            unicode = (utf8Bytes[pos] & 0xF) << 18;
            unicode |= (utf8Bytes[pos + 1] & 0x3F) << 12;
            unicode |= (utf8Bytes[pos + 2] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos + 3] & 0x3F);
            unicodeStr += String.fromCharCode(unicode);
            pos += 4;
        } else if ((flag & 0xE0) === 0xE0) {
            unicode = (utf8Bytes[pos] & 0x1F) << 12;
            unicode |= (utf8Bytes[pos + 1] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos + 2] & 0x3F);
            unicodeStr += String.fromCharCode(unicode);
            pos += 3;
        } else if ((flag & 0xC0) === 0xC0) { // 110
            unicode = (utf8Bytes[pos] & 0x3F) << 6;
            unicode |= (utf8Bytes[pos + 1] & 0x3F);
            unicodeStr += String.fromCharCode(unicode);
            pos += 2;
        } else {
            unicodeStr += String.fromCharCode(utf8Bytes[pos]);
            pos += 1;
        }
    }
    return unicodeStr;
};


// 将字符串格式化为UTF8编码的字节
kf.writeUTF = function(str, isGetBytes) {
    const back = [];
    let byteSize = 0;
    let i;
    for (i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0x00 && code <= 0x7f) {
            byteSize += 1;
            back.push(code);
        } else if (code >= 0x80 && code <= 0x7ff) {
            byteSize += 2;
            back.push((192 | (31 & (code >> 6))));
            back.push((128 | (63 & code)));
        } else if ((code >= 0x800 && code <= 0xd7ff)
            || (code >= 0xe000 && code <= 0xffff)) {
            byteSize += 3;
            back.push((224 | (15 & (code >> 12))));
            back.push((128 | (63 & (code >> 6))));
            back.push((128 | (63 & code)));
        }
    }
    for (i = 0; i < back.length; i++) {
        back[i] &= 0xff;
    }
    if (isGetBytes) {
        return back;
    }
    if (byteSize <= 0xff) {
        return [0, byteSize].concat(back);
    }

    return [byteSize >> 8, byteSize & 0xff].concat(back);
};

// 读取UTF8编码的字节，并专为Unicode的字符串
kf.readUTF = function(arr) {
    if (typeof arr === 'string') {
        return arr;
    }

    let UTF = '';
    const _arr = arr;

    for (let i = 0; i < _arr.length; i++) {
        const one = _arr[i].toString(2);
        const v = one.match(/^1+?(?=0)/);
        if (v && one.length === 8) {
            const bytesLength = v[0].length;
            let store = _arr[i].toString(2).slice(7 - bytesLength);
            for (let st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            UTF += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            UTF += String.fromCharCode(_arr[i]);
        }
    }

    return UTF;
};

// Changes XML to JSON
kf.xmlToJson = function(xml) {
    // Create the return object
    let obj = {};

    if (xml.nodeType === 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                if (attribute.nodeName === 'size'
                    || attribute.nodeName === 'define'
                    || attribute.nodeName === 'mandatory') {
                    continue;
                }

                obj[attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3 && xml.nodeName !== '#text') {
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const { nodeName } = item;
            if (nodeName === '#text') continue;

            if (typeof (obj[nodeName]) === 'undefined' || nodeName === '#text') {
                obj[nodeName] = this.xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].length) === 'undefined') {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(this.xmlToJson(item));
            }
        }
    }
    return obj;
};

kf.loadXMLStr = function(xmlString) {
    let xmlDoc = null;
    // 判断浏览器的类型//支持IE浏览器
    // DOMParser判断是否是非ie浏览器
    if (!window.DOMParser && window.ActiveXObject) {
        const xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
        for (let i = 0; i < xmlDomVersions.length; i++) {
            try {
                xmlDoc = new window.ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString); // loadXML方法载入xml字符串
                break;
            } catch (e) {
                console.error(e);
            }
        }
    } else if (window.DOMParser && document.implementation && document.implementation.createDocument) { // 支持Mozilla浏览器
        try {
            /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
             * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
             * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
             * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
             */
            const domParser = new window.DOMParser();
            xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
        } catch (e) {
            console.error(e);
        }
    } else {
        return null;
    }

    return xmlDoc;
};

kf.touchInNode = function(node, touch) {
    const pos = node.convertTouchToNodeSpace(touch);
    const temp = node.getContentSize();
    const myRect = new cc.Rect(0, 0, temp.width, temp.height);
    return cc.rectContainsPoint(myRect, pos);
};

// 获取节点在根节点局部坐标系的坐标
kf.getLocationInRoot = function(node) {
    let locationX = node.x;
    let locationY = node.y;
    let curParent = node.parent;
    while (curParent && curParent.parent && !(curParent.parent instanceof cc.Scene)) {
        locationX += curParent.x;
        locationY += curParent.y;
        const { parent } = curParent;
        curParent = parent;
    }
    return cc.p(locationX, locationY);
};

window.string = {};
window.string.format = function(...params) {
    const [str] = params;
    const args = params;
    let argIndex = 1;
    return str.replace(
        /(%[ds])/g,
        (/* m, i */) => args[argIndex++],
    );
};
