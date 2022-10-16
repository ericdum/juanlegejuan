import { sys, find, UITransform, Vec3, Node } from "cc";
declare var wx: any;

class WXAPI {
    cloudInited = false
    shareOption: { title?, imageUrl?} = {}
    env = "prod-8g71dxke43f8814e"
    service = 'koa-t760'
    // env = "pre-3g8yq30806c4fdf0"
    // service = "koa-r6zt"

    public constructor() {
        if (typeof wx == 'undefined') return;
        let envdata = this.getEnv()

        // develop, trial, release
        if (envdata?.miniProgram?.envVersion === 'develop') {
            //当前为测试环境，需要去修改env
            this.env = 'pre-3g8yq30806c4fdf0'
            this.service = 'koa-r6zt'
        }
        console.log("当前环境为：", envdata?.miniProgram?.envVersion, "环境id为：", this.env)
        this.init()
        this.refresh();
        wx.onShareTimeline(() => {
            this.refresh();
            console.log(this.shareOption)
            return this.shareOption
        })
        wx.onShareAppMessage(() => {
            this.refresh();
            console.log(this.shareOption)
            return this.shareOption
        })
    }

    private refresh() {
        this.call({
            path: "/share"
        }).then((data) => {
            this.shareOption = data;
        })
    }

    private async init() {
        if (typeof wx == 'undefined') return;
        if (!this.cloudInited) {
            // this.cloud = new wx.cloud.Cloud({
            //     resourceAppid: 'wxfdf9176bb84b6c51', // 微信云托管环境所属账号，服务商appid、公众号或小程序appid
            //     resourceEnv: '8g71dxke43f8814e', // 微信云托管的环境ID
            // })
            // this.cloud = wx.cloud
            await wx.cloud.init() // init过程是异步的，需要等待 init 完成才可以发起调用
            this.cloudInited = true;
        }
        // if (director.getScene().name == "home") {
        //     // 找不到节点
        //     // const ly:Node = find('Canvas/TransitionMaskLayout');
        //     // const trans = ly.getComponent(Animation);
        //     // console.log('fadeOut')
        //     // trans.play("fadeOut");
        //
        //     const updateManager = wx.getUpdateManager()
        //
        //     updateManager.onCheckForUpdate(function (res) {
        //         // 请求完新版本信息的回调
        //         console.log(res.hasUpdate)
        //     })
        //
        //     updateManager.onUpdateReady(function () {
        //         wx.showModal({
        //             title: '更新提示',
        //             content: '新版本已经准备好，是否重启应用？',
        //             success(res) {
        //                 if (res.confirm) {
        //                     // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        //                     updateManager.applyUpdate()
        //                 }
        //             }
        //         })
        //     })
        //
        //     updateManager.onUpdateFailed(function () {
        //         // 新版本下载失败
        //     })
        // }
    }

    public login() {
        if (typeof wx == 'undefined') return;
        this.call({
            method: 'POST',
            path: "/login"
        });
        console.log("query", wx.getLaunchOptionsSync().query)
        wx.reportEvent("user", {
            aid: wx.getLaunchOptionsSync().query.aid
        })

    }
    //https://mujiang-1253455114.cos.ap-shanghai.myqcloud.com/juan
    public share(msg, callback = () => { }) {
        if (typeof wx == 'undefined') return callback();

        wx.shareAppMessage(this.shareOption);
        wx.reportEvent("user_share", {
            "share_message": this.shareOption.title
        })
        setTimeout(callback, 0.5)
        this.refresh()
    }

    public alert(message) {
        if (typeof wx == 'undefined') return alert(message);

        wx.showToast({
            title: message,
            icon: 'none',
            duration: 1500
        })
    }

