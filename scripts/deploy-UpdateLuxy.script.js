const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const Luxy = await ethers.getContractFactory('Luxy');
    // Deploy contract proxy
    const luxyUpgrade = await upgrades.upgradeProxy('0x297d6679a71087a089d98606dfa06fb4ca2b2b7c', Luxy);
    console.log('Deploying contract', luxyUpgrade);
    // Wait for campaign factory deploy success
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });