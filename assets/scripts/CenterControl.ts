import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CenterControl')
export class CenterControl extends Component {
    @property({ type: Prefab })
    private dogLeft: Prefab = null;
    @property({ type: Prefab })
    private dogCenter: Prefab = null;
    @property({ type: Prefab })
    private dogRight: Prefab = null; ther
    @property({ type: Prefab })
    private dogOther: Prefab = null;
    private positionArr = [
        [
            -4.433999999999969,
            -450.36800000000017,
            0,
            "dogCenter"
        ],
        [
            374.35500000000013,
            -455.89800000000014,
            0,
            "dogRight"
        ],
        [
            -266.889,
            -466.345,
            0,
            "dogLeft"
        ],
        [
            -435.755,
            -530.5500000000002,
            0,
            "dogLeft"
        ],
        [
            -211.80100000000004,
            -541.6090000000002,
            0,
            "dogLeft"
        ],
        [
            -352.809,
            -623.225,
            0,
            "dogOther"
        ],
        [
            -499.348,
            -682.6190000000001,
            0,
            "dogLeft"
        ],
        [
            97.86599999999999,
            -494.6060000000002,
            0,
            "dogCenter"
        ],
        [
            -109.5,
            -607.9660000000001,
            0,
            "dogCenter"
        ],
        [
            540.2479999999999,
            -486.3120000000001,
            0,
            "dogRight"
        ],
        [
            310.76300000000003,
            -552.6690000000001,
            0,
            "dogRight"
        ],
        [
            537.4829999999998,
            -607.9670000000001,
            0,
            "dogRight"
        ],
        [
            150.399,
            -596.9060000000002,
            0,
            "dogCenter"
        ],
        [
            288.644,
            -679.854,
            0,
            "dogRight"
        ],
        [
            610.074,
            -733.891,
            0,
            "dogRight"
        ],
        [
            363.29599999999994,
            -787.6840000000002,
            0,
            "dogRight"
        ],
        [
            642.5490000000001,
            -881.69,
            0,
            "dogRight"
        ],
        [
            238.87599999999998,
            -859.5710000000001,
            0,
            "dogRight"
        ],
        [
            -18.259000000000015,
            -721.326,
            0,
            "dogCenter"
        ],
        [
            410.2990000000001,
            -881.69,
            0,
            "dogRight"
        ],
        [
            -76.32100000000003,
            -818.0970000000002,
            0,
            "dogRight"
        ],
        [
            592.7810000000001,
            -1022.6990000000001,
            0,
            "dogRight"
        ],
        [
            780.793,
            -1158.178,
            0,
            "dogRight"
        ],
        [
            321.823,
            -1006.1100000000001,
            0,
            "dogRight"
        ],
        [
            449.00699999999995,
            -1091.8210000000001,
            0,
            "dogRight"
        ],
        [
            -242.214,
            -704.7370000000001,
            0,
            "dogOther"
        ],
        [
            -385.988,
            -815.3330000000001,
            0,
            "dogLeft"
        ],
        [
            -491.053,
            -898.2800000000002,
            0,
            "dogLeft"
        ],
        [
            -670.771,
            -790.4490000000001,
            0,
            "dogLeft"
        ],
        [
            89.57100000000003,
            -948.0470000000001,
            0,
            "dogCenter"
        ],
        [
            -189.68100000000004,
            -870.6300000000001,
            0,
            "dogOther"
        ],
        [
            -352.809,
            -948.0480000000001,
            0,
            "dogLeft"
        ],
        [
            -643.122,
            -931.4580000000001,
            0,
            "dogLeft"
        ],
        [
            -117.79499999999996,
            -1003.3430000000001,
            0,
            "dogCenter"
        ],
        [
            -267.098,
            -1110.947,
            0,
            "dogLeft"
        ],
        [
            -499.348,
            -1061.4080000000001,
            0,
            "dogLeft"
        ],
        [
            -679.065,
            -1172.0030000000002,
            0,
            "dogLeft"
        ],
        [
            -499.348,
            -1324.0720000000001,
            0,
            "dogLeft"
        ],
        [
            114.457,
            -1072.467,
            0,
            "dogRight"
        ],
        [
            252.107,
            -1228.094,
            0,
            "dogCenter"
        ],
        [
            -147.067,
            -1168.589,
            0,
            "dogCenter"
        ],
        [
            -701.641,
            -1578.474,
            0,
            "dogOther"
        ],
        [
            677.886,
            -1378.186,
            0,
            "dogRight"
        ],
        [
            510.025,
            -1483.854,
            0,
            "dogRight"
        ],
        [
            585.246,
            -1694.149,
            0,
            "dogRight"
        ],
        [
            -193.828,
            -1332.251,
            0,
            "dogCenter"
        ],
        [
            86.736,
            -1379.011,
            0,
            "dogCenter"
        ],
        [
            201.812,
            -1575.919,
            0,
            "dogCenter"
        ],
        [
            -67.039,
            -1726.866,
            0,
            "dogCenter"
        ],
        [
            -408.043,
            -1665.425,
            0,
            "dogLeft"
        ],
        [
            230.816,
            -1849.085,
            0,
            "dogCenter"
        ],
        [
            656.595,
            -1999.177,
            0,
            "dogRight"
        ],
        [
            488.734,
            -2104.845,
            0,
            "dogRight"
        ],
        [
            -520.639,
            -1945.063,
            0,
            "dogLeft"
        ],
        [
            -289.358,
            -2111.619,
            0,
            "dogCenter"
        ],
        [
            65.445,
            -2000.002,
            0,
            "dogCenter"
        ],
        [
            180.521,
            -2196.91,
            0,
            "dogCenter"
        ],
        [
            -706.59,
            -2043.706,
            0,
            "dogOther"
        ],
        [
            -528.416,
            -2360.46,
            0,
            "dogOther"
        ]
    ]
    start() {

        for (let j = 0; j < this.positionArr.length; j++) {
            let key = this.positionArr[j][3]
            let dog = null
            if (key === "dogLeft") {
                dog = instantiate(this.dogLeft)
            } else if (key === "dogRight") {
                dog = instantiate(this.dogRight)
            } else if (key === "dogCenter") {
                dog = instantiate(this.dogCenter)
            } else {
                dog = instantiate(this.dogOther)
            }
            dog.setPosition(this.positionArr[j][0], this.positionArr[j][1])
            let parent = find("Canvas/Center")
            dog.parent = parent
        }
    }
    update(deltaTime: number) {

    }
}