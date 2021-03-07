const crypto = require('crypto');

class Block {
    constructor(data, previousHash, timestamp) {
        this.data = data
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.hash = this.hashBlock()
        this.nonce = 0
    }

    hashBlock() {
        const {hash, ...block} = this 
        const stringBlock = JSON.stringify(block)
        return crypto.createHash("sha256").update(stringBlock).digest("hex");
    }
    mine(difficulty){
        while (this.hash.substring(0, difficulty) != Array(difficulty).fill('0').join('')){
            this.nonce += 1
            this.hash = this.hashBlock()
        }
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.initGenesisBlock()]
        this.difficulty = 5
    }
    initGenesisBlock() {
        const genesis =  new Block(0, '0', 0)
        genesis.mine(1)
        return genesis
    }

    get newestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(block) {
        block.previousHash = this.newestBlock.hash
        block.mine(this.difficulty)
        this.chain.push(block)
    }

    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (previousBlock.hash != currentBlock.previousHash) {
                console.log('Previous Hash does not match')
                return false
            }

            if (currentBlock.hash != currentBlock.hashBlock()) {
                console.log('Incorrect Block Hash')
                return false
            }
        }
        return true;
    }
}


let myCoin = new BlockChain()

myCoin.addBlock(new Block('hello', '', Date.now()))
myCoin.addBlock(new Block('WORLD', '', Date.now()))
myCoin.addBlock(new Block('mate', '', Date.now()))

console.log(myCoin)

console.log(myCoin.validateChain())
myCoin.chain[1].data = 'YOYOYOYOYOY'
myCoin.chain[1].hash = myCoin.chain[1].hashBlock()
console.log(myCoin.validateChain())

