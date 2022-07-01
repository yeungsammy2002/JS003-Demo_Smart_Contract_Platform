const Blockchain = require("./blockchain");
const { sortCharacters } = require("./util");

const blockchain = new Blockchain();

const str = JSON.stringify(blockchain);
// console.log(str);

const sortedStr = sortCharacters(blockchain);
// console.log(sortedStr);
