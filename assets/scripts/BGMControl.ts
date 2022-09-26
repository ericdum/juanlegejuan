import {_decorator, Component, Node,
    AudioSource, AudioClip,
    sys, find, resources,
     } from 'cc';
import {MySwitch} from "db://assets/scripts/MySwitch";
const { ccclass, property } = _decorator;

// const URL_BGM = "https://mujiang-1253455114.cos.ap-shanghai.myqcloud.com/juan/media/bgm.mp3";
@ccclass('BGMControl')
export class BGMControl extends Component {
    // @property(AudioClip)
    // public clip: AudioClip = null;
    // @property(AudioSource)
    public source: AudioSource = new AudioSource("bgm");

    @property
    public  url:string = "";

    @property
    public volume = 1!;

    public enabled: boolean = true!;

    onLoad () {
        // console.log('===================', this.node)
        this.source.loop = true;
        // console.log(this.volume)
        this.source.volume = this.volume;
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
        let sw:Node = find("Setting/background/Music Switch");
        if (this.enabled) {
            sw.getComponent(MySwitch).setSpriteFrame(true);
            resources.load(this.url, AudioClip, (err, audio)=>{
                this.source.clip = audio;
                this.source.play();
            })
        } else {
            this.source.pause();
            sw.getComponent(MySwitch).setSpriteFrame(false);
        }
    }

    protected onDestroy() {
        this.source.pause()
    }

    pause () {
        this.play();
    }

    start() {
    }

    update(deltaTime: number) {
        
    }
}