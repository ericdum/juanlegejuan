import { _decorator, Component, Node, find, SpriteFrame,
    resources, tween, Vec3,
    UITransform, Button, director,
    AudioClip, AudioSource,
    rect} from 'cc';
import {CardTemplate} from "db://assets/prefabs/Card";
import {PopupControl} from "db://assets/scripts/PopupControl";
import {clickAudio} from "db://assets/scripts/clickAudio";
const { ccclass, property } = _decorator;

const TYPES = [
    'guo', 'shuaiguo', 'gouqi', 'gupiao', 'tutou', 'naicha', 'lvmaozi', 'waimai', 'jiu', 'maoyu', 'hei', 'bing', 'ppt',
    'dingding', 'gongpai', 'jiayou',
];

let currentActive:CardControl = null;

@ccclass('CardControl')
export class CardControl extends Component {
    @property
    public level = 3;
    protected Cards:[CardTemplate] = [];
    protected MergedCards:[CardTemplate] = [];
    protected MergingCards:[CardTemplate] = [];
    protected WaitingCards:[CardTemplate] = [];
    protected Container:Node;

    private audio:AudioSource = new AudioSource();
    protected lastAct:CardTemplate;

    protected onLoad() {
        if (this.node.name == "Playground") currentActive = this;
        // find('Canvas/Bottom/Layout/GameFeature').active = false;
        this.Cards.splice(0);
        this.MergedCards.splice(0);
        this.MergingCards.splice(0);
        this.WaitingCards.splice(0);

        const total = this.node.children.length;
        if (this.level > total) this.level = total;
        const types = shuffle(TYPES).slice(0, this.level); // 选 4 个
        const CONFIG = [];
``
        // 平均分
        for (let i=0; i<total/3; i++) {
            let type = types[i%this.level];
            CONFIG.push( {type: type} );
            CONFIG.push( {type: type} );
            CONFIG.push( {type: type} );
        }
        shuffle(CONFIG);
        for (let i=0; i<CONFIG.length; i++) {
            let node: Node = find("/card-"+(CONFIG.length-i-1), this.node);
            // console.log('find', node, i)
            if (node) {
                let card:CardTemplate = node.getComponent(CardTemplate);
                card.init({
                    id: i,
                    type: CONFIG[i].type
                }, this.move.bind(this))
                this.detectDepends(card);
                this.Cards.push(card);
                resources.load('icons/' + CONFIG[i].type + '/spriteFrame', SpriteFrame, ((card) => {
                    return (err, asset) => {
                        card.setIcon(asset);
                    }
                })(card));
            }
        }
        this.Container = find('Canvas/Bottom/Layout/Queue/container');
        console.log('Container', this.Container);
    }

    finish(success=true) {
        if (this.node.name == 'PlayGround' && success) {
            this.node.active = false;
            let node = find('Canvas/PlayGround-2');
            currentActive = node.getComponent(CardControl);
            tween<Node>().target(node)
                .to(0.4, { worldPosition: this.node.worldPosition})
                .start()
            // find('Canvas/Bottom/Layout/GameFeature').active = true;
        } else {
            if (success) {
                director.loadScene("home");
            } else {
                let ff = find('Fail Final').getComponent(PopupControl);
                ff.open();
            }
        }
    }

    detectDepends(card:CardTemplate) {
        // console.log(card.rect)
        for (let i=0; i<this.Cards.length; i++) {
            if (this.Cards[i].rect.intersects(card.rect)) {
                card.addDepend(this.Cards[i]);
                this.Cards[i].addConstraint(card);
            }
        }
    }

    move(card:CardTemplate, event) {
        if (card.queued) return false;
        if (this.WaitingCards.length >= 7) return this.finish(false);
        card.queued = true;

        this.lastAct = card;
        let goal = this.makePlace(card);
        this.detectMerge();
        card.removeConstraint();
        card.move(goal,()=>{
            this.merge();
            // determine if success;
            if (this.Cards.length == this.MergedCards.length) this.finish(true);
            // determine if failed;
            else if (this.WaitingCards.length >= 7) this.finish(false);
        })
    }

