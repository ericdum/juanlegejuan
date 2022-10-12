import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RankListPopControl')
export class RankListPopControl extends Component {
    open() {
        this.node.active = true
        console.log("打开", this.node)
    }
    close() {
        this.node.active = false
        console.log("关闭")
    }
}

