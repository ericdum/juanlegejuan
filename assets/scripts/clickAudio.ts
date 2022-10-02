import {_decorator, Component, AudioSource, Node, AudioClip,
    resources,
    assetManager, find, sys} from 'cc';
import {MySwitch} from "db://assets/scripts/MySwitch";
const { ccclass, property } = _decorator;

const URL_BEEP = "https://mujiang-1253455114.cos.ap-shanghai.myqcloud.com/juan/media/beep.mp3";

let enabled = false;
let vibrateEnabled = false;

@ccclass('clickAudio')
export class clickAudio extends Component {
    // @property(AudioSource)
    public source: AudioSource = new AudioSource("beep");

    static isEnabled() {
        return enabled;
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    enable(): boolean {
        enabled = !enabled;
        sys.localStorage.setItem("effect_close", enabled ? '0' : '1');
        let sw:Node = find("Setting/background/Effect Switch");
        sw.getComponent(MySwitch).setSpriteFrame(enabled);

        return enabled;
    }

    vibrateEnable(): boolean {
        vibrateEnabled = !vibrateEnabled;
        sys.localStorage.setItem("vibrate_close", vibrateEnabled ? '0' : '1');
        let sw:Node = find("Setting/background/Vibrate Switch");
        sw.getComponent(MySwitch).setSpriteFrame(vibrateEnabled);

        return vibrateEnabled;
    }

    onLoad() {
        enabled = sys.localStorage.getItem("effect_close") != '1';
        vibrateEnabled = sys.localStorage.getItem("vibrate_close") != '1';

        let sw:Node = find("Setting/background/Effect Switch");
        sw.getComponent(MySwitch).setSpriteFrame(enabled);
        let swv:Node = find("Setting/background/Vibrate Switch");
        swv.getComponent(MySwitch).setSpriteFrame(vibrateEnabled);

        // assetManager.loadRemote(URL_BEEP, (err, audioClip: AudioClip) => {
        //     this.source.clip = audioClip;
        // });
        resources.load('audio/button', AudioClip, (err, audio)=>{
            this.source.clip = audio;
            this.source.loop = false;
        })
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            if (enabled) {
                // this.source.playOneShot(this.source.clip);
                this.source.play();
            }

            if (vibrateEnabled) {
                if (typeof wx != "undefined") wx.vibrateShort({
                    type: 'medium'
                });
            }
        })
    }
}

