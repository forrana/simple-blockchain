const SHA256 = require('crypto-js/sha256')

class Block {
  constructor (data, previousHash = '') {
    this.index = Block.getIndex()
    this.timestamp = new Date().getTime()
    this.data = data
    this.previousHash = previousHash
    this.hash = this.calculateHash()
  }

  static getIndex() {
    Block.index = Block.index === undefined ? 0 : Block.index + 1
    return Block.index
  }

  calculateHash() {
    return SHA256([this.index, this.timestamp, this.previousHash, JSON.stringify(this.data)].join('')).toString()
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
  }

  createGenesisBlock() {
    return new Block({ description: "Genesis block" }, -1);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(data) {
    let newBlock = new Block(data)
    newBlock.previousHash = this.getLatestBlock().hash
    newBlock.hash = newBlock.calculateHash()
    this.chain.push(newBlock)
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
simpleBlockChain.addBlock({ description: "Block number 1" })
simpleBlockChain.addBlock({ description: "Block number 2" })

console.log(simpleBlockChain.chain)
console.log(`Is blockchain valid? ${simpleBlockChain.isValid()}`)

simpleBlockChain.chain[1].data = { description: "Block number 0" }
simpleBlockChain.chain[1].hash = simpleBlockChain.chain[1].calculateHash()

console.log(`Is blockchain valid? ${simpleBlockChain.isValid()}`)
