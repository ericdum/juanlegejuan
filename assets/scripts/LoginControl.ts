import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import WXAPI from "db://assets/scripts/WXAPI";
@ccclass('LoginControl')
export class LoginControl extends Component {
    start() {
        WXAPI.userlogin()

    }

    update(deltaTime: number) {

    }
}

