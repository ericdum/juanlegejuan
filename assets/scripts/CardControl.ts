import { _decorator, Component, Node, find, SpriteFrame,
    resources, tween, Vec3 } from 'cc';
import {CardTemplate} from "db://assets/prefabs/Card";
const { ccclass, property } = _decorator

const CONFIG = [
    {type: "jiandao"},
    {type: "sniper"},
    {type: "jiandao"},
    {type: "tuzi"},
    {type: "sniper"},
    {type: "jiandao"},
    {type: "jiandao"},
    {type: "sniper"},
    {type: "sniper"},
    {type: "tuzi"},
    {type: "tuzi"},
    {type: "jiandao"},
    {type: "sniper"},
    {type: "tuzi"},
    {type: "tuzi"},
    {type: "jiandao"},
    {type: "sniper"},
    {type: "tuzi"},
];
resources.preloadDir('icons')

const Cards:[CardTemplate] = [];
const MergedCards:[CardTemplate] = [];
const WaitingCards:[CardTemplate] = [];
let Container:Node;

@ccclass('CardControl')
export class CardControl extends Component {
    protected onLoad() {
        for (let i=0; i<CONFIG.length; i++) {
            let node: Node = find("/card-"+i, this.node);
            if (node) {
                resources.load('icons/' + CONFIG[i].type + '/spriteFrame', SpriteFrame, (err, asset) => {
                    let card:CardTemplate = node.getComponent(CardTemplate).init({
                        id: i,
                        type: CONFIG[i].type,
                        iconSF: asset
                    }, this.onTouchStart.bind(this));

                    Cards.push(card);
                });
            }
        }
        Container = find('Canvas/Bottom/Layout/Queue/container');
        console.log('Container', Container);
    }

    onTouchStart(card, event) {
        if (card.queued) return false;
        card.queued = true;
        // this => CardTemplate
        let goal = this.makePlace(card);
        tween<Node>()
            .target(event.target)
            .to(0.4, {worldPosition: goal})
            .call(()=>{
                // 这里延迟会造成连续操作的错误
                if (this.detect()) {
                }
            })
            .start()
    }

    detect(): boolean {
        let last:string = null;
        let count = 0;
        for (let i = 0; i<WaitingCards.length; i++) {
            let type = WaitingCards[i].type
            if (type == last) {
                count++;
            } else {
                last = type;
                count = 1;
            }
            if (count == 3) {
                this.merge(type);
                return true;
            }
        }
        return false;
    }

    merge(type:string) {
        let merged = 0;
        for (let i = 0; i<WaitingCards.length; i++) {
            if ( WaitingCards[i].type == type ) {
                let card = WaitingCards.splice(i, 1)[0];
                MergedCards.push(card)
                card.node.destroy()
                merged++;
                i--;
            } else if (merged == 3) {
                tween<Node>().target(WaitingCards[i].node)
                    .to(0.4, { worldPosition: Container.getChildByName("Node-00"+i).worldPosition})
                    .start()
            }
        }
    }

    // 找到一个插入的位置
    makePlace(card:CardTemplate): Vec3 {
        let found = -1;
        for (let i = WaitingCards.length-1; i>=0; i--) {
            if (WaitingCards[i].type == card.type) {
                found = i;
                break;
            }
        }
        let place:Node
        if (found == -1) {
            place = Container.getChildByName("Node-00"+WaitingCards.length);
            WaitingCards.push(card);
        } else { // 把不同类型的牌往后挪
            let afterQueue = WaitingCards.splice(found+1);
            place = Container.getChildByName("Node-00"+WaitingCards.length);
            WaitingCards.push(card);

            for(let i=0; i<afterQueue.length; i++) {
                tween<Node>().target(afterQueue[i].node)
                    .to(0.4, { worldPosition: Container.getChildByName("Node-00"+(WaitingCards.length)).worldPosition})
                    .start()
                WaitingCards.push(afterQueue[i]);
            }
        }
        return place.worldPosition;
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

