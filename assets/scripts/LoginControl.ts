import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import WXSdk from "db://assets/scripts/WXSdk";
let sdk = new WXSdk()
@ccclass('LoginControl')
export class LoginControl extends Component {
    start() {
        sdk.login()

    }

    update(deltaTime: number) {

    }
}

