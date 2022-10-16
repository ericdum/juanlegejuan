import {
    _decorator, Component, Node, find, SpriteFrame,
    resources, tween, Vec3, math, instantiate,
    UITransform, Button, director, assetManager,
    AudioClip, AudioSource, Sprite, Prefab,
    Rect, ImageAsset, Texture2D
} from 'cc';
import { CardTemplate } from "db://assets/prefabs/Card";
import { PopupControl } from "db://assets/scripts/PopupControl";
import { clickAudio } from "db://assets/scripts/clickAudio";
const { ccclass, property } = _decorator;
import WXAPI from "db://assets/scripts/WXAPI";

const TYPES = [
    'guo', 'jiuhuche', 'gouqi', 'gupiao', 'tutou', 'naicha', 'lvmaozi', 'waimai', 'jiu', 'maoyu', 'hei', 'bing', 'ppt',
    'dingding', 'gongpai', 'zixingche',
];

let currentActive: CardControl = null;
const MAX_QUEUE = 8;

@ccclass('CardControl')
export class CardControl extends Component {
    @property
    public level = 3;

    @property({ type: Prefab })
    private cardPrefab: Prefab = null;

    protected Cards: CardTemplate[] = [];
    protected MergedCards: CardTemplate[] = [];
    protected MergingCards: CardTemplate[] = [];
    protected WaitingCards: CardTemplate[] = [];
    protected Container: Node;

    private audio: AudioSource = new AudioSource();
    protected lastAct: CardTemplate;

    protected been_undo = false;
    protected been_extra = false;
    protected been_shuffle = false;
    protected been_revive = false;

    protected images = {}
    protected stageNum = 2;
    protected currentStage = 1;
    protected stages = {}
    protected gid = "";
    private startTime = 0;

    protected onLoad() {
        console.log("PlayGround onLoad")
        this.Container = find('Canvas/Bottom/Layout/Queue/container/view/content');
        this.clean();

        WXAPI.call({ path: "/config" }).then((config) => {
            this.stageNum = config.stageNum;
            this.stages = config.stages
            this.loadGame(this.stages[0])
        })
    }

    private clean() {
        this.node.removeAllChildren();
        this.Cards.splice(0);
        this.MergedCards.splice(0);
        this.MergingCards.splice(0);
        this.WaitingCards.splice(0);
    }

    protected loadGame(game) {
        let { types, level, url, layers, width, height } = game;
        let total = 0;
        let images = {};
        this.gid = game._id;
        this.startTime = Date.now();

        layers.forEach((layer) => {
            layer.data.forEach((row) => {
                row.split('').forEach((p) => {
                    if (p == 1) total++;
                })
            })
        })

        // 如果总数不是 3 的倍数会导致永远无法通关，去掉最底层的方块
        let skip = total % 3;
        total -= skip;
        console.log("total", total, "skip", skip)

        if (level > total / 3) level = total / 3;
        types = shuffle(types).slice(0, level)

        const CONFIG = [];
        for (let i = 0; i < total / 3; i++) {
            let type = types[i % level];
            CONFIG.push({ type: type });
            CONFIG.push({ type: type });
            CONFIG.push({ type: type });
        }
        shuffle(CONFIG)

        let size = [180, 200];
        let ui = this.node.getComponent(UITransform);
        let scaleRate = Math.min(ui.width / (width * size[0]), ui.height / (height * size[0]))
        let scale = new Vec3(1, 1, 1)
        if (scaleRate < 1) {
            scale = new Vec3(scaleRate, scaleRate, 1)
            size = [size[0] * scaleRate, size[1] * scaleRate];
        }
        let left = this.node.worldPosition.x - (width - 1) * size[0] / 2;
        let top = this.node.worldPosition.y + (height - 1) * size[1] / 2;

        for (let a = 0; a < layers.length; a++) {
            let layer = layers[a].data;
            let offset = layers[a].offset;

            let _left = left, _top = top, _height = height, _width = width;
            _left = left + offset[0] * size[0];
            _top = top - offset[1] * size[1];
            _height = height;
            _width = width;

            for (let i = 0; i < _height; i++) {
                if (!layer[i]) continue;
                for (let j = 0; j < _width; j++) {
                    if (skip) {
                        skip--;
                        continue;
                    }
                    if (layer[i][j] == '1') {
                        let node = instantiate(this.cardPrefab);
                        let id = this.Cards.length;
                        let type = CONFIG[id].type;
                        let pos = new Vec3(j * size[0] + _left, _top - i * size[1]);
                        let rect = new Rect(pos.x, pos.y, size[0], size[1]);

                        this.loadImage(url, CONFIG[id].type).then((image: SpriteFrame) => {
                            console.log(url)
                            card.setIcon(image);
                        })

                        this.node.addChild(node);
                        node.setWorldPosition(new Vec3(this.node.worldPosition.x, this.node.worldPosition.y * 2 + 200, 1))
                        let card: CardTemplate = node.getComponent(CardTemplate);
                        card.init({ id, type, rect, scale }, this.move.bind(this))
                        this.detectDepends(card);


                        this.scheduleOnce(() => {
                            card.fly(pos)
                        }, 0.3 + Math.random() * 0.7)

                        this.Cards.push(card)
                    }
                }
            }
        }
    }

