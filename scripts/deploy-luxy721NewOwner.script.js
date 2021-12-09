
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const ERC721Luxy = await ethers.getContractFactory('ERC721Luxy');
    // Deploy contract proxy
    const ProxyLuxy721Factory = await upgrades.deployProxy(ERC721Luxy, ["Open Test721", "T721", ""], { initializer: '__ERC721Luxy_init' });
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxy721Factory.deployed();
    await ProxyLuxy721Factory.transferOwnership('0x6ae23169D0809c5727f7bB1bF59335DbF9748fdd');

    // Log the address
    console.log('ProxyLuxy721Factory deployed at', ProxyLuxy721Factory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });