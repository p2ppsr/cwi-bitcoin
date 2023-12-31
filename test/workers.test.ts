import should = require('should')
import { Bip32 } from '../src/bip-32'
import { Ecies } from '../src/ecies'
import { Hash } from '../src/hash'
import { KeyPair } from '../src/key-pair'
import { PrivKey } from '../src/priv-key'
import { PubKey } from '../src/pub-key'
import { Workers } from '../src/workers'

describe('Workers', () => {
    it('should satisfy this basic API', () => {
        const workers = new Workers()
        should.exist(workers.nativeWorkers)
        should.exist(workers)
    })

    it('should handle a bunch of things at the same time', async function () {
        this.timeout(6000)
        const n = 100
        const str = Bip32.fromString(
            'xprv9s21ZrQH143K2SX7qL4vxLnbDHtupmfrkv96s1N3eeqKa4LnS5ZNMzhiSQWqL1fmkeF1rF7ndtvDoYH4sKJLMMpaJup21c7C3kyAg8DfbPQ'
        ).toString()
        const arr = []
        for (let i = 0; i < n; i++) {
            arr[i] = Bip32.asyncFromString(str)
        }
        arr.length.should.equal(n)
        await Promise.all(arr)
    })

    it('should handle several big things at the same time', async function () {
        this.timeout(10000)
        const messageBuf = Buffer.from('0'.repeat(10000))
        const fromKeyPair = KeyPair.fromRandom()
        const toKeyPair = KeyPair.fromRandom()
        const toPubKey = toKeyPair.pubKey
        const toPrivKey = toKeyPair.privKey
        const encBuf = await Ecies.asyncBitcoreEncrypt(messageBuf, toPubKey, fromKeyPair)
        await Promise.all([
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
            Ecies.asyncBitcoreDecrypt(encBuf, toPrivKey),
        ])
    })

    describe('#asyncObjectMethod', () => {
        it('should compute this method in the workers', async () => {
            const bip32 = new Bip32().fromRandom()
            const workersResult = await Workers.asyncObjectMethod(bip32, 'toString', [])
            const str = JSON.parse(workersResult.resbuf.toString())
            str[0].should.equal('x')
        })

        it('should compute this method with Yours Bitcoin object in args in the workers', async () => {
            const privKey = new PrivKey().fromRandom()
            const pubKey1 = new PubKey().fromPrivKey(privKey)
            const workersResult = await Workers.asyncObjectMethod(new PubKey(), 'fromPrivKey', [privKey])
            const pubKey2 = new PubKey().fromFastBuffer(workersResult.resbuf)
            pubKey1.toString().should.equal(pubKey2.toString())
        })
    })

    describe('@asyncClassMethod', () => {
        it('should compute this method in the workers', async () => {
            const buf = Buffer.from([0, 1, 2, 3, 4])
            const args = [buf]
            const workersResult = await Workers.asyncClassMethod(Hash, 'sha1', args)
            const hashBuf1 = workersResult.resbuf
            const hashBuf2 = Hash.sha1(buf)
            Buffer.compare(hashBuf1, hashBuf2).should.equal(0)
        })
    })
})