    public loading() {
        if (typeof wx == 'undefined') return;
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 1500
        })
    }

    public modal(title, content, resolve, reject) {
        if (typeof wx == 'undefined') return alert(title + "\r\n" + content);
        wx.showModal({
            title: title,
            content: content,
            success: function (res) {
                if (res.confirm) {
                    resolve()
                } else {
                    reject()
                }
            }
        })
    }

    public video(msg, resolve, reject = () => { }) {
        if (typeof wx == 'undefined') return resolve();
        wx.showLoading({
            title: '加载中',
        })
        let videoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-326846acd405d932'
        })
        videoAd.offError();
        videoAd.offClose();

        videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                resolve()
            }
            else {
                this.alert("视频播放完成才能获得道具")
            }
        })

        videoAd.onError(err => {
            console.error(err)
            resolve()
        })

        // 用户触发广告后，显示激励视频广告
        videoAd.show().catch(() => {
            // 失败重试
            videoAd.load()
                .then(() => {
                    wx.hideLoading()
                    videoAd.show()
                })
                .catch(err => {
                    wx.hideLoading()
                    reject();
                    console.log('激励视频 广告显示失败')
                })
        }).then(() => {
            wx.hideLoading()
        })
    }

    public async call(obj, number = 0) {
        if (typeof wx == 'undefined') return;
        await this.init();
        const that = this;
        try {
            const result = await wx.cloud.callContainer({
                path: obj.path, // 填入业务自定义路径和参数，根目录，就是 /
                method: obj.method || 'GET', // 按照自己的业务开发，选择对应的方法
                data: obj.data,
                // dataType:'text', // 如果返回的不是 json 格式，需要添加此项
                config: {
                    env: this.env
                },
                header: {
                    'X-WX-SERVICE': this.service, // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
                    // 其他 header 参数
                }
                // 其余参数同 wx.request
            })
            // console.log(`微信云托管调用结果${result.errMsg} | callid:${result.callID}`)
            return result.data // 业务数据在 data 中
        } catch (e) {
            console.error("call service error:", e)
            const error = e.toString()
            // 如果错误信息为未初始化，则等待300ms再次尝试，因为 init 过程是异步的
            if (error.indexOf("Cloud API isn't enabled") != -1 && number < 3) {
                return new Promise((resolve) => {
                    setTimeout(function () {
                        resolve(that.call(obj, number + 1))
                    }, 300)
                })
            } else {
                throw new Error(`调用失败${error}`)
            }
        }
    }

    public event(id, data) {
        if (typeof wx == "undefined") return;
        wx.reportEvent(id, data)
    }
    public getUserInfoOverButton(node): void {
        const sdk = this
        if (typeof wx == 'undefined') return;
        let sysInfo = wx.getSystemInfoSync();
        wx.getSetting({
            success(res) {
                console.log("res.authSetting:" + res.authSetting);
                if (res.authSetting["scope.userInfo"]) {
                    console.log("用户已授权");
                    wx.getUserInfo({
                        success(res) {
                            console.log(JSON.stringify(res));
                            sdk.updateUserInfo(res.userInfo)
                        }
                    });
                }
                else {
                    let uit: UITransform = node.getComponent(UITransform)
                    let pos: Vec3 = node.getWorldPosition()
                    let canvas: UITransform = find('Canvas').getComponent(UITransform)
                    let dx = sysInfo.screenWidth / canvas.width;
                    let dy = sysInfo.screenHeight / canvas.height;

                    console.log("用户未授权");
                    //用户未授权的话，全屏覆盖一个按钮，用户点击任意地方都会触发onTap()，弹出授权界面
                    let button = wx.createUserInfoButton({
                        type: 'text',
                        text: '',//不显示文字
                        style: {
                            left: (pos.x - uit.width / 2) * dx,
                            top: (canvas.height - pos.y - uit.height / 2) * dy,
                            width: uit.width * dx,
                            height: uit.height * dy,
                            // lineHeight: 40,
                            // backgroundColor: '#111111',//设置按钮透明
                            backgroundColor: '#00000000',//设置按钮透明
                            color: '#ffffff',
                            textAlign: 'center',
                            fontSize: 16,
                            // borderRadius: 4
                        }
                    });
                    button.onTap(
                        (res) => {
                            if (res.userInfo) {
                                console.log("用户授权：" + JSON.stringify(res));
                                sdk.updateUserInfo(res.userInfo)
                                //TODO：others
                                button.destroy();//此时删除按钮

                            }
                            else//说明用户点击 不允许授权的按钮
                            {
                                console.log("用户拒绝授权");
                                button.destroy();
                            }
                            node.emit(Node.EventType.TOUCH_START)
                            node.emit(Node.EventType.TOUCH_END)
                        }
                    );
                }
            }
        });
    }
    public EntreGameCroup(node) {
        console.log("entre")
        let sysInfo = wx.getSystemInfoSync();
        let uit: UITransform = node.getComponent(UITransform)
        let pos: Vec3 = node.getWorldPosition()
        let canvas: UITransform = find('Canvas').getComponent(UITransform)
        let dx = sysInfo.screenWidth / canvas.width;
        let dy = sysInfo.screenHeight / canvas.height;
        console.log(sysInfo.screenHeight, sysInfo.screenWidth)
        console.log("dx:", dx, "dy:", dy)
        let button = wx.createGameClubButton({
            type: "text",
            text: "",
            style: {
                left: (pos.x - uit.width / 2) * dx,
                top: (canvas.height - pos.y - uit.height / 2) * dy,
                width: uit.width * dx,
                height: uit.height * dy,
                backgroundColor: '#00000000',//设置按钮透明
                color: '#00000000',
            }
        })
        console.log("button", button)
        button.onTap(
            (res) => {
                console.log('进入游戏圈')
                // button.destroy();//此时删除按钮
            }
        );
        return button
    }

    public updateUserInfo(data) {
        //存储头像地址
        sys.localStorage.setItem("nickName", data?.nickName);
        //存储昵称
        sys.localStorage.setItem("avatarUrl", data?.avatarUrl);
        this.call({
            path: "/user/info",
            method: 'POST',
            data: {
                nickname: data.nickName,
                avatar: data.avatarUrl
            }
        })
    }
    public getEnv() {
        return wx.getAccountInfoSync()
    }
}

export default new WXAPI();