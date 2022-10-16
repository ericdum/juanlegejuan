import { _decorator, Component, Node, Prefab, instantiate, find, Label } from 'cc';
const { ccclass, property } = _decorator;
import WXAPI from "db://assets/scripts/WXAPI";
@ccclass('RankListDataControl')
export class RankListDataControl extends Component {
    //定义四个预设体
    //第一名预设体
    @property({ type: Prefab })
    private firstman: Prefab = null;
    //第二名预设体
    @property({ type: Prefab })
    private secondman: Prefab = null;
    //第三名预设体
    @property({ type: Prefab })
    private thirdman: Prefab = null;
    //其他明次预设体
    @property({ type: Prefab })
    private Otherman: Prefab = null;
    async start() {
        let res = await this.getRankData()
        let parent = find("RankListContainer/RankListContainer/ScrollView/view/content")
        let dataArr = []

        for (let i = 0; i < res.length; i++) {
            dataArr.push({ nickname: res[i].name, minutes: Math.trunc(res[i].time / 60), seconds: res[i].time % 60 })
        }
        // for (let i = 0; i < 30; i++) {
        //     dataArr.push({ nickname: "开岸", minutes: "12", seconds: "45" })
        // }

        for (let i = 0; i < dataArr.length; i++) {
            let man = null
            man = instantiate(this.Otherman)
            console.log(man, i, dataArr[i])
            this.setOtherManLebal(man, i, dataArr[i])
            parent.addChild(man)
        }
    }

    update(deltaTime: number) {

    }
    setOtherManLebal(node, index, data) {
        let num = node.getChildByName('num')
        //设置序号
        if (num) {
            let numLabel = num.getComponents(Label)[0]
            numLabel.string = (index + 1)
        }
        //设置nickname
        let nickname = find('right/nickname', node)
        let nicknameLabel = nickname.getComponents(Label)[0]
        nicknameLabel.string = data.nickname || ''
        //设置时和分
        let minLabel = find('right/time/minutes', node).getComponents(Label)[0]
        minLabel.string = data.minutes

        let secLabel = find('right/time/seconds', node).getComponents(Label)[0]
        secLabel.string = data.seconds
    }
    //查询排行榜数据
    async getRankData() {
        let rankRes = await WXAPI.call({ path: "/leaderboard" })
        console.log(rankRes)
        return rankRes
    }
}

