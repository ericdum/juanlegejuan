import {sys} from "cc";

class WXAPI {
    cloudInited = false
    shareOption:{title?, imageUrl?} = {}
    env = "prod-8g71dxke43f8814e"
    service = 'koa-t760'
    // env = "pre-3g8yq30806c4fdf0"
    // service = "koa-r6zt"

    public constructor() {
        if (typeof wx == 'undefined') return;
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
        }).then((data)=>{
            this.shareOption = data;
        })
    }
    private async init() {
        if (typeof wx == 'undefined') return;
        if ( ! this.cloudInited ) {
            // this.cloud = new wx.cloud.Cloud({
            //     resourceAppid: 'wxfdf9176bb84b6c51', // 微信云托管环境所属账号，服务商appid、公众号或小程序appid
            //     resourceEnv: '8g71dxke43f8814e', // 微信云托管的环境ID
            // })
            // this.cloud = wx.cloud
            await wx.cloud.init() // init过程是异步的，需要等待 init 完成才可以发起调用
            this.cloudInited = true;
        }
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
    public share(msg, callback=()=>{}) {
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
        if (typeof wx == 'undefined') return ;
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 1500
        })
    }

    public modal(title, content, resolve, reject) {
        if (typeof wx == 'undefined') return alert(title+"\r\n"+content);
        wx.showModal({
            title: title,
            content: content,
            success:function(res){
                if(res.confirm){
                    resolve()
                }else{
                    reject()
                }
            }
        })
    }

    public video(msg, resolve) {
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
        }).then(()=>{
            wx.hideLoading()
        })
    }

    public async call (obj: object, number=0)  {
        if (typeof wx == 'undefined') return;
        await this.init();
        const that = this;
        try{
            const result = await wx.cloud.callContainer({
                path: obj.path, // 填入业务自定义路径和参数，根目录，就是 /
                method: obj.method||'GET', // 按照自己的业务开发，选择对应的方法
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
        } catch(e){
            console.error("call service error:", e)
            const error = e.toString()
            // 如果错误信息为未初始化，则等待300ms再次尝试，因为 init 过程是异步的
            if(error.indexOf("Cloud API isn't enabled")!=-1 && number<3){
                return new Promise((resolve)=>{
                    setTimeout(function(){
                        resolve(that.call(obj,number+1))
                    },300)
                })
            } else {
                throw new Error(`调用失败${error}`)
            }
        }
    }

    public event(id, data){
        if (typeof wx == "undefined") return ;
        wx.reportEvent(id, data)
    }

}

export default new WXAPI();