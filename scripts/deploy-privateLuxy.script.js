
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const ERC1155 = await ethers.getContractFactory('ERC1155LuxyPrivate');
    // Deploy contract proxy
    const ProxyLuxy1155Factory = await upgrades.deployProxy(ERC1155, ["Test Priv 1155", "T1155", ""], { initializer: '__ERC1155Luxy_init' });
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxy1155Factory.deployed();
    // Log the address
    await ProxyLuxy1155Factory.transferOwnership('0x6ae23169D0809c5727f7bB1bF59335DbF9748fdd');

    console.log('ProxyLuxy1155Factory deployed at', ProxyLuxy1155Factory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });