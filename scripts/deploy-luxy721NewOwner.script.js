
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const ERC721Luxy = await ethers.getContractFactory('ERC721Luxy');
    // Deploy contract proxy
    const ProxyLuxy721Factory = await upgrades.deployProxy(ERC721Luxy, ["Curated Collection", "NIN", ""], { initializer: '__ERC721Luxy_init' });
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxy721Factory.deployed();
    await ProxyLuxy721Factory.transferOwnership('0x5f2c4eCde93Bb968FcC2ABBC97D2d18258Bf4A62');

    // Log the address
    console.log('ProxyLuxy721Factory deployed at', ProxyLuxy721Factory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });