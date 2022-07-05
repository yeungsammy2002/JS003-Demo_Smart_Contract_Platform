const keccak256 = require("js-sha3").keccak256;
const EC = require("elliptic").ec;

const ec = new EC("secp256k1");

const sortCharacters = (data) => {
  // sortCharacters is used to return the same string even if the object has
  // properties in a different order
  return JSON.stringify(data).split("").sort().join("");
};

const keccakHash = (data) => {
  const hash = keccak256.create();
  hash.update(sortCharacters(data));
  return hash.hex();
};

module.exports = { sortCharacters, keccakHash, ec };
