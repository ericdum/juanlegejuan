import {sys} from "cc";

class WXAPI {
    cloudInited = false
    public constructor() {

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
        let aidMatch = location.href.match(/aid=([^&]+)/)
        let aid = "";
        if (aid) aid = aid[1]
        wx.reportEvent("user", {
            aid
        })
    }
//https://mujiang-1253455114.cos.ap-shanghai.myqcloud.com/juan
    public share(msg, callback=()=>{}) {
        if (typeof wx == 'undefined') return;

        this.call({
            path: "/share",
            data: {from: msg}
        }).then((data)=>{
            // console.log(data);
            wx.shareAppMessage(data);
            wx.reportEvent("user_share", {
                "share_message": data.title
            })
            callback();
        })
        // 从数据库获取.
    }

    public video() {
        let ad = wx.createRewardedVideoAd();
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
                    env: "prod-8g71dxke43f8814e"
                },
                header: {
                    'X-WX-SERVICE': 'koa-t760', // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
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
}

export default new WXAPI();