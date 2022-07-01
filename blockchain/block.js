const { GENESIS_DATA } = require("../config");

class Block {
  constructor({ blockHeaders }) {
    // constructor input is an object with single field rather
    // the fields of arguments because we use objects more often
    // than inputs, makes code more readable in JS
    this.blockHeaders = blockHeaders;
  }

  static mineBlock({ lastBlock }) {}

  static genesis() {
    return new this(GENESIS_DATA);
  }
}

module.exports = Block;
