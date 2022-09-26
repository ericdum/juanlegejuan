import {sys} from "cc";

const BASE_URL = "https://juan.zhuzhe.xyz/services/juan";

// let wx = WechatMiniprogram.Wx;

class WXAPI {
    public constructor() {
    }
    public login() {
        if (typeof wx == 'undefined') return;
        wx.login({
            success (res) {
                if (res.code) {
                    //发起网络请求
                    wx.request({
                        url: BASE_URL + '/login',
                        data: {
                            code: res.code,
                            session_id: sys.localStorage.getItem("session_id")
                        },
                        success(res) {
                            console.log(res.data);
                            let data = res.data || {};
                            if (data.session_id) sys.localStorage.setItem("session_id", data.session_id);
                            if (data.open_id) sys.localStorage.setItem("open_id", data.open_id);
                        },
                        fail (err) {
                            console.log('登录失败！', `[${err.errno}]`, err.errMsg )
                            // TODO: do someting;

                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }, fail (err) {
                console.log('登录失败！', `[${err.errno}]`, err.errMsg)
                // TODO: do someting;
            }
        })
    }

}

export default new WXAPI();