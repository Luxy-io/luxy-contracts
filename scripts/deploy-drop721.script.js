
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const ERC721LuxyDrop = await ethers.getContractFactory('ERC721LuxyDrop');
    // Deploy contract proxy
    const ProxyLuxy721DropFactory = await upgrades.deployProxy(
        ERC721LuxyDrop,
        ["", "0x6ae23169D0809c5727f7bB1bF59335DbF9748fdd", "0xe3A66dc52Af65E9333c608A85bB5F3042B1e41Ef"],
        { initializer: '__ERC721LuxyDrop_init' }
    );
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxy721DropFactory.deployed();
    // Log the address
    console.log('ProxyLuxy721DropFactory deployed at', ProxyLuxy721DropFactory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });