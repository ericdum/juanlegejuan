import { _decorator, Component, Button, Sprite, SpriteFrame, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MySwitch')
export class MySwitch extends Button {

    @property(SpriteFrame)
    public imgOn: SpriteFrame = null;

    @property(SpriteFrame)
    public imgOff: SpriteFrame = null;

    setSpriteFrame(state: boolean) {
        if (state) {
            this.getComponent(Sprite).spriteFrame = this.imgOn;
        } else {
            this.getComponent(Sprite).spriteFrame = this.imgOff;
        }
    }
}

