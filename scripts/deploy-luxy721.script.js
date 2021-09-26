
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const ERC721Luxy = await ethers.getContractFactory('ERC721Luxy');
    // Deploy contract proxy
    const ProxyLuxy721Factory = await upgrades.deployProxy(ERC721Luxy, ["ERC721Luxy", "LUXY", "ipfs:/"], { initializer: '__ERC721Luxy_init' });
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxy721Factory.deployed();
    // Log the address
    console.log('ProxyLuxy721Factory deployed at', ProxyLuxy721Factory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });