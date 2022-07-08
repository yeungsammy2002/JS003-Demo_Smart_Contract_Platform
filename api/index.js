const express = require("express");
const request = require("request");
const Account = require("../account");
const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");
const PubSub = require("./pubsub");
const State = require("../store/state");
const Transaction = require("../transaction");
const TransactionQueue = require("../transaction/transaction-queue");

const app = express();
app.use(express.json());

const state = new State();
const blockchain = new Blockchain({ state });
const transactionQueue = new TransactionQueue();
const pubsub = new PubSub({ blockchain, transactionQueue });
const account = new Account();
const transaction = Transaction.createTransaction({ account });

// transactionQueue.add(transaction);

// console.log(
//   "transactionQueue.getTransactionSeries()",
//   transactionQueue.getTransactionSeries()
// );
setTimeout(() => {
  pubsub.broadcastTransaction(transaction);
}, 500);

app.get("/blockchain", (req, res, next) => {
  const { chain } = blockchain;
  res.json({ chain });
});

app.get("/blockchain/mine", (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const block = Block.mineBlock({
    lastBlock,
    beneficiary: account.address,
    transactionSeries: transactionQueue.getTransactionSeries(),
    stateRoot: state.getStateRoot(),
  });

  // block.blockHeaders.parentHash = "foo";

  blockchain
    .addBlock({ block, transactionQueue })
    .then(() => {
      pubsub.broadcastBlock(block);
      res.json({ block });
    })
    .catch(next);
});

app.post("/account/transact", (req, res, next) => {
  const { to, value } = req.body;
  const transaction = Transaction.createTransaction({
    account: !to ? new Account() : account,
    to,
    value,
  });
  // transactionQueue.add(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({ transaction });
});

app.get("/account/balance", (req, res, next) => {
  const { address } = req.query;
  const balance = Account.calculateBalance({
    address: address || account.address,
    state,
  });
  res.json({ balance });
});

app.use((err, req, res, next) => {
  console.error("Internal server error", err);
  res.status(500).json({ message: err.message });
});

const peer = process.argv.includes("--peer");

const PORT = peer ? Math.floor(2000 + Math.random() * 1000) : 3000;

if (peer) {
  request("http://localhost:3000/blockchain", (error, response, body) => {
    const { chain } = JSON.parse(body);
    // console.log("chain", chain);
    blockchain
      .replaceChain({ chain })
      .then(() => console.log("Synchronized blockchain with the root node"))
      .catch((error) => console.error("Synchronization error:", error.message));
  });
}

app.listen(PORT, () => {
  console.log(`listening at PORT: ${PORT}`);
});
