// require("@nomiclabs/hardhat-waffle");
// require('@nomiclabs/hardhat-ethers');
// require('@openzeppelin/hardhat-upgrades');
// require("@nomiclabs/hardhat-truffle5");

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// // You need to export an object to set up your config
// // Go to https://hardhat.org/config/ to learn more

// /**
//  * @type import('hardhat/config').HardhatUserConfig
//  */
// module.exports = {
//   solidity: "0.8.4",
// };

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require('@nomiclabs/hardhat-ethers');
 require("@nomiclabs/hardhat-truffle5");
 require('@openzeppelin/hardhat-upgrades');
 require("@nomiclabs/hardhat-etherscan");

 const { alchemyApiKey, mnemonic, apiKey ,apiKeyPolygon } = require('./secrets.json');

module.exports = {
  networks: {
         rinkeby: {
           url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
           accounts: { mnemonic: mnemonic },
         },
         mumbai : {
           url: `https://polygon-mumbai.g.alchemy.com/v2/q4ZVIGwwKYmIdt30HZ9NHNV0YdXBCYo6`,
            accounts : {mnemonic: mnemonic}
        }
       },
  solidity: "0.8.4",
  etherscan: {
    apiKey: apiKeyPolygon,
  },

};
