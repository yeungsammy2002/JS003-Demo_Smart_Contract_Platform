const PubNub = require("pubnub");
const uuid = require("uuid");
const Transaction = require("../transaction");

const credentials = {
  publishKey: "pub-c-7afd2b1c-af24-476c-bde0-6940c4bdc9ff",
  subscribeKey: "sub-c-f0b752b8-88b1-4e97-957d-f32223c84753",
  secretKey: "sec-c-MTg3MDE5MDktYjRlZi00ODk5LWE1NjctMGJmZjdhYzBkNDAy",
  uuid: uuid.v1(), // new requirement from PubNub
};

const CHANNELS_MAP = {
  TEST: "TEST",
  BLOCK: "BLOCK",
  TRANSACTION: "TRANSACTION",
};

class PubSub {
  constructor({ blockchain, transactionQueue }) {
    this.pubnub = new PubNub(credentials);
    this.blockchain = blockchain;
    this.transactionQueue = transactionQueue;
    this.subscribeToChannels();
    this.listen();
  }
  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: Object.values(CHANNELS_MAP),
    });
  }
  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }
  listen() {
    this.pubnub.addListener({
      message: (messageObject) => {
        const { channel, message } = messageObject;
        const parsedMessage = JSON.parse(message);
        console.log("Message received. Channel:", channel);
        switch (channel) {
          case CHANNELS_MAP.BLOCK:
            console.log("block message", message);
            this.blockchain
              .addBlock({
                block: parsedMessage,
                transactionQueue: this.transactionQueue,
              })
              .then(() => console.log("New block accepted", parsedMessage))
              .catch((error) =>
                console.error("New block rejected:", error.message)
              );
            break;
          case CHANNELS_MAP.TRANSACTION:
            console.log(`Received transaction: ${parsedMessage.id}`);
            this.transactionQueue.add(new Transaction(parsedMessage));
            // console.log(
            //   "this.transactionQueue.getTransactionSeries()",
            //   this.transactionQueue.getTransactionSeries()
            // );
            break;
          default:
            return;
        }
      },
    });
  }
  broadcastBlock(block) {
    this.publish({
      channel: CHANNELS_MAP.BLOCK,
      message: JSON.stringify(block),
    });
  }
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS_MAP.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;

// const pubsub = new PubSub();
// setTimeout(() => {
//   pubsub.publish({
//     channel: CHANNELS_MAP.TEST,
//     message: "foo",
//   });
// }, 1000);
