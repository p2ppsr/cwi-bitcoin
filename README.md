# CWI-Bitcoin

![Main CI](https://github.com/p2ppsr/cwi-bitcoin/workflows/Main%20CI/badge.svg)
[![npm](https://img.shields.io/npm/v/cwi-bitcoin.svg)](https://www.npmjs.com/package/cwi-bitcoin)
[![downloads](https://img.shields.io/npm/dt/cwi-bitcoin.svg)](https://www.npmjs.com/package/cwi-bitcoin)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
![GitHub](https://img.shields.io/github/license/p2ppsr/cwi-bitcoin)

TypeScript library for Bitcoin SV (BSV).

## Installation

```sh
npm install cwi-bitcoin
```

## Example

```ts
import { Address, Bn, KeyPair, PrivKey, TxBuilder, TxOut, deps } from 'cwi-bitcoin'

// make change address
const privKey1 = PrivKey.fromRandom()
const keyPair1 = KeyPair.fromPrivKey(privKey1)
const addr1 = Address.fromPubKey(keyPair1.pubKey)

// make address to send from
const privKey2 = PrivKey.fromBn(new Bn(1))
const keyPair2 = KeyPair.fromPrivKey(privKey2)
const addr2 = Address.fromPubKey(keyPair2.pubKey)

const txOut = TxOut.fromProperties(new Bn(2e8), addr2.toTxOutScript())
const txHashBuf = deps.Buffer.alloc(32).fill(0)

// make address to send to
const privKey3 = PrivKey.fromBn(new Bn(2))
const keyPair3 = KeyPair.fromPrivKey(privKey3)
const addr3 = Address.fromPubKey(keyPair3.pubKey)

const tx = new TxBuilder()
  .setFeePerKbNum(0.0001e8)
  .setChangeAddress(addr1)
  .inputFromPubKeyHash(txHashBuf, 0, txOut, keyPair2.pubKey)
  .outputToAddress(new Bn(1e8), addr3)
  .build()

const raw = tx.toHex()
```

## About

CWI-Bitcoin is a TypeScript library for Bitcoin SV (BSV).

It's a fork of a fork of [ts-bitcoin](https://github.com/ts-bitcoin/ts-bitcoin), which is a fork of bsv v2, which intended to satisfy certain goals:

1. Support ease-of-use by being internally consistent. It should not be
   necessary to read the source code of a class or function to know how to use it.
   Once you know how to use part of the library, the other parts should feel
   natural.

2. Have 100% test coverage, or nearly so, so that the library is known to be
   reliable. This should include running standard test vectors from the reference
   implementation.

3. Library objects have an interface suitable for use with a command-line
   interface or other libraries and tools, in particular having toString,
   fromString, toJSON, fromJSON, toBuffer, fromBuffer, toHex, fromHex methods.

4. All standard features of the blockchain are implemented (or will be) and
   saved in src/. All BIPs are correctly implemented and, where appropriate, saved
   as bip-xx.ts in src/ (since that is their standard name). In order to allow
   rapid development, Yours Bitcoin includes non-standard and experimental
   features. Any non-standard features (such as colored coins or stealth
   addresses) are labeled as such in index.ts as well as in comments.

5. Expose everything, including dependencies. This makes it possible to develop
   apps that require fine-grained control over the basics, such as big numbers and
   points. However, it also means that you can hurt yourself if you misuse these
   primitives.

6. Use standard javascript conventions wherever possible so that other
   developers find the code easy to understand.

7. Minimize the use of dependencies so that all code can be easily audited.

8. All instance methods modify the state of the object and return the object,
   unless there is a good reason to do something different. To access the result
   of an instance method, you must access the object property(s) that it modifies.

9. Support web workers to unblock web wallet UIs when performing cryptography.

## Environment Variables

- `NETWORK` - Default "mainnet"

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`
