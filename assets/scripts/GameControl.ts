import { _decorator, Component, director,
    find, Node, Animation} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameControl')
export class GameControl extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    onLoad() {
        console.log('game control loaded')
        if (director.getScene().name == "game") {
            // 找不到节点
            const ly:Node = find('Canvas/TransitionMaskLayout');
            const trans = ly.getComponent(Animation);
            console.log('fadeOut')
            trans.play("fadeOut");
        }
    }

    startGame() {
        const ly:Node = find('Canvas/TransitionMaskLayout');
        const trans = ly.getComponent(Animation);

        this.schedule(()=>{
            director.loadScene("game");
        }, 0.3)
        console.log('start');
        trans.play();
    }
}


