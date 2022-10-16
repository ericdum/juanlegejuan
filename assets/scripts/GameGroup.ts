import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import WXAPI from './WXAPI';
@ccclass('GameGroup')
export class GameGroup extends Component {
    entreButton: any = {}
    start() {
        this.entreButton = WXAPI.EntreGameCroup(this.node)
    }

    update(deltaTime: number) {

    }
    onDestory() {
        this.entreButton?.destroy()

    }
}

