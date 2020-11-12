var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "ability banner build exit biology width diet theme concert hello fiction radio";

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
