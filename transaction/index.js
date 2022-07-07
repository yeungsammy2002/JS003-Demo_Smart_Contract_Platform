const uuid = require("uuid");
const Account = require("../account");

const TRANSACTION_TYPE_MAP = {
  CREATE_ACCOUNT: "CREATE_ACCOUNT",
  TRANSACT: "TRANSACT",
};

class Transaction {
  constructor({ id, from, to, value, data, signature }) {
    this.id = id || uuid.v4();
    this.from = from || "-";
    this.to = to || "-";
    this.value = value || 0;
    this.data = data || "-";
    this.signature = signature || "-";
  }

  static createTransaction({ account, to, value }) {
    if (to) {
      const transactionData = {
        id: uuid.v4(),
        from: account.address,
        to,
        value,
        data: { type: TRANSACTION_TYPE_MAP.TRANSACT },
      };

      return new Transaction({
        ...transactionData,
        signature: account.sign(transactionData),
      });
    }

    return new Transaction({
      data: {
        type: TRANSACTION_TYPE_MAP.CREATE_ACCOUNT,
        accountData: account.toJSON(),
      },
    });
  }

  static validateStandardTransaction({ transaction }) {
    return new Promise((resolve, reject) => {
      const { from, signature } = transaction;
      const transactionData = { ...transaction };
      delete transactionData.signature;

      if (
        !Account.verifySignature({
          publicKey: from,
          data: transactionData,
          signature,
        })
      ) {
        return reject(new Error(`Transaction: ${id} signature is invalid`));
      }

      return resolve();
    });
  }

  static validateCreateAccountTransaction({ transaction }) {
    return new Promise((resolve, reject) => {
      const expectedAccountDataFields = Object.keys(new Account().toJSON());
      const fields = Object.keys(transaction.data.accountData);

      if (fields.length !== expectedAccountDataFields.length) {
        return reject(
          new Error(
            `The transaction account data has an incorrect number of fields`
          )
        );
      }
      fields.forEach((field) => {
        if (!expectedAccountDataFields.includes(field)) {
          return reject(
            new Error(`The field: ${field}, is unexpected for account data`)
          );
        }
      });

      return resolve();
    });
  }
}

module.exports = Transaction;

// const account = new Account();
// const transact_transaction = Transaction.createTransaction({
//   account,
//   to: "foo-recipient",
//   value: 50,
// });
// console.log("TRANSACT - transaction", transact_transaction);

// const create_transaction = Transaction.createTransaction({
//   account,
// });
// console.log("CREATE - transaction", create_transaction);
