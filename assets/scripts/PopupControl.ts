import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupControl')
export class PopupControl extends Component {

    open() {
        console.log(this.node)
        this.node.active = true;
    }
    close() {
        this.node.active = false;
    }
}

