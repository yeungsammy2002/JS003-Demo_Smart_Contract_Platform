const Blockchain = require("./blockchain");
const { sortCharacters } = require("./util");

const blockchain = new Blockchain();

const str = JSON.stringify(blockchain);
// console.log(str);

const sortedStr = sortCharacters(blockchain);
// console.log(sortedStr);

// console.log(parseInt("f".repeat(64), 16));
// console.log(parseInt("f".repeat(64), 16).toString(16));
// console.log(parseInt("f".repeat(64), 16).toString(16).length);
