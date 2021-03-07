const crypto = require('crypto');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
}

class Block {
    constructor(transactions, previousHash, timestamp) {
        this.transactions = transactions
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.hash = this.hashBlock()
        this.nonce = 0
    }

    hashBlock() {
        const { hash, ...block } = this
        const stringBlock = JSON.stringify(block)
        return crypto.createHash("sha256").update(stringBlock).digest("hex");
    }
    mine(difficulty) {
        while (this.hash.substring(0, difficulty) != Array(difficulty).fill('0').join('')) {
            this.nonce += 1
            this.hash = this.hashBlock()
        }
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.initGenesisBlock()]
        this.difficulty = 2
        this.pendingTransactions = []
        this.miningReward = 100
    }
    initGenesisBlock() {
        const genesis = new Block([new Transaction(null, 'addr1', 10)], '0', 0)
        genesis.mine(1)
        return genesis
    }

    get newestBlock() {
        return this.chain[this.chain.length - 1]
    }

    minePendingTransactions(rewardAddress) {
        let block = new Block(this.pendingTransactions, '', Date.now())
        block.previousHash = this.newestBlock.hash
        block.mine(this.difficulty)
        this.chain.push(block)
        this.pendingTransactions = [new Transaction(null, rewardAddress, this.miningReward)]
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction)
    }

    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (previousBlock.hash != currentBlock.previousHash) {
                return { valid: false, msg: 'Previous Hash does not match' }
            }

            if (currentBlock.hash != currentBlock.hashBlock()) {
                return { valid: false, msg: 'Incorrect Block Hash' }
            }
        }
        return { valid: true, msg: 'Valid Blockchain' };
    }

    getBalance(address) {
        let total = 0
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.fromAddress == address) {
                    total -= transaction.amount
                }
                if (transaction.toAddress == address) {
                    total += transaction.amount
                }
            }
        }
        return total
    }
}


let myCoin = new BlockChain()

myCoin.createTransaction(new Transaction('addr1', 'addr2', 20))
myCoin.createTransaction(new Transaction('addr2', 'addr1', 20))
myCoin.createTransaction(new Transaction('addr3', 'addr1', 100))
myCoin.minePendingTransactions('minerAddr')
myCoin.minePendingTransactions('minerAddr')
myCoin.minePendingTransactions('minerAddr')
myCoin.minePendingTransactions('minerAddr')
myCoin.minePendingTransactions('minerAddr')
myCoin.minePendingTransactions('minerAddr')
myCoin.minePendingTransactions('minerAddr')


console.log(myCoin.chain)
console.log(` Miners Balance ${myCoin.getBalance('minerAddr')}`)
