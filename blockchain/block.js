const { GENESIS_DATA, MINE_RATE } = require("../config");
const { keccakHash } = require("../util");
const Transaction = require("../transaction");
const Trie = require("../store/trie");

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
  constructor({ blockHeaders, transactionSeries }) {
    // constructor input is an object with single field rather
    // the fields of arguments because we use objects more often
    // than inputs, makes code more readable in JS
    this.blockHeaders = blockHeaders;
    this.transactionSeries = transactionSeries;
  }

  static calculateBlockTargetHash({ lastBlock }) {
    const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
      16
    );
    // const value = (MAX_HASH_VALUE / 1000).toString(16);
    if (value.length > HASH_LENGTH) {
      // if MAX_HASH_VALUE / 1, value may become 65 characters hex string
      // the conversion process end up adding a number internally within JS
      // here is forcing the result to 64 "f" repeated characters
      return "f".repeat(HASH_LENGTH);
    }
    return "0".repeat(HASH_LENGTH - value.length) + value;
    // same as - value.padStart(64, "0")
  }

  static adjustDifficulty({ lastBlock, timestamp }) {
    let { difficulty } = lastBlock.blockHeaders;
    if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE) {
      difficulty--;
      if (difficulty < 1) return 1;
    } else difficulty++;
    return difficulty;
  }

  static mineBlock({ lastBlock, beneficiary, transactionSeries, stateRoot }) {
    const target = Block.calculateBlockTargetHash({ lastBlock });
    const miningRewardTransaction = Transaction.createTransaction({
      beneficiary,
    });
    transactionSeries.push(miningRewardTransaction);
    const transactionsTrie = Trie.buildTrie({ items: transactionSeries });
    let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

    do {
      timestamp = Date.now();
      truncatedBlockHeaders = {
        parentHash: keccakHash(lastBlock.blockHeaders),
        beneficiary,
        difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
        number: lastBlock.blockHeaders.number + 1,
        timestamp,

        // NOTE: the `transactionsRoot` will be refactored once Tries are implemented.
        // transactionsRoot: keccakHash(transactionSeries),
        transactionsRoot: transactionsTrie.rootHash,
        stateRoot,
      };
      header = keccakHash(truncatedBlockHeaders);
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

      underTargetHash = keccakHash(header + nonce);
    } while (underTargetHash > target);

    // console.log("underTargetHash", underTargetHash);
    // console.log("target", target);

    return new this({
      blockHeaders: { ...truncatedBlockHeaders, nonce },
      transactionSeries,
    });
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static validateBlock({ lastBlock, block, state }) {
    return new Promise((resolve, reject) => {
      if (keccakHash(block) === keccakHash(Block.genesis())) return resolve();

      if (keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash)
        return reject(
          new Error(
            "The parent hash must be a hash of the last block's headers"
          )
        );

      if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1)
        return reject(new Error("The block must increment the number by 1"));

      if (
        Math.abs(
          lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty
        ) > 1
      )
        return reject(new Error("The difficulty must only adjust by 1"));

      const rebuiltTransactionsTrie = Trie.buildTrie({
        items: block.transactionSeries,
      });

      // console.log(rebuiltTransactionsTrie);
      // console.log(block);

      if (
        rebuiltTransactionsTrie.rootHash !== block.blockHeaders.transactionsRoot
      )
        return reject(
          new Error(
            `The rebuilt transactions root does not match the block's ` +
              `transactions root: ${block.blockHeaders.transactionsRoot}`
          )
        );

      const target = Block.calculateBlockTargetHash({ lastBlock });
      const { blockHeaders } = block;
      const { nonce } = blockHeaders;
      const truncatedBlockHeaders = { ...blockHeaders };
      delete truncatedBlockHeaders.nonce;
      const header = keccakHash(truncatedBlockHeaders);
      const underTargetHash = keccakHash(header + nonce);

      if (underTargetHash > target)
        return reject(
          new Error("The block does not meet the proof of work requirement")
        );

      Transaction.validateTransactionSeries({
        state,
        transactionSeries: block.transactionSeries,
      })
        .then(resolve)
        .catch(reject);
    });
  }

  static runBlock({ block, state }) {
    for (let transaction of block.transactionSeries) {
      Transaction.runTransaction({ transaction, state });
    }
  }
}

module.exports = Block;

// const block = Block.mineBlock({
//   lastBlock: Block.genesis(),
//   beneficiary: "foo",
// });

// console.log("block", block);