    before() {
        // 从数据库获取.
        if (typeof wx != "undefined") wx.shareAppMessage({
            title: "谁是卷王",
            imageUrl: 'https://mujiang-1253455114.cos.ap-shanghai.myqcloud.com/juan/assets/assets/head.png', //显示图片长宽比是 5:4
            // imageUrlId: 1,审核通过的图片 ID，详见 使用审核通过的转发图片
            query: "test=genzong",
            toCurrentGroup: false
        })
    }

    onUndo() {
        if (this.node.active == false) return currentActive.onUndo();
        this.before()

        let pos = this.findWaitingPos(this.lastAct);
        if (pos == -1) {
            // 不支持undo已经消除的步骤
            console.log( "[undo] can not find the card in queue");
            return false;
        }
        this.lastAct.undo();
        this.extraCards(pos, 1);
    }

    onExtraCards() {
        if (this.node.active == false) return currentActive.onExtraCards();
        this.before()

        let cards = this.extraCards(0, 3);
        for (let i = 0; i < cards.length; i++) {
            cards[i].extra();
        }
    }

    onRandom() {
        if (this.node.active == false) return currentActive.onRandom();
        this.before()

        let cache:[{}] = [];
        this.Cards.forEach((card)=> {
            if ( ! card.queued) {
                cache.push(card.getData())
                card.lastPos = card.node.worldPosition.clone()
                card.fly(this.node.parent.worldPosition, ()=>{}, 0.2)
            }
        })
        shuffle(cache)
        this.scheduleOnce(()=>{
            this.Cards.forEach((card)=> {
                if ( ! card.queued) {
                    card.reInit(cache.shift())
                    card.fly(card.lastPos);
                }
            })
        }, 0.6)

    }

    findWaitingPos(card:CardTemplate) {
        for (let i=0; i<this.WaitingCards.length; i++) {
            if (this.WaitingCards[i].id == card.id) {
                return i;
            }
        }
        return -1;
    }

    extraCards(start = 0, num = 3): [CardTemplate] {
        let cards = this.WaitingCards.splice(start, num);
        this.refreshQueue();
        return cards;
    }

    detectMerge(): boolean {
        let last:string = null;
        let count = 0;
        for (let i = 0; i<this.WaitingCards.length; i++) {
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

    markMerge(type:string) {
        // let count = 0;
        for (let i = 0; i < this.WaitingCards.length; i++) {
            if ( this.WaitingCards[i].type == type ) {
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
            card.node.destroy()
        }
        this.refreshQueue();
    }

    refreshQueue(start=0) {
        for (let i = start; i < this.WaitingCards.length; i++) {
            tween<Node>().target(this.WaitingCards[i].node)
                .to(0.4, { worldPosition: this.Container.getChildByName("Node-00"+i).worldPosition})
                .start()
        }
    }

    // 找到一个插入的位置
    makePlace(card:CardTemplate): Vec3 {
        let found = -1;
        for (let i = this.WaitingCards.length-1; i>=0; i--) {
            if (this.WaitingCards[i].type == card.type) {
                found = i;
                this.onSameCard();
                break;
            }
        }
        let place:Node
        if (found == -1) {
            place = this.Container.getChildByName("Node-00"+this.WaitingCards.length);
            this.WaitingCards.push(card);
            this.onPlace();
        } else { // 把不同类型的牌往后挪
            place = this.Container.getChildByName("Node-00"+(found+1));
            this.WaitingCards.splice(found+1, 0, card);
            this.refreshQueue(found+2);
        }
        return place.worldPosition;
    }

    private random(list) {
        return list[Math.floor(Math.random()*list.length)];
    }

    private onSameCard() {

        this.playAudio(this.random(["good", "good2"]));
    }

    private onMatch() {
        this.playAudio("good3");
    }

    private onPlace() {
        if (this.WaitingCards.length <= 5) {
            this.playAudio('p'+this.WaitingCards.length);
        } else {
            this.playAudio('bad');
        }
    }

    private playAudio(filename) {
        if ( ! clickAudio.isEnabled()) return;
        resources.load("audio/"+filename, AudioClip, (err, audio)=>{
            this.audio.playOneShot(audio);
        })
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

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
