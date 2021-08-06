const hre = require("hardhat");
const secrets = require('../secrets.json');
const fs = require('fs-extra')
// async function main() {
//     const [deployer] = await ethers.getSigners();
//     console.log(secrets)
//     console.log("Deploying contracts with the account:", deployer.address);
  
//     console.log("Account balance:", (await deployer.getBalance()).toString());
  
//     const ERC721Luxy = await ethers.getContractFactory("ERC721Luxy");
//     const luxy_nft = await ERC721Luxy.deploy();
//     await luxy_nft.deployed();
//     console.log("Luxy proxy address:", luxy_nft.address);

//   }
  
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });
const main = async () => {
  // Config for platform

  const ContractFactory = await ethers.getContractFactory('ERC721Luxy');
  // Deploy contract proxy
  const ProxyContractFactory = await upgrades.deployProxy(ContractFactory, ["Luxy", "LUXY"],  { initializer: '__ERC721Luxy_init' });
  console.log('Deploying contract');
  // Wait for Contract factory deploy success
  await ProxyContractFactory.deployed();
  // Log the address
  console.log('ProxyContractFactory deployed at', ProxyContractFactory.address);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });