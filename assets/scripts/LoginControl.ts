import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import WXAPI from "db://assets/scripts/WXAPI";

// 掛載到 button 上，不掛載到 scene
@ccclass('LoginControl')
export class LoginControl extends Component {
    start() {
        WXAPI.getUserInfoOverButton(this.node)
    }

    update(deltaTime: number) {

    }
}

