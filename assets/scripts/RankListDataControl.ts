import { _decorator, Component, Prefab, Sprite, SpriteFrame, instantiate, find, Label } from 'cc';
const { ccclass, property } = _decorator;
import WXAPI from "db://assets/scripts/WXAPI";

@ccclass('RankListDataControl')
export class RankListDataControl extends Component {
    @property({ type: SpriteFrame })
    private backgrounds: SpriteFrame[] = [];
    @property({ type: SpriteFrame })
    private defaultBackground: SpriteFrame = null;
    @property({ type: Prefab})
    private row: Prefab = null;

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
            man = instantiate(this.row)
            console.log(man, i, dataArr[i])
            this.setOtherManLebal(man, i, dataArr[i])
            parent.addChild(man)
        }
    }

    update(deltaTime: number) {

    }
    setOtherManLebal(node, index, data) {
        let num = node.getChildByName('num')

        if (this.backgrounds[index]) {
            node.getComponent(Sprite).spriteFrame = this.backgrounds[index]
        } else {
            node.getComponent(Sprite).spriteFrame = this.defaultBackground
            let numLabel = num.getComponent(Label)
            numLabel.string = (index + 1)
        }

        //设置nickname
        let nickname = find('right/nickname', node)
        let nicknameLabel = nickname.getComponent(Label)
        nicknameLabel.string = data.nickname || ''
        //设置时和分
        let minLabel = find('right/time/minutes', node).getComponent(Label)
        minLabel.string = data.minutes

        let secLabel = find('right/time/seconds', node).getComponent(Label)
        secLabel.string = data.seconds
    }
    //查询排行榜数据
    async getRankData() {
        let rankRes = await WXAPI.call({ path: "/leaderboard" })
        console.log(rankRes)
        return rankRes
    }
}