    protected loadImage(url: string, type: string) {
        if (!this.images[type]) {
            this.images[type] = new Promise((resolve, reject) => {
                console.log("loading", type)
                const spriteFrame = new SpriteFrame();
                this.images[type] = spriteFrame;
                assetManager.loadRemote(url.replace('{type}', type), (err, asset: ImageAsset) => {
                    if (err) return reject(err);
                    const texture = new Texture2D();
                    texture.image = asset;
                    spriteFrame.texture = texture
                    resolve(spriteFrame);
                })
            });
        }
        return this.images[type];
    }

    finish(success = true) {
        if (success) {
            let time = Math.floor((Date.now() - this.startTime) / 1000);
            WXAPI.event("user_success", {
                "stage_id": this.gid,
                "is_last": this.stageNum != this.currentStage ? 0 : 1,
                "stage": this.currentStage,
                time: time
            })
            WXAPI.call({
                path: '/finish/' + this.gid,
                method: "POST",
                data: {
                    time: time,
                    "is_last": this.stageNum != this.currentStage ? 0 : 1,
                    "stage": this.currentStage,
                }
            })
        } else {
            WXAPI.event("user_fail", {
                "stage_id": this.gid,
                "stage": this.currentStage,
                time: Math.floor((Date.now() - this.startTime) / 1000)
            })
        }
        if (this.stageNum != this.currentStage && success) {
            this.currentStage++;
            this.clean();
            this.loadGame(this.stages[this.currentStage - 1])
            // find('Canvas/Bottom/Layout/GameFeature').active = true;
        } else {
            if (success) {
                let ff = find('Success').getComponent(PopupControl);
                ff.open();
            } else if (!this.been_revive) {
                let ff = find('Revive').getComponent(PopupControl);
                ff.open();
            } else {
                let ff = find('Fail Final').getComponent(PopupControl);
                ff.open();
            }
        }
    }

