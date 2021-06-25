const hre = require("hardhat");

async function main() {

  // We get the contract to deploy
  const LuxyTest = await hre.ethers.getContractFactory("LuxyTest");
  const Deployment = await LuxyTest.attach("")

  const Mint = await Deployment.MintNFT("", "https://opensea-creatures-api.herokuapp.com/api/creature/3");

  console.log("NFT deployed to:", Mint);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
