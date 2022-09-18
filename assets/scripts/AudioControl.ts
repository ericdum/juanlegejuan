import {_decorator, Component, Node,
    AudioSource, AudioClip,
    sys, find,
    assetManager } from 'cc';
import {MySwitch} from "db://assets/scripts/MySwitch";
const { ccclass, property } = _decorator;

// const CloudResource = "https://mujiang-1253455114.cos.ap-shanghai.myqcloud.com/juan";
// const gaming = "/media/gaming.mp3";
// const beep = "/media/beep.mp3";
// const bgm = "/media/bgm.mp3";
//@executeInEditMode(true)
@ccclass('AudioControl')
export class AudioControl extends Component {
    @property(AudioSource)
    public source: AudioSource = null;

    @property
    public  url:string = "";

    public enabled: boolean = true!;

    onLoad () {
        this.enabled = sys.localStorage.getItem("music_close") != '1';
        this.play();
    }

    enable(): boolean {
        this.enabled = !this.enabled;
        sys.localStorage.setItem("music_close", this.enabled ? '0' : '1');
        if (this.enabled) this.play();
        else this.pause();

        return this.enabled;
    }

    play () {
        let sw:Node = find("Canvas/Top-Right/Music Switch");
        if (this.enabled) {
            sw.getComponent(MySwitch).setSpriteFrame(true);
            if (this.url) {
                assetManager.loadRemote(this.url, (err, audioClip: AudioClip) => {
                    this.source.clip = audioClip;
                    this.source.play();
                });
            }
        } else {
            this.source.pause();
            sw.getComponent(MySwitch).setSpriteFrame(false);
        }
    }

    pause () {
        this.play();
    }

    start() {
    }

    update(deltaTime: number) {
        
    }
}