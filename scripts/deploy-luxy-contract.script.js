const hre = require("hardhat");

async function main() {

  // We get the contract to deploy
  const LuxyTest = await hre.ethers.getContractFactory("LuxyTest");
  const LXT = await LuxyTest.deploy();

  await LXT.deployed();

  console.log("LuxyTest deployed to:", LXT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
