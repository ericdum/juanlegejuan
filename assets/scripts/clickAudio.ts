import { _decorator, Component, AudioSource, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('clickAudio')
export class clickAudio extends Component {

    @property(AudioSource)
    public source:AudioSource = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            this.source.play();
        })
    }
}

