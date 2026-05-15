
kf.addModule('basic.cloud', () => {
    const cloud = {};

    var cloudFunUrl = "https://1923914575990624.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/wechatgame";
    cloud.initAccount = function(gameName, account, cb) {
        this.gameName = gameName;
        this.account = account;
        this.fileUrl = `wechatgame/${gameName}/${this.account}`;
        this.getCloudInfo(cb);
    };

    cloud.getCloudInfo = function(cb, myFileUrl) {
        if (!this.account) {
            return;
        }

        var fileUrl = this.fileUrl;
        if (myFileUrl) {
            fileUrl = myFileUrl;
        }

        cc.loader.load(cloudFunUrl + "/getCityData/?" + "fileUrl=" + fileUrl, function(err, data) {
            console.log("getCityDataErr= ", err);
            if (!err && data) {
                console.log(data);
                var dataObject = JSON.parse(data);
                var url = dataObject.url;
                console.log(dataObject.url);
                if (window.wx) {
                    wx.request({
                        url: url, //仅为示例，并非真实的接口地址
                        // data: {
                        //     x: '' ,
                        //     y: ''
                        // },
                        header: {
                            'content-type': ' '
                        },
                        success (res) {
                            var result = res.data;
                            try {
                                var str = null;
                                // if(result.indexOf('bestScore') > -1 || result.indexOf('invitation') > -1) {
                                //     str = result;
                                // } else {
                                //     str = LZString.decompressFromUTF16(result);
                                //
                                //     // 重置游戏  str为长度为3的""
                                //     if ((!str || str.length <= 3) && result.length > 0) {
                                //         str = JSON.stringify({gameData:{}});
                                //     }
                                // }
                                str = result;
                                str = decodeURIComponent(str);
                                // var str = result;
                                console.log(`result=${result}`);
                                console.log(`str=${str}`);
                                // console.log(`${typeof str}`);
                                if(result.indexOf('NoSuchKey') > -1) {
                                    result = {gameData:{}};
                                } else if (str === 'null' || str.trim() === "") {
                                    result = {};
                                } else {
                                    try {
                                        result = JSON.parse(str)
                                    } catch (e) {
                                        console.error(e);
                                        result = {};
                                    }
                                }
                            } catch (e) {
                                console.error(e);
                                if (cb) cb(e, result);
                                return;
                            }

                            if (cb) cb(null, result);
                        },
                        fail(res) {
                            const clientEvent = kf.require('basic.clientEvent');
                            clientEvent.dispatchEvent('hidePanel', 'netLoadingPanel');
                            clientEvent.dispatchEvent('showPanel', 'tipsPanel', '登陆失败');
                            clientEvent.dispatchEvent('showLoginBtn');
                        }
                    })
                } else {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url);
                    // 因为阿里云那边的限制，如果没有这条在微信中会请求失败
                    xhr.setRequestHeader('content-type', ' ');
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                            var result = xhr.responseText;
                            try {
                                var str = null;
                                // if(result.indexOf('bestScore') > -1 || result.indexOf('invitation') > -1) {
                                //     str = result;
                                // } else {
                                //     str = LZString.decompressFromUTF16(result);
                                //     if ((!str || str.length <= 3) && result.length > 0) {
                                //         str = JSON.stringify({gameData:{}});
                                //     }
                                // }
                                str = result;
                                str = decodeURIComponent(str);
                                // var str = result;
                                console.log(`result=${result}`);
                                console.log(`str=${str}`);
                                if(str === "" || str === 'null') {
                                    result = {};
                                } else {
                                    result = JSON.parse(str);
                                }
                            } catch (e) {
                                console.error(e);
                                if (cb) cb(e, result);
                                return;
                            }

                            if (cb) cb(null, result);
                        } else if (xhr.readyState == 4 && (xhr.status === 404)) {
                            if (cb) cb(null, {gameData:{}});
                        }
                    }.bind(this);
                    xhr.send();
                }
            } else {
                console.error(`获取玩家oss url 失败:gameName=${this.gameName}&account=${this.account}`);
                // 获取数据失败时再次尝试获取数据
                cloud.getCloudInfo(cb, myFileUrl);
            }
        }.bind(this));
    };

    cloud.uploadToCloud = function(data, cb, myFileUrl) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }

        data = encodeURIComponent(data);
        // data = LZString.compressToUTF16(data);

        try {
            let fileUrl = this.fileUrl;
            if(myFileUrl) {
                fileUrl = myFileUrl;
            }

            // cc.loader.load(cloudFunUrl + "/saveZSCityData/?" +
            //     "fileUrl=" + fileUrl + "&newData=" + data, function(err, data) {
            //     // "fileUrl=" + fileUrl + "&newData=" + "1", function(err, data) {
            //     if (!err && cb) cb(null);
            // });
            //
            var sendObj = {
                fileUrl: fileUrl,
                newData: data
            };

            var xhr = new XMLHttpRequest();
            xhr.open('POST', "https://1923914575990624.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/wechatgame/updateCityData/");
            // 因为阿里云那边的限制，如果没有这条在微信中会请求失败
            // xhr.setRequestHeader('content-type', ' ');
            xhr.onreadystatechange = function (err, data) {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    if (cb) cb(null, {});
                } else if (xhr.readyState == 4 && (xhr.status === 404)) {
                    if (cb) cb(null, {});
                }
            }.bind(this);
            xhr.send(JSON.stringify(sendObj));

            // client.put(fileUrl, new Blob([data],{ type: 'text/plain' }));

        } catch (e) {
            console.error(e);
            if (cb) cb(e);
        }
    };

    cloud.getInvitationInfo = function(inviter, cb) {
        let fileUrl = `wechatgame/${this.gameName}/${inviter}_invitation`;
        this.getCloudInfo(cb, fileUrl);
    };

    cloud.setInvitationInfo = function(inviter, data, cb) {
        let fileUrl = `wechatgame/${this.gameName}/${inviter}_invitation`;
        this.uploadToCloud(data, cb, fileUrl);
    };
    return cloud;
});
