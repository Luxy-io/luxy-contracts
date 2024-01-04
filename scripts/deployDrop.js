const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract 
    const ERC721LuxyDrop = await ethers.getContractFactory('ERC721LuxyDrop');
    // Deploy contract proxy
    const ProxyLuxy721Drop = await upgrades.deployProxy(ERC721LuxyDrop, ["", "0x1450356b2feca37325199379dD583C4A729D19A0", "0x2E56fa532330f232D97d263b7d22deb3aB6354aD"], { initializer: '__ERC721LuxyDrop_init' });
    console.log('Deploying contract');
    // Wait for campaign  deploy success
    await ProxyLuxy721Drop.deployed();
    await ProxyLuxy721Drop.transferOwnership('0xFC6e0F952B2603669E5D39A9CA2DD7BD1c89184a');

    // Log the address
    console.log('Drop deployed at', ProxyLuxy721Drop.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });