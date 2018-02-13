const SHA256 = require('crypto-js/sha256')
const { performance } = require('perf_hooks');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }
}

class Block {
  constructor (transactions, previousHash = '') {
    this.index = Block.getIndex()
    this.timestamp = new Date().getTime()
    this.transactions = transactions
    this.previousHash = previousHash
    this.hash = this.calculateHash()
    this.nonce = 0
  }

  static getIndex() {
    Block.index = Block.index === undefined ? 0 : Block.index + 1
    return Block.index
  }

  calculateHash() {
    return SHA256([this.index, this.timestamp, this.previousHash, JSON.stringify(this.data), this.nonce].join('')).toString()
  }

  mineBlock(difficulty) {
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("a")) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log(`Block mined:${this.hash}`)
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 5
    this.pendingTransactions = []
    this.miningReward = 10
  }

  createGenesisBlock() {
    return new Block("Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(this.pendingTransactions)

    performance.mark('A')

    block.mineBlock(this.difficulty)

    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
    const measure = performance.getEntriesByName('A to B')[0];
    console.log(`Mining time, sec: ${measure.duration/(1000)}`);
    console.log('Block sucessfully mined!')

    this.chain.push(block)

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ]
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction)
  }

  getBalanceOfAddress(address) {
    let balance = 0

    for(const block of this.chain) {
      if(block.transactions) {
        for(const transaction of block.transactions) {
          if(transaction.fromAddress === address) {
            balance -= transaction.amount
          }

          if(transaction.toAddress === address) {
            balance += transaction.amount
          }
        }
      }
    }

    return balance
  }

  isValid() {
    for(let i = 1; i < this.chain.length; i++) {
      let currentBlock = this.chain[i]
      let previousBlock = this.chain[i-1]

      if(currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }
      if(currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }
}

let simpleBlockChain = new Blockchain()
simpleBlockChain.createTransaction(new Transaction('address1', 'address2', 100))
simpleBlockChain.createTransaction(new Transaction('address2', 'address1', 50))

console.log('Starting the miner...')
simpleBlockChain.minePendingTransactions('miner address')
console.log('Balance of miner address', simpleBlockChain.getBalanceOfAddress('miner address'))
simpleBlockChain.minePendingTransactions('miner address')
console.log('Balance of miner address', simpleBlockChain.getBalanceOfAddress('miner address'))
