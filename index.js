const crypto = require('crypto');

class Wallet {
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    sendMoney(blockchain, amount, receiverPublicKey) {
        const transaction = new Transaction(this.publicKey, receiverPublicKey, amount)
        const signature = transaction.signTransaction(this.privateKey)
        blockchain.addTransaction(transaction, signature)
    }
}

class Transaction {
    constructor(senderPublicKey, receiverPublicKey, amount) {
        this.senderPublicKey = senderPublicKey
        this.receiverPublicKey = receiverPublicKey
        this.amount = amount
        this.timestamp = Date.now()
    }
    toString() {
        return JSON.stringify(this)
    }
    signTransaction(senderPrivateKey) {
        const hashedTransaction = crypto.createSign("sha256");
        hashedTransaction.update(this.toString()).end();
        return hashedTransaction.sign(senderPrivateKey);
    }
    verifySignature(signature) {
        if (this.senderPublicKey === null) return true
        const verify = crypto.createVerify("sha256");
        verify.update(this.toString());
        return verify.verify(this.senderPublicKey, signature);
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

    addTransaction(transaction, signature) {
        const isValid = transaction.verifySignature(signature)
        if (!isValid) throw new Error('Invalid Signature')
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
                if (transaction.senderPublicKey == address) {
                    total -= transaction.amount
                }
                if (transaction.receiverPublicKey == address) {
                    total += transaction.amount
                }
            }
        }
        return total
    }
}


let myCoin = new BlockChain()
const wallet1 = new Wallet()
const wallet2 = new Wallet()

wallet1.sendMoney(myCoin, 10, wallet2.publicKey)
wallet1.sendMoney(myCoin, 20, wallet2.publicKey)
wallet1.sendMoney(myCoin, 30, wallet2.publicKey)

myCoin.minePendingTransactions(wallet1.publicKey)

console.log('lets see some transactions')
console.log(myCoin.chain[1].transactions[0])