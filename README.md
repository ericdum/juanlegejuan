# 卷了个卷微信小游戏

这是我第一次开发一个完整的游戏，作为练习并完成上线。现在这个游戏已经停止维护，所以我决定将它开源。扫描二维码可以体验。

![gh_cefdaf8ba6d0_258](https://user-images.githubusercontent.com/690825/215934337-56611a51-3709-4d0c-b7fc-1d4f9a36351f.jpeg)

## 版权声明

本项目**代码**遵循**Apache**协议，您可以修改并闭源商用，但必须保留本项目所涵盖的相关代码的署名信息。

本项目**图片/声音等资源**大部分来源于**杭州文摇没文化有限公司**（小部分来源于网络），禁止商用，如有需要可以联系该公司负责人获取授权。

## 项目简介
本项目典型（自然用户）留存数据如下：

![20230201112936](https://user-images.githubusercontent.com/690825/215938360-408304b4-c107-434a-918a-a4b406ce7b93.jpg)

## Quick Start 

等我有时间了继续补充，如果您迫切想要教程或其他支持，Pls let me know，这可能会加快整个进程。

## Contributes

感谢 @zhang123-bit 参与的部分开发

如果您有兴趣帮助项目继续研发，可以关注：

* 启动页
* 关卡配置协议及配置工具
* 游戏道具和难度配置
* 关卡选择菜单等

如果您需要进一步的贡献指引，Pls let me know。

## 部分截图

![IMG_7457](https://user-images.githubusercontent.com/690825/215936910-79c25087-a1f0-4b80-858b-3b712d1e9a27.PNG)
![IMG_7458](https://user-images.githubusercontent.com/690825/215936914-1b458452-49ec-4eff-842a-6c3adb05cd9e.PNG)

## Quick Start
本游戏通过 Cocos Creator 开发，然后再“构建”成符合微信小程序规范的格式，并通过“微信开发工具”进行最终在手机上的预览、发布、上线。

1. 下载微信开发工具 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html 
2. 下载代码 `git clone git@github.com:ericdum/juanlegejuan.git`
3. 打开微信开发工具，在左边菜单中选择小游戏，然后在右上角点击导入。
4. 在创建小游戏页面点击使用测试号，或者自行[注册正式账号](https://mp.weixin.qq.com/wxopen/waregister?action=step1)
5. 记下这个appId，稍后要用。
6. 下载 Cocos Dashboard https://www.cocos.com/en/creator-download
7. 登录后点击 Add 选择根目录
8. 随后列表中选择juanlegejuna后进入项目。
9. 在“场景编辑器”中首先将视图切换为2D模式。
10. 左下角“资源管理器”中的game、home是两个最主要的场景，双击这两个场景可以检查具体的页面布局。
11. 点击右上角“构建发布”，在弹出菜单中选择“发布平台”到“微信小游戏”
12. 初始场景选择为 home
13. 取消勾选 first 场景
14. 勾选MD5缓存、Source Maps、替换插屏、初始场景分包、分离引擎
15. 然后在 appId 中填写前面在小游戏页面创建的 appID
16. 点击构建
17. 切换到“微信开发工具”，选择 build/wechatgame 目录重新导入项目
18. 即可运行
19. FYI：如果卡在首页，注意错误提示，可能需要导入 Cocos 的基础库，注意控制台报错的提示。
![微信截图_20230223200519](https://user-images.githubusercontent.com/690825/220901553-2827ef26-70d6-44c1-8003-af9eb0dc1514.png)
20. FYI：目前后端代码使用了直接请求微信云服务，这个部分代码尚未开源需要自行替换实现。

