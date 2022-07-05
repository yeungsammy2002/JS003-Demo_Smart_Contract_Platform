const Transaction = require("./index");
const Account = require("../account");

describe("Transaction", () => {
  let standardTransaction, createAccountTransaction;

  beforeEach(() => {
    account = new Account();
    standardTransaction = Transaction.createTransaction({
      account,
      to: "foo-recipient",
      value: 50,
    });
    createAccountTransaction = Transaction.createTransaction({
      account,
    });
  });

  describe("validateCreateAccountTransaction()", () => {
    it("validates a valid transaction", () => {
      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
        })
      ).resolves;
    });

    it("does not validate a malformed transaction", () => {
      standardTransaction.to = "different-recipient";

      expect(
        Transaction.validateStandardTransaction({
          transaction: standardTransaction,
        })
      ).rejects.toMatchObject({ message: /invalid/ });
    });
  });

  describe("validateCreateAccountTransaction()", () => {
    it("validates a create account transaction", () => {
      expect(
        Transaction.validateCreateAccountTransaction({
          transaction: createAccountTransaction,
        })
      ).resolves;
    });
    it("does not validate a non create account transaction", () => {
      expect(
        Transaction.validateCreateAccountTransaction({
          transaction: standardTransaction,
        })
      ).rejects.toMatchObject({ message: /incorrect/ });
    });
  });
});
