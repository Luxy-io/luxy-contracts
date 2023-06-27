require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");



const dotenv = require('dotenv');
dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("debug", "Check transaction info", async (taskArgs, hre) => {
  const trace = await hre.network.provider.send("debug_traceTransaction", [
    "insertTXID",
    {
      disableMemory: true,
      disableStack: true,
      disableStorage: true,
    },
  ]);
  for (const ev of trace.structLogs) {
    console.log(ev);
  }
}
);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  gasReporter: {
    currency: 'USD',
    gasPrice: 21,
    enabled: false,
    coinmarketcap: '461b583a-25cd-4e9d-9c8a-8955b4183b00',
    token: 'AVAX'
  },
  solidity: {
    version: '0.8.2',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      gasPrice: 80000000000,
      gasMultiplier: 100
    },
    goerli: {
      url:
        process.env.GOERLI_ENDPOINT,
      accounts: [process.env.ACCOUNT_DEPLOY_TESTNET],
      gasPrice: "auto",
      gasMultiplier: 10
    },
    // rinkeby: {
    //   url:
    //     process.env.RINKEBY_ENDPOINT,
    //   accounts: [process.env.ACCOUNT_PK],
    //   gasPrice: "auto",
    // },
    mumbai: {
      url:
        process.env.MUMBAI_ENDPOINT,
      accounts: [process.env.ACCOUNT_DEPLOY_TESTNET],
      gasPrice: "auto",
      gasMultiplier: 10
    },
    // bedrock: {
    //   url:
    //     process.env.BEDROCK_ENDPOINT,
    //   accounts: [process.env.ACCOUNT_DEPLOY_TESTNET],
    //   gasPrice: "auto",
    //   gasMultiplier: 10
    // },
    // rollux: {
    //   url:
    //     process.env.ROLLUX_ENDPOINT,
    //   accounts: [process.env.ACCOUNT_DEPLOY_TESTNET],
    //   gasPrice: "auto",
    //   gasMultiplier: 10
    // },
    // rolluxMainnet: {
    //   url:
    //     process.env.ROLLUX_MAINNET_ENDPOINT,
    //   accounts: [process.env.ACCOUNT_MKTCORE],
    //   gasPrice: "auto",
    //   gasMultiplier: 10
    // },
    // kovan: {
    //   url:
    //     process.env.KOVAN_ENDPOINT,
    //   accounts: [process.env.DEPLOY_TEST_ACCOUNT_PRIVATE_KEY],
    // },
    // bsc_testnet: {
    //   url: process.env.BSC_TESTNET_ENDPOINT,
    //   chainId: 97,
    //   gasPrice: 20000000000,
    //   accounts: [process.env.DEPLOY_TEST_ACCOUNT_PRIVATE_KEY],
    // },
    // bsc_mainnet: {
    //   url: process.env.BSC_ENDPOINT,
    //   chainId: 56,
    //   gasPrice: 20000000000,
    //   accounts: [process.env.DEPLOY_TEST_ACCOUNT_PRIVATE_KEY],
    // },
    // mainnet: {
    //   url: process.env.MAINNET_ENDPOINT,
    //   accounts: [process.env.ACCOUNT_PK_ETH],
    // },
    // polygon: {
    //   url: process.env.POLYGON_ENDPOINT,
    //   accounts: [process.env.DEPLOY_COLLECTIONS_ACCOUNT_PRIVATE_KEY],
    //   gasPrice: 80000000000,
    // },
    syscoin: {
      url: process.env.SYSCOIN_ENDPOINT,
      accounts: [process.env.ACCOUNT_PK],
      gasPrice: "auto",
      hardfork: "london",
      gasMultiplier: 10,
      timeout: 9000000,
    },
    tanenbaum: {
      chainId: 5700,
      url: process.env.TANENBAUM_ENDPOINT,
      accounts: [process.env.ACCOUNT_PK],
      gasPrice: "auto",
      hardfork: "london",
      gasMultiplier: 10,
      timeout: 9000000
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};
