import {
    _decorator,
    assert,
    Button,
    Component,
    math,
    Node,
    NodeEventType,
    Sprite,
    SpriteFrame,
    tween,
    UITransform,
    Vec3
} from 'cc'

const { ccclass, property } = _decorator;


@ccclass('Card')
export class CardTemplate extends Component {
    @property
    public id = 0;

    @property
    public type = "";

    @property(Sprite)
    public icon: Sprite = null;

    public queued = false;

    public depends:{int:CardTemplate} = {};
    public constraints:{int:CardTemplate} = {};

    public rect:math.Rect;
    public scale:Vec3;
    public lastPos:Vec3;

    public init(data, callback) {
        this.id = data.id;
        this.type = data.type;
        this.rect = data.rect;
        this.scale = data.scale;

        this.rect.x += this.rect.width/5
        this.rect.y += this.rect.height/5;
        this.rect.width -= this.rect.width/5;
        this.rect.height -= this.rect.height/5;
        this.node.scale = this.scale;


        this.enable();

        this.node.getChildByName('mask').on(NodeEventType.TOUCH_START, (event) => {
            // 阻止冒泡=
            event.propagationStopped = true;
            if (event.stopPropagation) event.stopPropagation();
            return false;
        })

        this.node.on(Node.EventType.TOUCH_CANCEL, (event) => {
            // console.log('TOUCH_CANCEL', this.node.name);
        })

        this.node.on(Node.EventType.TOUCH_END, (event) => {
            // console.log('TOUCH_END', this.node.name);
            let btn:Button = this.getComponent(Button);
            assert(btn);
            if (btn.interactable) {
                callback(this, event);
            }
        });

        return this;
    }

    reInit(data) {
        this.type = data.type;
        this.setIcon(data.icon)
    }

    public getData() {
        return {
            type: this.type,
            icon: this.getIcon()
        }
    }

    public getIcon() {
        return this.icon.spriteFrame;
    }

    public setIcon(icon:SpriteFrame) {
        this.icon.spriteFrame = icon;
    }

    public addDepend(card:CardTemplate) {
        // console.log(this.node.name, 'depends on', card.node.name)
        this.depends[card.id] = (card);
        this.disable();
    }

    public addConstraint(card:CardTemplate) {
        // console.log(this.node.name, 'constraint ', card.node.name)
        this.constraints[card.id] = (card);
    }

    public removeConstraint() {
        for (let i in this.constraints) {
            let c:CardTemplate = this.constraints[i];
            c.removeDepend(this);
        }
    }

    public removeDepend(card:CardTemplate) {
        if ( ! this.depends || ! this.depends[card.id] ) return; // 如果一张牌是extra出来的，有可能后面的牌已经都消失了
        delete this.depends[card.id];
        if (Object.keys(this.depends).length == 0) {
            this.enable();
        }
    }

    public disable() {
        let btn:Button = this.getComponent(Button);
        assert(btn);
        btn.interactable = false;
        let mask:Node = this.node.getChildByName("mask");
        mask.active = true;
    }

    public enable() {
        let btn:Button = this.getComponent(Button);
        assert(btn);
        btn.interactable = true;
        let mask:Node = this.node.getChildByName("mask");
        mask.active = false;
    }

    public move(to:Node, callback) {
        this.removeConstraint();
        this.lastPos = this.node.worldPosition.clone();
        this.fly(to.worldPosition.clone(), ()=>{
            callback.apply(this, arguments);
            this.rect = this.node.getComponent(UITransform).getBoundingBoxToWorld();
        }, 0.4, new Vec3(0.8, 0.8, 1))
    }

    public undo() {
        this.fly(this.lastPos, ()=>{
            this.queued = false;
            for (let i in this.constraints) {
                let c:CardTemplate = this.constraints[i];
                c.addDepend(this)
            }
        }, 0.4, this.scale)
    }

    public extra() {
        let pos = this.node.worldPosition;
        this.fly(new Vec3(pos.x, pos.y+300), ()=>{}, 0.2, this.node.getScale());
        this.queued = false;
    }

    public fly(to:Vec3, callback=()=>{}, duration=0.4,
               scale:Vec3=null){
        let props = {
            worldPosition: to
        };
        if (scale) props.scale = scale;
        tween<Node>()
            .target(this.node)
            .to(duration, props)
            .call(callback)
            .start()
    }
}

