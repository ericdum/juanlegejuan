import {
    _decorator, Component, director,
    find, Node, Animation, resources
} from 'cc';
import WXAPI from "db://assets/scripts/WXAPI";
const { ccclass, property } = _decorator;

@ccclass('GameControl')
export class GameControl extends Component {
    start() {
        if (director.getScene().name == "game") {
            // 找不到节点
            // const ly:Node = find('Canvas/TransitionMaskLayout');
            // const trans = ly.getComponent(Animation);
            // console.log('fadeOut')
            // trans.play("fadeOut");
        }
    }

    update(deltaTime: number) {
    }

    onLoad() {
        WXAPI.login();
        resources.preloadDir('icons')
        resources.preloadDir('home')
        resources.preloadDir('gaming-juan')
        resources.preloadDir('audio')
        // console.log('game control loaded')
    }

    startGame() {
        const ly:Node = find('Canvas/TransitionMaskLayout');
        ly.active = true;
        const trans = ly.getComponent(Animation);

        this.scheduleOnce(()=>{
            director.loadScene("game");
        }, 0.3)
        console.log('start');
        trans.play();
    }

    backToHome() {
        const ly:Node = find('Canvas/TransitionMaskLayout');
        ly.active = true;
        const trans = ly.getComponent(Animation);
        this.scheduleOnce(()=>{
            director.loadScene("home");
        }, 0.3)
        trans.play();
    }
}



