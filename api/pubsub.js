const PubNub = require("pubnub");
const uuid = require("uuid");

const credentials = {
  publishKey: "pub-c-7afd2b1c-af24-476c-bde0-6940c4bdc9ff",
  subscribeKey: "sub-c-f0b752b8-88b1-4e97-957d-f32223c84753",
  secretKey: "sec-c-MTg3MDE5MDktYjRlZi00ODk5LWE1NjctMGJmZjdhYzBkNDAy",
  uuid: uuid.v1(), // new requirement from PubNub
};

const CHANNELS_MAP = {
  TEST: "TEST",
  BLOCK: "BLOCK",
};

class PubSub {
  constructor({ blockchain }) {
    this.pubnub = new PubNub(credentials);
    this.blockchain = blockchain;
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
              .addBlock({ block: parsedMessage })
              .then(() => console.log("New block accepted"))
              .catch((error) =>
                console.error("New block rejected:", error.message)
              );
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
}

module.exports = PubSub;

// const pubsub = new PubSub();
// setTimeout(() => {
//   pubsub.publish({
//     channel: CHANNELS_MAP.TEST,
//     message: "foo",
//   });
// }, 1000);
