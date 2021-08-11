
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const ERC1155 = await ethers.getContractFactory('ERC1155Luxy');
    // Deploy contract proxy
    const ProxyCampaignFactory = await upgrades.deployProxy(ERC1155, ["ERC1155Luxy", "LUXY", "ipfs:/"], { initializer: '__ERC1155Luxy_init' });
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyCampaignFactory.deployed();
    // Log the address
    console.log('ProxyCampaignFactory deployed at', ProxyCampaignFactory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });