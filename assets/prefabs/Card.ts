import { _decorator, Component, Sprite, SpriteFrame, Node } from 'cc'
import {CardControl} from "db://assets/scripts/CardControl";
const { ccclass, property } = _decorator;


@ccclass('Card')
export class CardTemplate extends Component {
    @property
    public id = 0;

    @property
    public type = "";

    @property(Sprite)
    public icon: Sprite = null;

    public queued = false;

    init(data, onTouchStart) {
        this.id = data.id;
        this.icon.spriteFrame = data.iconSF;
        this.type = data.type;

        this.node.on(Node.EventType.TOUCH_START, (event) => {
            onTouchStart(this, event)
        });

        return this;
    }

}

