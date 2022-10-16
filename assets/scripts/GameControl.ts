import {
    _decorator, Component, director,
    find, Node, Animation, resources, game, assetManager,
    Sprite, SpriteFrame, ImageAsset, Texture2D, AudioSource, AudioClip
} from 'cc';
import WXAPI from "db://assets/scripts/WXAPI";
import {clickAudio} from "db://assets/scripts/clickAudio";
const { ccclass, property } = _decorator;

let firstLoad = true;

@ccclass('GameControl')
export class GameControl extends Component {
    private audio:AudioSource = new AudioSource();
    time = Date.now()
    start() {
        if (director.getScene().name == "game") {
            // 找不到节点
            // const ly:Node = find('Canvas/TransitionMaskLayout');
            // const trans = ly.getComponent(Animation);
            // console.log('fadeOut')
            // trans.play("fadeOut");
        }
        if (director.getScene().name == "home") {
            assetManager.loadRemote("https://prod-8g71dxke43f8814e-1314041846.tcloudbaseapp.com/uploads/gongzhonghao.png", (err, asset:ImageAsset)=>{
                if (err) return console.error(err)
                let popup = find('gongzhonghao/gongzhonghao');
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = asset;
                spriteFrame.texture = texture
                popup.getComponent(Sprite).spriteFrame = spriteFrame;
            })
        }

        if (firstLoad) {
            firstLoad = false;
            WXAPI.login();

            // resources.preloadDir('icons', console.log)
            // resources.preloadDir('home', console.log)
            // resources.preloadDir('gaming-juan', console.log)
            // resources.preloadDir('audio', console.log)
            director.preloadScene("game", () => {
                resources.preloadDir('icons')
            })
        }
        console.log('start', Date.now() - this.time)
    }

    update(deltaTime: number) {
    }

    onLoad() {
        console.log('onLoad', Date.now() - this.time)
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
        if ( ! clickAudio.isEnabled()) return;
        resources.load("audio/trans", AudioClip, (err, audio)=>{
            this.audio.playOneShot(audio);
        })
        WXAPI.event("user_start_game", {})
    }

    backToHome() {
        const ly:Node = find('Canvas/TransitionMaskLayout');
        ly.active = true;
        const trans = ly.getComponent(Animation);
        this.scheduleOnce(()=>{
            director.loadScene("home");
        }, 0.3)
        trans.play();
        if ( ! clickAudio.isEnabled()) return;
        resources.load("audio/trans", AudioClip, (err, audio)=>{
            this.audio.playOneShot(audio);
        })
    }

}



