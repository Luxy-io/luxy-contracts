const { ethers, upgrades } = require('hardhat');
const dotenv = require('dotenv');
dotenv.config();
const main = async () => {

    const RoyaltiesRegistry = await ethers.getContractFactory('RoyaltiesRegistry');
    const luxyAddress = "0xBE9C4d60A04eEA160d5CF33A89a1DD29e9625f21";
    const Luxy = await ethers.getContractAt('Luxy', luxyAddress);
    royaltiesRegistry = await upgrades.deployProxy(
        RoyaltiesRegistry,
        [],
        { initializer: '__RoyaltiesRegistry_init' }
    );

    console.log('RoyaltiesRegistry', royaltiesRegistry.address);
    
    const owner = await Luxy.owner();
    console.log(owner)
    await Luxy.setRoyaltiesRegistry(royaltiesRegistry.address);
    console.log("done");
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });