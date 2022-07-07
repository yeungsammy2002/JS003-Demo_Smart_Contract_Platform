const Trie = require("./trie");

describe("Trie", () => {
  let trie;
  beforeEach(() => {
    trie = new Trie();
  });
  it("has a rootHash", () => {
    expect(trie.rootHash).not.toBe(undefined);
  });
});
