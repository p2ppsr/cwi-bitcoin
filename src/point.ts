/**
 * Point (on secp256k1)
 * ====================
 *
 * A point is a point on the secp256k1 curve which is the elliptic curve used
 * by bitcoin. This code is a wrapper for Fedor Indutny's Point class from his
 * elliptic library. This code adds a few minor conveniences, but is mostly the
 * same. Since Fedor's code returns points and big numbers that are instances
 * of his point and big number classes, we have to wrap all the methods such as
 * getX() to return the Yours Bitcoin point and big number types.
 */
import * as elliptic from 'bitcoin-elliptic'
import { Bn } from './bn'

interface _Point {
    isInfinity(): boolean
    eq(point: _Point): boolean
}

const ec = elliptic.curves.secp256k1
const _point = ec.curve.point()
const _Point: new (...rest: any[]) => _Point = _point.constructor

export class Point extends _Point {
    public x: Bn
    public y: Bn

    constructor(x?: Bn, y?: Bn, isRed?: boolean) {
        super(ec.curve, x, y, isRed)
    }

    public static fromX(isOdd: boolean, x: Bn | number): Point {
        const _p = ec.curve.pointFromX(x, isOdd)
        const point = Object.create(Point.prototype)
        return point.copyFrom(_p)
    }

    public copyFrom(point: Point): this {
        if (!(point instanceof _Point)) {
            throw new Error('point should be an external point')
        }
        for (const key of Object.keys(point)) {
            this[key] = point[key]
        }
        return this
    }

    public add(p: Point): Point {
        p = _Point.prototype.add.call(this, p)
        const point = Object.create(Point.prototype)
        return point.copyFrom(p)
    }

    public mul(bn: Bn): Point {
        if (!bn.lt(Point.getN())) {
            throw new Error('point mul out of range')
        }
        const p = _Point.prototype.mul.call(this, bn)
        const point = Object.create(Point.prototype)
        return point.copyFrom(p)
    }

    public mulAdd(bn1: Bn, point: Point, bn2: Bn): Point {
        const p = _Point.prototype.mulAdd.call(this, bn1, point, bn2)
        point = Object.create(Point.prototype)
        return point.copyFrom(p)
    }

    public getX(): Bn {
        const _x = _Point.prototype.getX.call(this)
        const x = Object.create(Bn.prototype)
        _x.copy(x)
        return x
    }

    public getY(): Bn {
        const _y = _Point.prototype.getY.call(this)
        const y = Object.create(Bn.prototype)
        _y.copy(y)
        return y
    }

    public fromX(isOdd: boolean, x: Bn): this {
        const point = Point.fromX(isOdd, x)
        return this.copyFrom(point)
    }

    public toBuffer(): Buffer {
        const xbuf = this.getX().toBuffer({ size: 32 })
        const ybuf = this.getY().toBuffer({ size: 32 })
        let prefix: Buffer
        const odd = ybuf[ybuf.length - 1] % 2
        if (odd === 1) {
            prefix = Buffer.from([0x03])
        } else {
            prefix = Buffer.from([0x02])
        }
        return Buffer.concat([prefix, xbuf])
    }

    public toJSON(): { x: string; y: string } {
        return {
            x: this.getX().toString(),
            y: this.getY().toString(),
        }
    }

    public fromJSON(json: { x: string; y: string }): this {
        const x = new Bn().fromString(json.x)
        const y = new Bn().fromString(json.y)
        const point = new Point(x, y)
        return this.copyFrom(point)
    }

    public toString(): string {
        return JSON.stringify(this.toJSON())
    }

    public fromString(str: string): this {
        const json = JSON.parse(str)
        const p = new Point().fromJSON(json)
        return this.copyFrom(p)
    }

    public static getG(): Point {
        const _g = ec.curve.g
        const g = Object.create(Point.prototype)
        return g.copyFrom(_g)
    }

    public static getN(): Bn {
        return new Bn(ec.curve.n.toArray())
    }

    // https://www.iacr.org/archive/pkc2003/25670211/25670211.pdf
    public validate(): this {
        const p2 = Point.fromX(this.getY().isOdd(), this.getX())
        if (!(p2.getY().cmp(this.getY()) === 0)) {
            throw new Error('Invalid y value of public key')
        }
        if (
            !(this.getX().gt(-1) && this.getX().lt(Point.getN())) ||
            !(this.getY().gt(-1) && this.getY().lt(Point.getN()))
        ) {
            throw new Error('Point does not lie on the curve')
        }
        return this
    }
}
