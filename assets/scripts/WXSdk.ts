import {
    sys
} from 'cc';
export default class WXSdk {
    public login(): void {
        const sdk = this
        if (typeof wx == 'undefined') return;
        let sysInfo = wx.getSystemInfoSync();
        let width = sysInfo.screenWidth;
        let height = sysInfo.screenHeight;
        wx.getSetting({
            success(res) {
                console.log("res.authSetting:" + res.authSetting);
                if (res.authSetting["scope.userInfo"]) {
                    console.log("用户已授权");
                    wx.getUserInfo({
                        success(res) {
                            console.log(JSON.stringify(res));
                            sdk.meoData(res.userInfo)
                        }
                    });
                }
                else {
                    console.log("用户未授权");
                    //用户未授权的话，全屏覆盖一个按钮，用户点击任意地方都会触发onTap()，弹出授权界面
                    let button = wx.createUserInfoButton({
                        type: 'text',
                        text: '',//不显示文字
                        style: {
                            left: 0,
                            top: 0,
                            width: width,
                            height: height,
                            // lineHeight: 40,
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
                                sdk.meoData(res.userInfo)
                                //TODO：others
                                button.destroy();//此时删除按钮

                            }
                            else//说明用户点击 不允许授权的按钮
                            {
                                console.log("用户拒绝授权");
                                button.destroy();
                            }
                        }
                    );
                }
            }
        });
    }
    public meoData(data) {
        //存储头像地址
        sys.localStorage.setItem("nickName", data?.nickName);
        //存储昵称
        sys.localStorage.setItem("avatarUrl", data?.avatarUrl);
    }
}