    detectDepends(card: CardTemplate) {
        // console.log(card.rect)
        for (let i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].rect.intersects(card.rect)) {
                card.addConstraint(this.Cards[i]);
                this.Cards[i].addDepend(card);
            }
        }
    }

    move(card: CardTemplate, event) {
        if (card.queued) return false;
        if (this.WaitingCards.length >= MAX_QUEUE) return false;
        card.queued = true;

        this.lastAct = card;
        let goal = this.makePlace(card);

        this.detectMerge();
        card.removeConstraint();
        card.move(goal, () => {
            this.merge();
            // determine if success;
            if (this.Cards.length == this.MergedCards.length) this.finish(true);
            // determine if failed;
            else if (this.WaitingCards.length >= MAX_QUEUE) this.finish(false);
        })
    }

    onUndo() {
        if (this.node.active == false) return currentActive.onUndo();

        let pos = this.findWaitingPos(this.lastAct);
        if (pos == -1) {
            // 不支持undo已经消除的步骤
            console.log("[undo] can not find the card in queue");
            return false;
        }
        this.lastAct.undo();
        this.extraCards(pos, 1);
    }

    onExtraCards(callback = () => { }) {
        if (this.node.active == false) return currentActive.onExtraCards();

        // let cards = this.extraCards(0, MAX_QUEUE);
        let cards = this.extraCards(0, Math.ceil(this.WaitingCards.length / 2));
        for (let i = 0; i < cards.length; i++) {
            cards[i].extra();
        }
        callback();
    }

    onRevive() {
        if (this.node.active == false) return currentActive.onRevive();
        this.onRandom(() => { this.onExtraCards() });
    }

    onRandom(callback = () => { }) {
        if (this.node.active == false) return currentActive.onRandom();

        let cache: object[] = [];
        this.Cards.forEach((card) => {
            if (!card.queued) {
                cache.push(card.getData())
                card.lastPos = card.node.worldPosition.clone()
                card.fly(this.node.parent.worldPosition, () => { }, 0.2)
            }
        })
        shuffle(cache)
        this.scheduleOnce(() => {
            this.Cards.forEach((card) => {
                if (!card.queued) {
                    card.reInit(cache.shift())
                    card.fly(card.lastPos);
                }
            })
            callback();
        }, 0.6)

    }

    findWaitingPos(card: CardTemplate) {
        for (let i = 0; i < this.WaitingCards.length; i++) {
            if (this.WaitingCards[i].id == card.id) {
                return i;
            }
        }
        return -1;
    }

    extraCards(start = 0, num = 3): CardTemplate[] {
        let cards = this.WaitingCards.splice(start, num);
        this.refreshQueue();
        return cards;
    }

    detectMerge(): boolean {
        let last: string = null;
        let count = 0;
        for (let i = 0; i < this.WaitingCards.length; i++) {
            let type = this.WaitingCards[i].type
            if (type == last) {
                count++;
            } else {
                last = type;
                count = 1;
            }
            if (count == 3) {
                this.markMerge(type);
                this.onMatch();
                return true;
            }
        }
        return false;
    }

    markMerge(type: string) {
        // let count = 0;
        for (let i = 0; i < this.WaitingCards.length; i++) {
            if (this.WaitingCards[i].type == type) {
                let cards = this.WaitingCards.splice(i, 3);
                this.MergingCards.push(cards[0]);
                this.MergingCards.push(cards[1]);
                this.MergingCards.push(cards[2]);
                // card.merging = true;
                // count++;
                // if (count == 3) break;
            }
        }
    }

    merge() {
        if (!this.MergingCards.length) return;
        for (let i = 0; this.MergingCards.length && i < 3; i++) {
            let card = this.MergingCards.shift();
            this.MergedCards.push(card)
            tween<Node>().target(card.node)
                .to(0.2, {
                    scale: new Vec3(0, 0, 0)
                })
                .call(() => {
                    card.node.destroy()
                })
                .start()
        }
        this.onMerge();
        this.refreshQueue();
    }

    refreshQueue(start = 0) {
        for (let i = start; i < this.WaitingCards.length; i++) {
            tween<Node>().target(this.WaitingCards[i].node)
                .to(0.4, { worldPosition: this.Container.getChildByName("Node-00" + i).worldPosition })
                .start()
        }
    }

    // 找到一个插入的位置
    makePlace(card: CardTemplate): Node {
        let found = -1;
        for (let i = this.WaitingCards.length - 1; i >= 0; i--) {
            if (this.WaitingCards[i].type == card.type) {
                found = i;
                this.onSameCard();
                break;
            }
        }
        let place: Node
        if (found == -1) {
            let last = this.WaitingCards.length;
            this.WaitingCards.push(card);
            place = this.Container.getChildByName("Node-00" + last);
            this.onPlace();
        } else { // 把不同类型的牌往后挪
            this.WaitingCards.splice(found + 1, 0, card);
            place = this.Container.getChildByName("Node-00" + (found + 1));
            this.refreshQueue(found + 2);
        }
        return place;
    }

    private random(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    private onMerge() {
        this.playAudio("merge");
    }

    private onSameCard() {

        this.playAudio(this.random(["good", "good2"]));
    }

    private onMatch() {
        this.playAudio("good3");
    }

    private onPlace() {
        if (this.WaitingCards.length <= 5) {
            this.playAudio('p' + this.WaitingCards.length);
        } else {
            this.playAudio('bad');
        }
    }

    private playAudio(filename) {
        if (!clickAudio.isEnabled()) return;
        resources.load("audio/" + filename, AudioClip, (err, audio) => {
            this.audio.playOneShot(audio);
        })
    }

    start() {

    }

    update(deltaTime: number) {

    }

    share(ev, msg) {
        WXAPI.share(msg, () => { });
    }

    getTool(ev, msg) {
        console.log("getTool", ev, msg, this)
        if (msg == 'undo' && this.been_undo) return false;
        if (msg == 'extra' && this.been_extra) return false;
        if (msg == 'shuffle' && this.been_shuffle) return false;
        if (msg == 'revive' && this.been_revive) return false;
        // if share
        let node: Node = null;
        switch (msg) {
            case 'undo':
                WXAPI.share(msg, () => {
                    this.onUndo()
                    this.been_undo = true;
                    node = find('Canvas/Bottom/Layout/GameFeature/Undo Button')
                    this.afterTool(node, msg);
                });
                break;
            case "extra":
                let func = ["share", "video"][Math.floor(Math.random() * 1.3)];
                WXAPI[func](msg, () => {
                    this.onExtraCards()
                    this.been_extra = true;
                    node = find('Canvas/Bottom/Layout/GameFeature/Extra Button')
                    this.afterTool(node, msg);
                })
                break;
            case "shuffle":
                WXAPI.share(msg, () => {
                    this.onRandom()
                    this.been_shuffle = true;
                    node = find('Canvas/Bottom/Layout/GameFeature/Shuffle Button')
                    this.afterTool(node, msg);
                });
                break;
            case "revive":
                WXAPI.video(msg, () => {
                    this.onRevive()
                    this.been_revive = true;
                    find('Revive').getComponent(PopupControl).close()
                    this.afterTool(node, msg);
                })
                break;
        }
    }

    afterTool(node, msg) {
        if (node) {
            let btn = node.getComponent(Button);
            let img = node.getComponent(Sprite);
            btn.interactable = false;
            img.color = math.color("#555555");
        }
        WXAPI.event("user_use_tool", {
            tool: msg
        })
    }

    encode(row: string): number {
        return row
            .split('')
            .reverse()
            .map((v:any) => { return v * 1 })
            .reduce((sum, bit, i) => {
                return sum + bit * Math.pow(2, i)
            })
    }

    decode(code: number): string {
        let result = '';
        while (code) {
            if (code % 2) {
                result = '1' + result;
                code--;
            } else
                result = '0' + result;
            code /= 2
        }
        return result;
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
