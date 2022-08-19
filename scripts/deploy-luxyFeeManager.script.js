
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const LUXYFeeManager = await ethers.getContractFactory('LuxyLaunchpadFeeManager');
    // Deploy contract proxy
    const FeeManagerFactory = await upgrades.deployProxy(LUXYFeeManager, [50, '0x6ae23169D0809c5727f7bB1bF59335DbF9748fdd'], { initializer: '__LuxyLaunchpadFeeManager_init' });
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await FeeManagerFactory.deployed();
    // Log the address
    console.log('FeeManagerFactory deployed at', FeeManagerFactory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });