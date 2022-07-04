const { GENESIS_DATA, MINE_RATE } = require("../config");
const { keccakHash } = require("../util");

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
  constructor({ blockHeaders }) {
    // constructor input is an object with single field rather
    // the fields of arguments because we use objects more often
    // than inputs, makes code more readable in JS
    this.blockHeaders = blockHeaders;
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
    const { difficulty } = lastBlock.blockHeaders;
    if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE)
      return difficulty - 1;

    if (difficulty < 1) return 1;

    return difficulty + 1;
  }

  static mineBlock({ lastBlock, beneficiary }) {
    const target = Block.calculateBlockTargetHash({ lastBlock });
    let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

    do {
      timestamp = Date.now();
      truncatedBlockHeaders = {
        parentHash: keccakHash(lastBlock.blockHeaders),
        beneficiary,
        difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
        number: lastBlock.blockHeaders.number + 1,
        timestamp,
      };
      header = keccakHash(truncatedBlockHeaders);
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

      underTargetHash = keccakHash(header + nonce);
    } while (underTargetHash > target);

    // console.log("underTargetHash", underTargetHash);
    // console.log("target", target);

    return new this({
      blockHeaders: { ...truncatedBlockHeaders, nonce },
    });
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }
}

module.exports = Block;

// const block = Block.mineBlock({
//   lastBlock: Block.genesis(),
//   beneficiary: "foo",
// });

// console.log("block", block);
