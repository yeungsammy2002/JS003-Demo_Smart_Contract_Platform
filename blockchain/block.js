const { GENESIS_DATA } = require("../config");
const { keccakHash } = require("../util");

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);

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
    if (value.length > HASH_LENGTH) {
      // if MAX_HASH_VALUE / 1, value may become 65 characters hex string
      // the conversion process end up adding a number internally within JS
      // here is forcing the result to 64 "f" repeated characters
      return "f".repeat(HASH_LENGTH);
    }
    return "0".repeat(HASH_LENGTH - value.length) + value;
    // same as - value.padStart(64, "0")
  }

  static mineBlock({ lastBlock, beneficiary }) {
    const target = Block.calculateBlockTargetHash({ lastBlock });
    let timestamp, truncatedBlockHeaders, header, nonce;
    timestamp = Date.now();
    truncatedBlockHeaders = {
      parentHash: keccakHash(lastBlock.blockHeaders),
      beneficiary,
      difficulty: lastBlock.blockHeaders.difficulty + 1,
      number: lastBlock.blockHeaders.number + 1,
      timestamp,
    };
    header = keccakHash(truncatedBlockHeaders);
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }
}

module.exports = Block;
