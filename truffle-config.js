var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "Ganache or Metamask";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 40);
      },
      network_id: '*',
      gas: 6500000
    },
    develop: {
        accounts: 20,
        defaultEtherBalance: 500,
        gas: 9999999
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};
