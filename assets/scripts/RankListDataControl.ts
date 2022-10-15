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
        let dataArr = []
        for (let i = 0; i < res.length; i++) {
            dataArr.push({ nickname: res[i].name, minutes: Math.trunc(res[i].time / 60), seconds: res[i].time % 60 })
        }
        /*for (let i = 0; i < 30; i++) {
            dataArr.push({ nickname: "开岸", minutes: "12", seconds: "45" })
        }*/
        for (let i = 0; i < dataArr.length; i++) {
            let man = null
            if (i == 0) {
                man = instantiate(this.firstman)
            } else if (i == 1) {
                man = instantiate(this.secondman)
            } else if (i == 2) {
                man = instantiate(this.thirdman)
            } else {
                man = instantiate(this.Otherman)
            }


            let parent = find("RankListContainer/RankListContainer/ScrollView/view/content")
            if (i < 3) {
                man.setPosition(70, -740 - 140 * (i))
                this.setTopThreeMan(man, dataArr[i])
            } else {
                man.setPosition(8, -780 - 140 * (i))
                this.setOtherManLebal(man, i, dataArr[i])
            }
            man.parent = parent
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
        let nickname = node.getChildByName('thirdMan').getChildByName('nickname')
        let nicknameLabel = nickname.getComponents(Label)[0]
        nicknameLabel.string = data.nickname || ''
        //设置时和分
        let timer = node.getChildByName('thirdMan').getChildByName('time')
        let minLabel = timer.getChildByName('minutes').getComponents(Label)[0]
        minLabel.string = data.minutes
        let secLabel = timer.getChildByName('seconds').getComponents(Label)[0]
        secLabel.string = data.seconds
    }
    setTopThreeMan(node, data) {
        //设置nickname
        let nickname = node.getChildByName('nickname')
        let nicknameLabel = nickname.getComponents(Label)[0]
        nicknameLabel.string = data.nickname || ''
        //设置时和分
        let timer = node.getChildByName('time')
        let minLabel = timer.getChildByName('minutes').getComponents(Label)[0]
        minLabel.string = data.minutes
        let secLabel = timer.getChildByName('seconds').getComponents(Label)[0]
        secLabel.string = data.seconds
    }
    //查询排行榜数据
    async getRankData() {
        let rankRes = await WXAPI.call({ path: "/leaderboard" })
        console.log(rankRes)
        return rankRes
    }
}

